import type { Digest } from '@/lib/types';
import { SOURCE_META } from '@/lib/utils';

interface DigestDetailProps {
  digest: Digest;
}

export default function DigestDetail({ digest }: DigestDetailProps) {
  const passRate = Math.round(
    (digest.totalFiltered / Math.max(digest.totalFetched, 1)) * 100
  );

  const grouped = new Map<string, typeof digest.items>();
  for (const item of digest.items) {
    const key = item.sourceType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '20px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '24px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: '#ffffff',
          marginBottom: '12px',
        }}>
          {digest.title}
        </h1>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#6b7280',
          flexWrap: 'wrap',
        }}>
          <span>{new Date(digest.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
          <span style={{ color: '#10b981' }}>\uD83D\uDCE5 {digest.totalFetched} \u6293\u53D6</span>
          <span style={{ color: '#34d399' }}>\u2705 {digest.totalFiltered} \u7CBE\u9009</span>
          <span>\uD83D\uDCCA {passRate}%</span>
          {digest.emailSent && <span style={{ color: '#10b981' }}>\uD83D\uDCE7 \u5DF2\u63A8\u9001</span>}
        </div>
      </div>

      {/* Items by source */}
      {Array.from(grouped.entries()).map(([sourceType, items]) => {
        const meta = SOURCE_META[sourceType] || { icon: '\uD83D\uDCE1', label: sourceType, color: '#6b7280' };
        return (
          <div key={sourceType} style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <span style={{ fontSize: '16px' }}>{meta.icon}</span>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: meta.color,
              }}>
                {meta.label}
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#6b7280',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1px 8px',
                borderRadius: '3px',
              }}>
                {items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                }}>
                  {/* Score badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    background: item.relevanceScore >= 70
                      ? 'rgba(16, 185, 129, 0.15)'
                      : item.relevanceScore >= 50
                        ? 'rgba(251, 191, 36, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color: item.relevanceScore >= 70
                      ? '#10b981'
                      : item.relevanceScore >= 50
                        ? '#fbbf24'
                        : '#6b7280',
                  }}>
                    {item.relevanceScore}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '4px',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </a>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: 1.5,
                      marginBottom: '6px',
                    }}>
                      {item.summary}
                    </div>
                    {item.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {item.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.08)',
                            padding: '1px 8px',
                            borderRadius: '3px',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
