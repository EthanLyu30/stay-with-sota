import Link from 'next/link';
import { SOURCE_META } from '@/lib/utils';

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
    <Link href={`/digest/${digest.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'background 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#2d3139'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#5a5a5a',
              marginBottom: '6px',
            }}>
              {new Date(digest.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#f0f0f0',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {digest.title}
            </div>
            {digest.preview && digest.preview.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {digest.preview.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{
                    fontSize: '12px',
                    color: '#5a5a5a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    <span>{SOURCE_META[item.sourceType]?.icon || '📡'}</span>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
            <div style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#3b82f6',
            }}>
              {digest.totalFiltered} 条
            </div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#5a5a5a',
            }}>
              {passRate}% 通过
            </div>
            {digest.emailSent && (
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '1px 6px',
                borderRadius: '3px',
              }}>
                ✓ emailed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
