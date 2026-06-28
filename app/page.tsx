import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { getPosts, getHotPosts, getStats } from "@/lib/posts";
import { getDb } from "@/lib/db";

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = searchParams.category || undefined;
  const page = parseInt(searchParams.page || "1");

  let posts: any[] = [];
  let hotPosts: any[] = [];
  let stats = { totalPosts: 0, totalViews: 0 };
  let error = "";

  try {
    const db = getDb();
    const [postsResult, hotPostsResult, statsResult] = await Promise.all([
      getPosts(db, { category, page, limit: 12 }),
      getHotPosts(db, 5),
      getStats(db),
    ]);
    posts = postsResult.posts;
    hotPosts = hotPostsResult;
    stats = statsResult;
  } catch (e: any) {
    error = e.message;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <CategoryFilter />

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800 text-sm">
              ⚠️ 数据库未连接：{error}。请先配置 Cloudflare D1 数据库。
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {posts.length === 0 && !error ? (
              <div className="text-center py-20">
                <span className="text-6xl">📝</span>
                <h3 className="text-xl font-semibold text-gray-400 mt-4">暂无文章</h3>
                <p className="text-gray-400 text-sm mt-2">还没有发布任何文章</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Sidebar hotPosts={hotPosts} stats={stats} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
