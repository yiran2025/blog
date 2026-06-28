import Link from "next/link";
import type { PostListItem } from "@/lib/posts";

interface SidebarProps {
  hotPosts: PostListItem[];
  stats: {
    totalPosts: number;
    totalViews: number;
  };
}

export default function Sidebar({ hotPosts, stats }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Site Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4">📊 站点信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#3B82F6]/5 rounded-lg">
            <div className="text-2xl font-bold text-[#3B82F6]">{stats.totalPosts}</div>
            <div className="text-xs text-gray-500 mt-1">文章总数</div>
          </div>
          <div className="text-center p-3 bg-[#10B981]/5 rounded-lg">
            <div className="text-2xl font-bold text-[#10B981]">{stats.totalViews}</div>
            <div className="text-xs text-gray-500 mt-1">总浏览量</div>
          </div>
        </div>
      </div>

      {/* Hot Posts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4">🔥 热门文章</h3>
        {hotPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无文章</p>
        ) : (
          <ul className="space-y-3">
            {hotPosts.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.slug}`}
                  className="flex items-start space-x-3 group"
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index < 3
                        ? "bg-[#3B82F6]"
                        : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">🔥 {post.viewCount} 次阅读</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* About */}
      <div id="about" className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-3">👋 关于我</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          热爱生活，热爱技术。这里记录着我的技术探索和生活感悟，希望对你有所帮助。
        </p>
      </div>
    </aside>
  );
}
