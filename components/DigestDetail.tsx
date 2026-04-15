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
        padding: '24px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '28px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}>
          {digest.title}
        </h1>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ color: '#94a3b8' }}>
            {new Date(digest.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(129, 140, 248, 0.1)',
            color: '#818CF8',
            fontSize: '12px',
            border: '1px solid rgba(129, 140, 248, 0.15)',
          }}>
            📥 {digest.totalFetched} 抓取
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(52, 211, 153, 0.1)',
            color: '#34d399',
            fontSize: '12px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
          }}>
            ✅ {digest.totalFiltered} 精选
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(251, 191, 36, 0.1)',
            color: '#fbbf24',
            fontSize: '12px',
            border: '1px solid rgba(251, 191, 36, 0.15)',
          }}>
            📊 {passRate}%
          </span>
          {digest.emailSent && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(52, 211, 153, 0.1)',
              color: '#34d399',
              fontSize: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}>
              📧 已推送
            </span>
          )}
        </div>
      </div>

      {/* Items by source */}
      {Array.from(grouped.entries()).map(([sourceType, items]) => {
        const meta = SOURCE_META[sourceType] || { icon: '📡', label: sourceType, color: '#818CF8' };
        return (
          <div key={sourceType} style={{ marginBottom: '36px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              borderLeft: '3px solid ' + (meta.color || '#818CF8'),
              paddingLeft: '12px',
            }}>
              <span style={{ fontSize: '16px' }}>{meta.icon}</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: meta.color || '#818CF8',
              }}>
                {meta.label}
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#475569',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}>
                {items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(129, 140, 248, 0.15)';
                  (e.currentTarget as HTMLDivElement).style.background = '#151d2e';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  (e.currentTarget as HTMLDivElement).style.background = '#111827';
                }}
                >
                  {/* Score badge */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    background: item.relevanceScore >= 70
                      ? 'rgba(129, 140, 248, 0.15)'
                      : item.relevanceScore >= 50
                        ? 'rgba(251, 191, 36, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                    color: item.relevanceScore >= 70
                      ? '#818CF8'
                      : item.relevanceScore >= 50
                        ? '#fbbf24'
                        : '#475569',
                    border: `1px solid ${item.relevanceScore >= 70
                      ? 'rgba(129, 140, 248, 0.2)'
                      : item.relevanceScore >= 50
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'rgba(255, 255, 255, 0.06)'}`,
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
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#edf2f7',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '6px',
                        lineHeight: 1.4,
                        transition: 'color 200ms ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#818CF8';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#edf2f7';
                      }}
                    >
                      {item.title}
                    </a>
                    <div style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      marginBottom: '8px',
                    }}>
                      {item.summary}
                    </div>
                    {item.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: '#818CF8',
                            background: 'rgba(129, 140, 248, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(129, 140, 248, 0.15)',
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
