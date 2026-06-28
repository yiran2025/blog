// R2 Client for Cloudflare Workers
// In Worker environment, R2 binding is available directly via env.R2
// S3 SDK (@aws-sdk/client-s3) is NOT compatible with Workers

// Get the Cloudflare bindings from OpenNext context
function getCloudflareEnv(): Record<string, unknown> | null {
  try {
    const sym = Symbol.for("__cloudflare-context__");
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, sym as any);
    if (descriptor?.get) {
      const ctx = descriptor.get.call(globalThis);
      if (ctx?.env) return ctx.env;
    }
  } catch {}
  return null;
}

export function getR2PublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL || "";
  if (!publicUrl) {
    const endpoint = process.env.R2_ENDPOINT || "";
    const bucket = process.env.R2_BUCKET_NAME || "my-blog-media";
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

// Upload directly using R2 binding (no S3 SDK needed)
export async function uploadToR2(
  key: string,
  body: ArrayBuffer | ReadableStream | Uint8Array,
  contentType: string
): Promise<string> {
  const env = getCloudflareEnv();
  if (!env?.R2) {
    throw new Error("R2 binding not available");
  }
  const r2 = env.R2 as any;
  await r2.put(key, body, {
    httpMetadata: { contentType },
  });
  return getR2PublicUrl(key);
}

// List R2 objects using R2 binding
export async function listR2Objects(
  prefix?: string,
  maxKeys?: number
): Promise<{ key: string; size: number }[]> {
  const env = getCloudflareEnv();
  if (!env?.R2) {
    return [];
  }
  try {
    const r2 = env.R2 as any;
    const result = await r2.list({
      prefix,
      limit: maxKeys || 1000,
    });
    return (result.objects || []).map((obj: any) => ({
      key: obj.key || "",
      size: obj.size || 0,
    }));
  } catch {
    return [];
  }
}

// Delete from R2 using binding
export async function deleteFromR2(key: string): Promise<void> {
  const env = getCloudflareEnv();
  if (!env?.R2) return;
  const r2 = env.R2 as any;
  await r2.delete(key);
}
