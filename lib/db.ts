import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/drizzle/schema";

// Get the Cloudflare bindings from OpenNext context
function getCloudflareEnv(): Record<string, unknown> | null {
  // OpenNext stores env in AsyncLocalStorage under this symbol
  const ctx = (globalThis as any)[Symbol.for("__cloudflare-context__")];
  return ctx?.env ?? null;
}

export function getDb() {
  const env = getCloudflareEnv();
  if (env?.DB) {
    return drizzle(env.DB as D1Database, { schema });
  }

  // Fallback for non-Cloudflare environments
  throw new Error(
    "D1 database binding not available. Ensure the DB binding is configured in wrangler.jsonc."
  );
}

export function getR2Binding() {
  const env = getCloudflareEnv();
  return env?.R2 ?? null;
}
