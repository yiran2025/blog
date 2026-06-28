import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if we can access Cloudflare bindings
    const sym = Symbol.for("__cloudflare-context__");
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, sym as any);
    const ctx = descriptor?.get?.call(globalThis);

    // Check for D1
    const hasDB = !!(ctx?.env?.DB);
    const dbType = ctx?.env?.DB ? typeof ctx.env.DB : "undefined";

    // Check for R2
    const hasR2 = !!(ctx?.env?.R2);

    // Check env vars
    const envVars = {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? "set" : "missing",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "set" : "missing",
      R2_ENDPOINT: process.env.R2_ENDPOINT ? "set" : "missing",
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? "set" : "missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "missing",
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? "set" : "missing",
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? "set" : "missing",
    };

    return NextResponse.json({
      ok: true,
      context: !!ctx,
      env: !!ctx?.env,
      DB: hasDB,
      DB_type: dbType,
      R2: hasR2,
      envVars,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
