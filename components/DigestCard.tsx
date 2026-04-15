import Link from 'next/link';
import type { Digest } from '@/lib/types';
import { formatDate, SOURCE_META } from '@/lib/utils';

interface DigestCardProps {
  digest: {
    id: string;
    date: string;
    title: string;
    totalFetched: number;
    totalFiltered: number;
    emailSent: boolean;
    createdAt: string;
    preview?: Array<{
      title: string;
      sourceType: string;
      relevanceScore: number;
    }>;
  };
}

export default function DigestCard({ digest }: DigestCardProps) {
  const passRate = Math.round(
    (digest.totalFiltered / Math.max(digest.totalFetched, 1)) * 100
  );

  return (
    <Link href={`/digest/${digest.id}`} style={{ textDecoration: 'none' }}>
      <div className="card digest-card">
        <div className="digest-card-date">{formatDate(digest.date)}</div>
        <div className="digest-card-title">{digest.title}</div>
        <div className="digest-card-stats">
          <span className="digest-card-stat">
            📥 {digest.totalFetched} 抓取
          </span>
          <span className="digest-card-stat">
            ✅ {digest.totalFiltered} 精选
          </span>
          <span className="digest-card-stat">
            📊 {passRate}% 通过率
          </span>
          {digest.emailSent && (
            <span className="digest-card-stat">📧 已推送</span>
          )}
        </div>
        {digest.preview && digest.preview.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {digest.preview.map((item, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{SOURCE_META[item.sourceType]?.icon || '📡'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
