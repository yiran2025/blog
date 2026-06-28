import slugifyLib from "slugify";

export function generateSlug(title: string): string {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    locale: "zh",
  });
}

export function getExcerpt(content: string, maxLength: number = 150): string {
  // Remove Markdown/HTML tags
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links
    .replace(/[#*`~>_\-|]/g, "") // markdown symbols
    .replace(/<[^>]*>/g, "") // HTML tags
    .replace(/\n+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

export function estimateReadingTime(content: string): number {
  // Chinese reading speed: ~400 chars per minute
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[#*`~>_\-|]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .trim();

  const chars = plainText.length;
  const minutes = Math.ceil(chars / 400);
  return Math.max(1, minutes);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "生活随笔": "#10B981",
    "技术干货": "#3B82F6",
    "资源分享": "#F59E0B",
  };
  return colors[category] || "#6B7280";
}
