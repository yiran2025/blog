import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的博客 - 记录生活，分享技术",
  description: "一个关于生活、技术和资源分享的个人博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#FAFBFC] antialiased">{children}</body>
    </html>
  );
}
