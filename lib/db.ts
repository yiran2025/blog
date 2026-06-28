import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/drizzle/schema";

// This function creates a drizzle instance from a D1 database binding
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Get D1 from Cloudflare Pages environment
export function getD1(): D1Database {
  // @ts-ignore - Cloudflare Pages provides this global
  if (typeof process !== "undefined" && process.env?.DB) {
    // @ts-ignore
    return process.env.DB;
  }
  throw new Error("D1 database not found. Ensure DB binding is configured.");
}

// For edge runtime, use the platform proxy
export function getDb() {
  // In Cloudflare Pages, DB is injected as a binding
  // @ts-ignore
  const d1 = (globalThis as any).__D1_DATA__?.DB || process.env?.DB;
  if (!d1) {
    // For local development, we'll use a proxy approach
    throw new Error(
      "D1 database not available. In local dev, use wrangler pages dev."
    );
  }
  return drizzle(d1 as D1Database, { schema });
}
