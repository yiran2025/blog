/// <reference types="@cloudflare/workers-types" />
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb() {
  const { env } = getCloudflareContext();
  const envObj = env as Record<string, unknown>;
  if (envObj.DB) {
    return envObj.DB as D1Database;
  }
  throw new Error("D1 binding not found. Available: " + Object.keys(envObj).join(", "));
}

export function getR2Binding() {
  const { env } = getCloudflareContext();
  return (env as Record<string, unknown>).R2 ?? null;
}
