"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("生活随笔");
  const [isPublished, setIsPublished] = useState(false);
  const [editorMode, setEditorMode] = useState<"richtext" | "markdown">("markdown");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto-generate slug from title if not manually edited
    if (!slug || slug === slugify(val)) {
      setSlug(slugify(val));
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error || "上传失败");
      }

      const { uploadUrl, publicUrl }: { uploadUrl: string; publicUrl: string } = await res.json();

      // Upload to R2 using pre-signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("文件上传失败");
      }

      // Insert image into editor
      if (editorMode === "markdown") {
        const imgMarkdown = `![${file.name}](${publicUrl})`;
        setContent((prev) => prev + "\n" + imgMarkdown + "\n");
      } else {
        const imgHtml = `<img src="${publicUrl}" alt="${file.name}" />`;
        setContent((prev) => prev + imgHtml);
      }

      alert("图片上传成功！已插入到编辑器中");
    } catch (e: any) {
      alert("上传失败: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      setError("标题和内容为必填项");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          content,
          category,
          isPublished,
        }),
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error || "保存失败");
      }

      router.push("/admin/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-[#3B82F6]">
                ← 返回
              </Link>
              <h1 className="text-xl font-bold text-[#1E293B]">✏️ 写文章</h1>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option value="生活随笔">生活随笔</option>
                <option value="技术干货">技术干货</option>
                <option value="资源分享">资源分享</option>
              </select>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-[#3B82F6]"
                />
                <span>发布</span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章标题"
            className="w-full text-2xl font-bold text-[#1E293B] outline-none placeholder-gray-300"
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">slug:</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-slug"
              className="text-sm text-gray-500 outline-none border-b border-dashed border-gray-200 focus:border-[#3B82F6] px-2 py-1 flex-1"
            />
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditorMode("markdown")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  editorMode === "markdown"
                    ? "bg-[#3B82F6] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Markdown 模式
              </button>
              <button
                onClick={() => setEditorMode("richtext")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  editorMode === "richtext"
                    ? "bg-[#3B82F6] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                富文本模式
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer transition-colors">
                📷 插入图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  disabled={uploading}
                />
              </label>
              <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer transition-colors">
                📎 上传文件
                <input
                  type="file"
                  accept=".pdf,.zip,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          {uploading && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-[#3B82F6]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3B82F6]"></div>
              <span>上传中...</span>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {editorMode === "markdown" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作...&#10;&#10;支持 Markdown 语法：&#10;# 标题&#10;**加粗** *斜体*&#10;![图片](url)&#10;[链接](url)"
              className="w-full min-h-[400px] outline-none resize-y font-mono text-sm text-[#1E293B] placeholder-gray-300 leading-relaxed"
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作...&#10;&#10;支持 HTML 标签：&#10;<h1>标题</h1>&#10;<b>加粗</b> <i>斜体</i>&#10;<img src='url' />"
              className="w-full min-h-[400px] outline-none resize-y text-sm text-[#1E293B] placeholder-gray-300 leading-relaxed"
            />
          )}
        </div>

        {/* Preview */}
        {content && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#1E293B] mb-4">📄 预览</h2>
            <div className="bg-white rounded-xl shadow-sm p-8 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function renderMarkdown(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^[\-*] (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^---$/gm, "<hr />")
    .replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");
  html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  return html;
}
