import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '历史简报 - SOTA Daily',
  description: '浏览所有 AI 领域历史简报记录',
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
