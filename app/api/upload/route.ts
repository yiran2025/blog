import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { generateUploadUrl, generateFileKey, getR2PublicUrl } from "@/lib/r2-client";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { filename, contentType }: { filename: string; contentType: string } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "文件名和内容类型为必填项" },
        { status: 400 }
      );
    }

    const key = generateFileKey(filename);
    const uploadUrl = await generateUploadUrl(key, contentType);
    const publicUrl = getR2PublicUrl(key);

    // Record in database using native D1
    try {
      const db = getDb();
      const now = new Date().toISOString();
      await db
        .prepare(
          "INSERT INTO media (filename, url, size, mime_type, uploaded_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(filename, publicUrl, 0, contentType, now)
        .run();
    } catch (dbError) {
      console.error("Failed to record media in DB:", dbError);
    }

    return NextResponse.json({
      uploadUrl,
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
