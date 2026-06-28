"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalPosts: number;
  totalViews: number;
  todayViews: number;
  totalMedia: number;
  r2StorageBytes: number;
  r2StorageFormatted: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  isPublished: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/posts?limit=5&publishedOnly=false"),
      ]);

      if (statsRes.status === 401 || postsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const statsData: Stats = await statsRes.json();
      const postsData: { posts: Post[] } = await postsRes.json();

      setStats(statsData);
      setPosts(postsData.posts || []);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/admin/login");
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除这篇文章？")) return;
    await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-400 hover:text-[#3B82F6]">
                ← 返回网站
              </Link>
              <h1 className="text-xl font-bold text-[#1E293B]">📊 管理仪表盘</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/posts/new"
                className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                ✏️ 写文章
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-[#1E293B]">
              {stats?.totalPosts || 0}
            </div>
            <div className="text-sm text-gray-400 mt-1">总文章数</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl font-bold text-[#1E293B]">
              {stats?.totalViews || 0}
            </div>
            <div className="text-sm text-gray-400 mt-1">总浏览量</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-[#10B981]">
              {stats?.todayViews || 0}
            </div>
            <div className="text-sm text-gray-400 mt-1">今日访问</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">💾</div>
            <div className="text-2xl font-bold text-[#1E293B]">
              {stats?.r2StorageFormatted || "0 B"}
            </div>
            <div className="text-sm text-gray-400 mt-1">R2 存储</div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1E293B]">
              最近文章
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-50">
                  <th className="px-6 py-3">标题</th>
                  <th className="px-6 py-3">分类</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">浏览量</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/post/${post.slug}`}
                        className="text-[#1E293B] hover:text-[#3B82F6] font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.category}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.isPublished ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.viewCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-sm text-[#3B82F6] hover:underline"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="text-sm text-red-400 hover:text-red-600"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      暂无文章，开始写第一篇吧！
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
