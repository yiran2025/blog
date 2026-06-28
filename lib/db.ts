/// <reference types="@cloudflare/workers-types" />

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

export function getDb(): D1Database {
  const env = getCloudflareEnv();

  if (env?.DB) {
    return env.DB as D1Database;
  }

  throw new Error(
    "D1 binding not found. Available: " +
      (env ? Object.keys(env).join(", ") : "none")
  );
}

export function getR2Binding() {
  const env = getCloudflareEnv();
  return env?.R2 ?? null;
}
