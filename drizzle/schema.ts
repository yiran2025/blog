import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("生活随笔"),
  coverImage: text("cover_image").default(""),
  isPublished: integer("is_published").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const views = sqliteTable("views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull(),
  ip: text("ip").default(""),
  viewedAt: text("viewed_at").notNull(),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull().default(0),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  uploadedAt: text("uploaded_at").notNull(),
});
