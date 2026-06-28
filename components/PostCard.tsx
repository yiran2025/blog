import Link from "next/link";
import { getExcerpt, estimateReadingTime, formatDate, getCategoryColor } from "@/lib/utils";
import type { PostListItem } from "@/lib/posts";

export default function PostCard({ post }: { post: PostListItem }) {
  const excerpt = getExcerpt(post.content, 150);
  const readingTime = estimateReadingTime(post.content);

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.classList.add(
                "flex",
                "items-center",
                "justify-center"
              );
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-gray-300">📝</span>
          </div>
        )}
        {/* Category Tag */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: getCategoryColor(post.category) }}
        >
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span>{formatDate(post.createdAt)}</span>
          <div className="flex items-center space-x-3">
            <span>⏱ {readingTime} 分钟</span>
            <span>🔥 {post.viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
