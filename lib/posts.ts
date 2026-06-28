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
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/);
  if (htmlMatch) return htmlMatch[1];
  return "";
}

function rowToPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    category: row.category,
    coverImage: row.cover_image || "",
    isPublished: row.is_published,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get all posts with optional category filter and pagination
export async function getPosts(
  db: D1Database,
  options: {
    category?: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
  } = {}
) {
  const { category, page = 1, limit = 12, publishedOnly = true } = options;
  const offset = (page - 1) * limit;

  let whereClause = "";
  const params: any[] = [];

  if (publishedOnly) {
    whereClause += " WHERE is_published = 1";
  }

  if (category && category !== "全部") {
    whereClause += (whereClause ? " AND" : " WHERE") + " category = ?";
    params.push(category);
  }

  const countResult = await db
    .prepare(`SELECT count(*) as count FROM posts${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  const rows = await db
    .prepare(
      `SELECT id, title, slug, content, category, cover_image, view_count, created_at
       FROM posts${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all<{
      id: number;
      title: string;
      slug: string;
      content: string;
      category: string;
      cover_image: string;
      view_count: number;
      created_at: string;
    }>();

  const posts: PostListItem[] = (rows.results || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    content: r.content,
    category: r.category,
    coverImage: r.cover_image || "",
    viewCount: r.view_count,
    createdAt: r.created_at,
  }));

  return {
    posts,
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

// Get single post by slug
export async function getPostBySlug(
  db: D1Database,
  slug: string
): Promise<Post | null> {
  const row = await db
    .prepare("SELECT * FROM posts WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<any>();

  return row ? rowToPost(row) : null;
}

// Get single post by id
export async function getPostById(
  db: D1Database,
  id: number
): Promise<Post | null> {
  const row = await db
    .prepare("SELECT * FROM posts WHERE id = ? LIMIT 1")
    .bind(id)
    .first<any>();

  return row ? rowToPost(row) : null;
}

// Create a new post
export async function createPost(
  db: D1Database,
  input: CreatePostInput
): Promise<Post> {
  const coverImage =
    extractCoverImage(input.content) ||
    `https://picsum.photos/seed/${input.slug}/800/400`;
  const now = new Date().toISOString();

  const result = await db
    .prepare(
      `INSERT INTO posts (title, slug, content, category, cover_image, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.title,
      input.slug,
      input.content,
      input.category,
      coverImage,
      input.isPublished ? 1 : 0,
      now,
      now
    )
    .run();

  return {
    id: result.meta?.last_row_id || 0,
    title: input.title,
    slug: input.slug,
    content: input.content,
    category: input.category,
    coverImage,
    isPublished: input.isPublished ? 1 : 0,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

// Update a post
export async function updatePost(
  db: D1Database,
  id: number,
  input: UpdatePostInput
): Promise<Post | null> {
  const existing = await getPostById(db, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const sets: string[] = ["updated_at = ?"];
  const values: any[] = [now];

  if (input.title !== undefined) {
    sets.push("title = ?");
    values.push(input.title);
  }
  if (input.slug !== undefined) {
    sets.push("slug = ?");
    values.push(input.slug);
  }
  if (input.content !== undefined) {
    sets.push("content = ?");
    values.push(input.content);
    const cover = extractCoverImage(input.content) || existing.coverImage;
    sets.push("cover_image = ?");
    values.push(cover);
  }
  if (input.category !== undefined) {
    sets.push("category = ?");
    values.push(input.category);
  }
  if (input.coverImage !== undefined) {
    sets.push("cover_image = ?");
    values.push(input.coverImage);
  }
  if (input.isPublished !== undefined) {
    sets.push("is_published = ?");
    values.push(input.isPublished ? 1 : 0);
  }

  values.push(id);

  await db
    .prepare(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return getPostById(db, id);
}

// Delete a post
export async function deletePost(db: D1Database, id: number): Promise<boolean> {
  await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return true;
}

// Increment view count
export async function incrementViewCount(
  db: D1Database,
  postId: number,
  ip?: string
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO views (post_id, ip, viewed_at) VALUES (?, ?, ?)")
    .bind(postId, ip || "", now)
    .run();

  await db
    .prepare("UPDATE posts SET view_count = view_count + 1 WHERE id = ?")
    .bind(postId)
    .run();
}

// Get hot posts
export async function getHotPosts(
  db: D1Database,
  limit: number = 5
): Promise<PostListItem[]> {
  const rows = await db
    .prepare(
      `SELECT id, title, slug, content, category, cover_image, view_count, created_at
       FROM posts WHERE is_published = 1
       ORDER BY view_count DESC LIMIT ?`
    )
    .bind(limit)
    .all<any>();

  return (rows.results || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    content: r.content,
    category: r.category,
    coverImage: r.cover_image || "",
    viewCount: r.view_count,
    createdAt: r.created_at,
  }));
}

// Get adjacent posts (prev/next)
export async function getAdjacentPosts(
  db: D1Database,
  currentCreatedAt: string
) {
  const prevRow = await db
    .prepare(
      `SELECT title, slug FROM posts
       WHERE is_published = 1 AND created_at < ?
       ORDER BY created_at DESC LIMIT 1`
    )
    .bind(currentCreatedAt)
    .first<{ title: string; slug: string }>();

  const nextRow = await db
    .prepare(
      `SELECT title, slug FROM posts
       WHERE is_published = 1 AND created_at > ?
       ORDER BY created_at ASC LIMIT 1`
    )
    .bind(currentCreatedAt)
    .first<{ title: string; slug: string }>();

  return {
    prev: prevRow || null,
    next: nextRow || null,
  };
}

// Get stats
export async function getStats(db: D1Database) {
  const postCount = await db
    .prepare("SELECT count(*) as count FROM posts WHERE is_published = 1")
    .first<{ count: number }>();

  const totalViews = await db
    .prepare("SELECT COALESCE(SUM(view_count), 0) as total FROM posts")
    .first<{ total: number }>();

  const today = new Date().toISOString().split("T")[0];
  const todayViews = await db
    .prepare("SELECT count(*) as count FROM views WHERE viewed_at >= ?")
    .bind(today)
    .first<{ count: number }>();

  const mediaCount = await db
    .prepare("SELECT count(*) as count FROM media")
    .first<{ count: number }>();

  return {
    totalPosts: postCount?.count || 0,
    totalViews: totalViews?.total || 0,
    todayViews: todayViews?.count || 0,
    totalMedia: mediaCount?.count || 0,
  };
}
