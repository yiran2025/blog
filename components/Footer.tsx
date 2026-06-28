export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} 我的博客. Built with Next.js & Cloudflare.</p>
        </div>
      </div>
    </footer>
  );
}
