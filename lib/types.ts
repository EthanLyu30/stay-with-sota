// 数据源类型
export type SourceType =
  | 'github-trending'
  | 'github-release'
  | 'arxiv'
  | 'huggingface'
  | 'hackernews'
  | 'rss';

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  config?: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
}

// 单条抓取内容
export interface FetchedItem {
  sourceType: SourceType;
  sourceName: string;
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
}

// AI 处理后的简报条目
export interface DigestItem {
  id: string;
  sourceType: SourceType;
  sourceName: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

// 一期简报
export interface Digest {
  id: string;
  date: string;
  title: string;
  items: DigestItem[];
  totalFetched: number;
  totalFiltered: number;
  emailSent: boolean;
  createdAt: string;
}

// 分页
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 统计信息
export interface Stats {
  totalDigests: number;
  todayItems: number;
  activeSources: number;
  lastEmailSent: string | null;
}

// Standard API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T> {
  meta: PaginationMeta;
}
