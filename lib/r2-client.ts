import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "my-blog-media";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "my-blog-media";

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

export async function listR2Objects(
  prefix?: string,
  maxKeys?: number
): Promise<{ key: string; size: number }[]> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "my-blog-media";

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys || 1000,
    })
  );

  return (
    response.Contents?.map((obj) => ({
      key: obj.Key || "",
      size: obj.Size || 0,
    })) || []
  );
}

export function getR2PublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL || "";
  if (!publicUrl) {
    // Fallback: construct URL from endpoint
    const endpoint = process.env.R2_ENDPOINT || "";
    const bucket = process.env.R2_BUCKET_NAME || "my-blog-media";
    // Extract account ID from endpoint
    const match = endpoint.match(/https?:\/\/([^.]+)\./);
    if (match) {
      return `${endpoint}/${bucket}/${key}`;
    }
  }
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export function generateFileKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${timestamp}-${random}-${sanitized}`;
}
