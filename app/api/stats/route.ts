import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getStats } from "@/lib/posts";
import { listR2Objects } from "@/lib/r2-client";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const stats = await getStats(db);

    // Get R2 storage usage
    let r2StorageBytes = 0;
    try {
      const objects = await listR2Objects();
      r2StorageBytes = objects.reduce((sum, obj) => sum + obj.size, 0);
    } catch (r2Error) {
      console.error("Failed to get R2 stats:", r2Error);
    }

    return NextResponse.json({
      ...stats,
      r2StorageBytes,
      r2StorageFormatted: formatBytes(r2StorageBytes),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
