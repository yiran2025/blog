import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPosts, createPost } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";
import { generateSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const result = await getPosts(db, { category, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const body: { title: string; content: string; category: string; isPublished?: boolean; slug?: string } = await request.json();
    const { title, content, category, isPublished } = body;
    let { slug } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "标题、内容和分类为必填项" },
        { status: 400 }
      );
    }

    if (!slug) {
      slug = generateSlug(title);
    }

    const post = await createPost(db, {
      title,
      slug,
      content,
      category,
      isPublished: isPublished || false,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
