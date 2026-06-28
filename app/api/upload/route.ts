import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { generateFileKey, getR2PublicUrl } from "@/lib/r2-client";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.formData();
    const file = body.get("file") as File | null;

    if (!file) {
      // Also support JSON API for pre-signed URL approach
      const jsonBody: any = await request.clone().json().catch(() => null);
      if (jsonBody?.filename && jsonBody?.contentType) {
        const key = generateFileKey(jsonBody.filename);
        const publicUrl = getR2PublicUrl(key);
        return NextResponse.json({
          key,
          publicUrl,
          note: "Direct R2 upload not supported via pre-signed URL in Workers. Use FormData upload instead.",
        });
      }

      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    const key = generateFileKey(file.name);
    const buffer = await file.arrayBuffer();
    const contentType = file.type || "application/octet-stream";

    // Upload directly using R2 binding
    const { uploadToR2 } = await import("@/lib/r2-client");
    const publicUrl = await uploadToR2(key, buffer, contentType);

    // Record in database
    try {
      const db = getDb();
      const now = new Date().toISOString();
      await db
        .prepare(
          "INSERT INTO media (filename, url, size, mime_type, uploaded_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(file.name, publicUrl, file.size, contentType, now)
        .run();
    } catch (dbError) {
      console.error("Failed to record media in DB:", dbError);
    }

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
