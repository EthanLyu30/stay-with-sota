/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 格式化日期为中文友好格式
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

/**
 * 延迟指定毫秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 安全解析 JSON
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 数据源类型对应的图标和颜色
 */
export const SOURCE_META: Record<string, { icon: string; color: string; label: string }> = {
  'github-trending': { icon: '🐙', color: '#f0883e', label: 'GitHub Trending' },
  'github-release': { icon: '📦', color: '#2ea043', label: 'GitHub Release' },
  'arxiv': { icon: '📄', color: '#b31b1b', label: 'ArXiv 论文' },
  'huggingface': { icon: '🤗', color: '#ffbd45', label: 'HuggingFace' },
  'hackernews': { icon: '🔥', color: '#ff6600', label: 'Hacker News' },
  'rss': { icon: '📡', color: '#2196f3', label: 'RSS 订阅' },
};
