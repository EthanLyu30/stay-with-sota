import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '简报详情 - SOTA Daily',
  description: '查看 AI 领域每日精选简报详情',
};

export default function DigestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
