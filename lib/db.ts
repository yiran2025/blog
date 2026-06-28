/// <reference types="@cloudflare/workers-types" />
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

// Use React cache() to create a new client for each request
// This is the recommended pattern from OpenNext docs:
// https://opennext.js.org/cloudflare/howtos/db
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  const envObj = env as unknown as Record<string, unknown>;
  if (!envObj.DB) {
    throw new Error("D1 binding not found. Available: " + Object.keys(envObj).join(", "));
  }
  return envObj.DB as D1Database;
});

// For static routes (ISR/SSG), use the async version
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const envObj = env as unknown as Record<string, unknown>;
  if (!envObj.DB) {
    throw new Error("D1 binding not found. Available: " + Object.keys(envObj).join(", "));
  }
  return envObj.DB as D1Database;
});
