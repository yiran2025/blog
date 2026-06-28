"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = ["全部", "生活随笔", "技术干货", "资源分享"];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "全部";

  const handleClick = (category: string) => {
    if (category === "全部") {
      router.push("/");
    } else {
      router.push(`/?category=${category}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            currentCategory === cat
              ? "bg-[#3B82F6] text-white shadow-md shadow-blue-200"
              : "bg-white text-gray-600 hover:bg-gray-100 hover:text-[#3B82F6]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
