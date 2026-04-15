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
        padding: '20px',
        marginBottom: '8px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(129, 140, 248, 0.2)';
        (e.currentTarget as HTMLDivElement).style.background = '#151d2e';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.005)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
        (e.currentTarget as HTMLDivElement).style.background = '#111827';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#475569',
              marginBottom: '8px',
            }}>
              {new Date(digest.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#edf2f7',
              marginBottom: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
            }}>
              {digest.title}
            </div>
            {digest.preview && digest.preview.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {digest.preview.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{
                    fontSize: '13px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
            <div style={{
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#818CF8',
            }}>
              {digest.totalFiltered} 条
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#475569',
            }}>
              {passRate}% 通过
            </div>
            {digest.emailSent && (
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#34d399',
                background: 'rgba(52, 211, 153, 0.1)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
              }}>
                ✓ 已推送
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
