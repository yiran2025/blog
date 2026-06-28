import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const envObj = env as Record<string, unknown>;

    return NextResponse.json({
      ok: true,
      DB: !!envObj.DB,
      DB_type: envObj.DB ? typeof envObj.DB : "undefined",
      R2: !!envObj.R2,
      envKeys: Object.keys(envObj),
      envVars: {
        ADMIN_USERNAME: process.env.ADMIN_USERNAME ? "set" : "missing",
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "set" : "missing",
        SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "missing",
        R2_ENDPOINT: process.env.R2_ENDPOINT ? "set" : "missing",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
