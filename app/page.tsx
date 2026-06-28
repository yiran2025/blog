export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { getPosts, getHotPosts, getStats } from "@/lib/posts";
import { getDb } from "@/lib/db";

function HomeContent() {
  return (
    <Suspense fallback={<div className="text-center py-4 text-gray-400">加载中...</div>}>
      <HomeContentInner />
    </Suspense>
  );
}

async function HomeContentInner({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; page?: string }>;
}) {
  let category = undefined;
  let page = 1;

  try {
    const params = searchParams ? await searchParams : {};
    category = (params as any).category || undefined;
    page = parseInt((params as any).page || "1");
  } catch {}

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
      <CategoryFilter />

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-yellow-800 text-sm">
            ⚠️ 数据库未连接：{error}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
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

        <div className="w-full lg:w-80 flex-shrink-0">
          <Sidebar hotPosts={hotPosts} stats={stats} />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <Suspense fallback={<div className="text-center py-4 text-gray-400">加载中...</div>}>
          <HomeDataWrapper />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function HomeDataWrapper() {
  let posts: any[] = [];
  let hotPosts: any[] = [];
  let stats = { totalPosts: 0, totalViews: 0 };
  let error = "";

  try {
    const db = getDb();
    const [postsResult, hotPostsResult, statsResult] = await Promise.all([
      getPosts(db, { category: undefined, page: 1, limit: 12 }),
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
      <CategoryFilter />
      {error ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-yellow-800 text-sm">⚠️ {error}</p>
        </div>
      ) : null}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">📝</span>
              <h3 className="text-xl font-semibold text-gray-400 mt-4">暂无文章</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
        <div className="w-full lg:w-80 flex-shrink-0">
          <Sidebar hotPosts={hotPosts} stats={stats} />
        </div>
      </div>
    </>
  );
}
