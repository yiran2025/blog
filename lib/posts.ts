import { eq, desc, and, lt, gt, sql as drizzleSql } from "drizzle-orm";
import * as schema from "@/drizzle/schema";

// Types
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  coverImage: string;
  isPublished: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  coverImage: string;
  viewCount: number;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  category: string;
  isPublished: boolean;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  coverImage?: string;
  isPublished?: boolean;
}

function extractCoverImage(content: string): string {
  // Try Markdown image syntax: ![alt](url)
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) return mdMatch[1];

  // Try HTML img tag
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/);
  if (htmlMatch) return htmlMatch[1];

  return "";
}

// Get all posts with optional category filter and pagination
export async function getPosts(
  db: any,
  options: {
    category?: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
  } = {}
) {
  const { category, page = 1, limit = 12, publishedOnly = true } = options;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (publishedOnly) {
    conditions.push(eq(schema.posts.isPublished, 1));
  }
  if (category && category !== "全部") {
    conditions.push(eq(schema.posts.category, category));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        slug: schema.posts.slug,
        content: schema.posts.content,
        category: schema.posts.category,
        coverImage: schema.posts.coverImage,
        viewCount: schema.posts.viewCount,
        createdAt: schema.posts.createdAt,
      })
      .from(schema.posts)
      .where(where)
      .orderBy(desc(schema.posts.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: drizzleSql<number>`count(*)` })
      .from(schema.posts)
      .where(where),
  ]);

  const total = Number(countResult[0]?.count || 0);

  return {
    posts: items as PostListItem[],
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

// Get single post by slug
export async function getPostBySlug(db: any, slug: string): Promise<Post | null> {
  const results = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.slug, slug))
    .limit(1);

  return results[0] || null;
}

// Get single post by id
export async function getPostById(db: any, id: number): Promise<Post | null> {
  const results = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, id))
    .limit(1);

  return results[0] || null;
}

// Create a new post
export async function createPost(db: any, input: CreatePostInput): Promise<Post> {
  const coverImage = extractCoverImage(input.content);
  const now = new Date().toISOString();

  const result = await db.insert(schema.posts).values({
    title: input.title,
    slug: input.slug,
    content: input.content,
    category: input.category,
    coverImage: coverImage || `https://picsum.photos/seed/${input.slug}/800/400`,
    isPublished: input.isPublished ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.lastInsertRowid as number,
    title: input.title,
    slug: input.slug,
    content: input.content,
    category: input.category,
    coverImage: coverImage || `https://picsum.photos/seed/${input.slug}/800/400`,
    isPublished: input.isPublished ? 1 : 0,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

// Update a post
export async function updatePost(
  db: any,
  id: number,
  input: UpdatePostInput
): Promise<Post | null> {
  const existing = await getPostById(db, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updateData: any = { updatedAt: now };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.content !== undefined) {
    updateData.content = input.content;
    updateData.coverImage = extractCoverImage(input.content) || existing.coverImage;
  }
  if (input.category !== undefined) updateData.category = input.category;
  if (input.coverImage !== undefined) updateData.coverImage = input.coverImage;
  if (input.isPublished !== undefined) updateData.isPublished = input.isPublished ? 1 : 0;

  await db
    .update(schema.posts)
    .set(updateData)
    .where(eq(schema.posts.id, id));

  return getPostById(db, id);
}

// Delete a post
export async function deletePost(db: any, id: number): Promise<boolean> {
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  return true;
}

// Increment view count
export async function incrementViewCount(db: any, postId: number, ip?: string): Promise<void> {
  // Record the view
  const now = new Date().toISOString();
  await db.insert(schema.views).values({
    postId,
    ip: ip || "",
    viewedAt: now,
  });

  // Increment the counter
  await db
    .update(schema.posts)
    .set({ viewCount: drizzleSql<number>`view_count + 1` })
    .where(eq(schema.posts.id, postId));
}

// Get hot posts
export async function getHotPosts(db: any, limit: number = 5): Promise<PostListItem[]> {
  return db
    .select({
      id: schema.posts.id,
      title: schema.posts.title,
      slug: schema.posts.slug,
      content: schema.posts.content,
      category: schema.posts.category,
      coverImage: schema.posts.coverImage,
      viewCount: schema.posts.viewCount,
      createdAt: schema.posts.createdAt,
    })
    .from(schema.posts)
    .where(eq(schema.posts.isPublished, 1))
    .orderBy(desc(schema.posts.viewCount))
    .limit(limit);
}

// Get adjacent posts (prev/next)
export async function getAdjacentPosts(db: any, currentCreatedAt: string) {
  const [prev] = await db
    .select({
      title: schema.posts.title,
      slug: schema.posts.slug,
    })
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.isPublished, 1),
        lt(schema.posts.createdAt, currentCreatedAt)
      )
    )
    .orderBy(desc(schema.posts.createdAt))
    .limit(1);

  const [next] = await db
    .select({
      title: schema.posts.title,
      slug: schema.posts.slug,
    })
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.isPublished, 1),
        gt(schema.posts.createdAt, currentCreatedAt)
      )
    )
    .orderBy(schema.posts.createdAt)
    .limit(1);

  return { prev: prev || null, next: next || null };
}

// Get stats
export async function getStats(db: any) {
  const [postCount] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(schema.posts)
    .where(eq(schema.posts.isPublished, 1));

  const [totalViews] = await db
    .select({ total: drizzleSql<number>`COALESCE(SUM(view_count), 0)` })
    .from(schema.posts);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [todayViews] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(schema.views)
    // @ts-ignore
    .where(drizzleSql`${schema.views.viewedAt} >= ${todayStr}`);

  const [mediaCount] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(schema.media);

  return {
    totalPosts: Number(postCount?.count || 0),
    totalViews: Number(totalViews?.total || 0),
    todayViews: Number(todayViews?.count || 0),
    totalMedia: Number(mediaCount?.count || 0),
  };
}

// Get all posts for admin (including drafts)
export async function getAllPostsAdmin(
  db: any,
  options: { page?: number; limit?: number } = {}
) {
  return getPosts(db, { ...options, publishedOnly: false });
}
