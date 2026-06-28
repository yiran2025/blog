export default function Hero() {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-8 md:p-12 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center shadow-lg">
            <span className="text-5xl md:text-6xl">✍️</span>
          </div>
        </div>

        {/* Text */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3">
            记录生活，分享技术
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
            一个热爱技术的开发者，在这里记录技术探索、生活随笔和实用资源。
            希望每一篇文章都能给你带来启发。
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            <span className="px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-sm rounded-full">
              💻 全栈开发
            </span>
            <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-sm rounded-full">
              📝 技术写作
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full">
              🎨 开源贡献
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
