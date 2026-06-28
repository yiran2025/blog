/// <reference types="@cloudflare/workers-types" />
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getEnv() {
  return getCloudflareContext().env as unknown as Record<string, unknown>;
}

export function getR2PublicUrl(key: string): string {
  const publicUrl = (process.env as any).R2_PUBLIC_URL || "";
  if (!publicUrl) {
    const endpoint = (process.env as any).R2_ENDPOINT || "";
    const bucket = (process.env as any).R2_BUCKET_NAME || "my-blog-media";
    return `${endpoint}/${bucket}/${key}`;
  }
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export function generateFileKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${timestamp}-${random}-${sanitized}`;
}

export async function uploadToR2(
  key: string,
  body: ArrayBuffer | ReadableStream | Uint8Array,
  contentType: string
): Promise<string> {
  const env = getEnv();
  if (!env.R2) throw new Error("R2 binding not available");
  await (env.R2 as any).put(key, body, { httpMetadata: { contentType } });
  return getR2PublicUrl(key);
}

export async function listR2Objects(
  prefix?: string,
  maxKeys?: number
): Promise<{ key: string; size: number }[]> {
  try {
    const env = getEnv();
    if (!env.R2) return [];
    const result = await (env.R2 as any).list({ prefix, limit: maxKeys || 1000 });
    return (result.objects || []).map((obj: any) => ({
      key: obj.key || "",
      size: obj.size || 0,
    }));
  } catch {
    return [];
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  const env = getEnv();
  if (!env.R2) return;
  await (env.R2 as any).delete(key);
}
