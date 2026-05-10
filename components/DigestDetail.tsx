import React from 'react';
import type { Digest } from '@/lib/types';
import { SOURCE_META } from '@/lib/utils';

interface DigestDetailProps {
  digest: Digest;
}

function DigestDetail({ digest }: DigestDetailProps) {
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
        borderBottom: '1px solid rgba(216, 222, 233, 0.08)',
        marginBottom: '28px',
      }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#ECEFF4',
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
          color: '#D8DEE9',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ color: '#D8DEE9' }}>
            {new Date(digest.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(136, 192, 208, 0.1)',
            color: '#88C0D0',
            fontSize: '12px',
            border: '1px solid rgba(136, 192, 208, 0.15)',
          }}>
            📥 {digest.totalFetched} 抓取
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(163, 190, 140, 0.12)',
            color: '#A3BE8C',
            fontSize: '12px',
            border: '1px solid rgba(163, 190, 140, 0.15)',
          }}>
            ✅ {digest.totalFiltered} 精选
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(235, 203, 139, 0.12)',
            color: '#EBCB8B',
            fontSize: '12px',
            border: '1px solid rgba(235, 203, 139, 0.15)',
          }}>
            📊 {passRate}% 通过率
          </span>
          {digest.emailSent && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(163, 190, 140, 0.12)',
              color: '#A3BE8C',
              fontSize: '12px',
              border: '1px solid rgba(163, 190, 140, 0.15)',
            }}>
              📧 已推送
            </span>
          )}
        </div>
      </div>

      {/* Items by source */}
      {Array.from(grouped.entries()).map(([sourceType, items]) => {
        const meta = SOURCE_META[sourceType] || { icon: '📡', label: sourceType, color: '#88C0D0' };
        return (
          <div key={sourceType} style={{ marginBottom: '36px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(216, 222, 233, 0.08)',
              borderLeft: '3px solid ' + (meta.color || '#88C0D0'),
              paddingLeft: '12px',
            }}>
              <span style={{ fontSize: '16px' }}>{meta.icon}</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: meta.color || '#88C0D0',
              }}>
                {meta.label}
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#4C566A',
                background: 'rgba(216, 222, 233, 0.04)',
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
                  borderRadius: '8px',
                  background: '#3B4252',
                  border: '1px solid rgba(216, 222, 233, 0.08)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(136, 192, 208, 0.15)';
                  (e.currentTarget as HTMLDivElement).style.background = '#434C5E';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(216, 222, 233, 0.08)';
                  (e.currentTarget as HTMLDivElement).style.background = '#3B4252';
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
                      ? 'rgba(136, 192, 208, 0.15)'
                      : item.relevanceScore >= 50
                        ? 'rgba(235, 203, 139, 0.15)'
                        : 'rgba(76, 86, 106, 0.15)',
                    color: item.relevanceScore >= 70
                      ? '#88C0D0'
                      : item.relevanceScore >= 50
                        ? '#EBCB8B'
                        : '#4C566A',
                    border: `1px solid ${item.relevanceScore >= 70
                      ? 'rgba(136, 192, 208, 0.2)'
                      : item.relevanceScore >= 50
                        ? 'rgba(235, 203, 139, 0.2)'
                        : 'rgba(76, 86, 106, 0.2)'}`,
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
                        color: '#ECEFF4',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '6px',
                        lineHeight: 1.4,
                        transition: 'color 150ms ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#88C0D0';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#ECEFF4';
                      }}
                    >
                      {item.title}
                    </a>
                    <div style={{
                      fontSize: '13px',
                      color: '#D8DEE9',
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
                            color: '#B48EAD',
                            background: 'rgba(180, 142, 173, 0.12)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(180, 142, 173, 0.15)',
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

export default React.memo(DigestDetail);
