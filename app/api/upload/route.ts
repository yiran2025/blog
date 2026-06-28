import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { generateUploadUrl, generateFileKey, getR2PublicUrl } from "@/lib/r2-client";
import { getDb } from "@/lib/db";
import { media as mediaSchema } from "@/drizzle/schema";

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

    // Record in database
    try {
      const db = getDb();
      await db.insert(mediaSchema).values({
        filename,
        url: publicUrl,
        size: 0,
        mimeType: contentType,
        uploadedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      // Non-critical: upload URL is still valid
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
