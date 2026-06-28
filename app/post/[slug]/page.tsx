import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, getAdjacentPosts, incrementViewCount } from "@/lib/posts";
import { getDb } from "@/lib/db";
import { formatDate, estimateReadingTime, getCategoryColor } from "@/lib/utils";
import { headers } from "next/headers";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post: any = null;
  let adjacent: { prev: any; next: any } = { prev: null, next: null };

  try {
    const db = getDb();
    post = await getPostBySlug(db, params.slug);

    if (!post) {
      notFound();
    }

    // Increment view
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "";
    await incrementViewCount(db, post.id, ip);

    // Get adjacent posts
    adjacent = await getAdjacentPosts(db, post.createdAt);
  } catch (e: any) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-6xl">⚠️</span>
          <h1 className="text-2xl font-bold text-gray-500 mt-4">数据库未连接</h1>
          <p className="text-gray-400 mt-2">{e.message}</p>
          <Link href="/" className="text-[#3B82F6] hover:underline mt-4 inline-block">
            ← 返回首页
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) notFound();

  const readingTime = estimateReadingTime(post.content);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getCategoryColor(post.category) }}
              >
                {post.category}
              </span>
              <span className="text-sm text-gray-400">
                {formatDate(post.createdAt)}
              </span>
              <span className="text-sm text-gray-400">
                ⏱ {readingTime} 分钟阅读
              </span>
              <span className="text-sm text-gray-400">
                🔥 {post.viewCount + 1} 次阅读
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] leading-tight">
              {post.title}
            </h1>
          </header>

          {/* Content */}
          <div
            className="prose max-w-none bg-white rounded-xl shadow-sm p-8 md:p-12"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </article>

        {/* Prev/Next Navigation */}
        <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {adjacent.prev ? (
            <Link
              href={`/post/${adjacent.prev.slug}`}
              className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
            >
              <span className="text-sm text-gray-400">← 上一篇</span>
              <h3 className="text-[#1E293B] font-medium mt-1 group-hover:text-[#3B82F6] transition-colors">
                {adjacent.prev.title}
              </h3>
            </Link>
          ) : (
            <div />
          )}
          {adjacent.next ? (
            <Link
              href={`/post/${adjacent.next.slug}`}
              className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all text-right"
            >
              <span className="text-sm text-gray-400">下一篇 →</span>
              <h3 className="text-[#1E293B] font-medium mt-1 group-hover:text-[#3B82F6] transition-colors">
                {adjacent.next.title}
              </h3>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </main>
      <Footer />
    </>
  );
}

// Simple Markdown to HTML renderer (client-side will use react-markdown)
function renderMarkdown(content: string): string {
  // Basic Markdown → HTML conversion for server-side rendering
  let html = content
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered lists
    .replace(/^[\-*] (.+)$/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr />")
    // Paragraphs
    .replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");

  // Wrap consecutive li elements in ul/ol
  html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  return html;
}
