import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  incrementViewCount,
} from "@/lib/posts";
import { requireAdmin } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();
    const post = await getPostBySlug(db, slug);

    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    // Increment view count
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";
    await incrementViewCount(db, post.id, ip);

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await requireAdmin();
    const db = getDb();

    // The slug param could actually be an id
    const post = await getPostBySlug(db, slug);
    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    const body: import("@/lib/posts").UpdatePostInput = await request.json();
    const updated = await updatePost(db, post.id, body);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await requireAdmin();
    const db = getDb();

    const post = await getPostBySlug(db, slug);
    if (!post) {
      // Try as id
      const postById = await getPostById(db, parseInt(slug));
      if (!postById) {
        return NextResponse.json({ error: "文章不存在" }, { status: 404 });
      }
      await deletePost(db, postById.id);
      return NextResponse.json({ success: true });
    }

    await deletePost(db, post.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
