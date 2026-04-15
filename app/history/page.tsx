'use client';

import { useEffect, useState, useCallback } from 'react';
import DigestCard from '@/components/DigestCard';

interface DigestPreview {
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
}

export default function HistoryPage() {
  const [digests, setDigests] = useState<DigestPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchDigests = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/digests?page=${pageNum}&pageSize=12`);
      const data = await res.json();
      if (data.success) {
        if (pageNum === 1) {
          setDigests(data.items || []);
        } else {
          setDigests(prev => [...prev, ...(data.items || [])]);
        }
        setHasMore(data.hasMore || false);
      }
    } catch (err) {
      console.error('Failed to fetch digests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDigests(1); }, [fetchDigests]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDigests(nextPage);
  };

  const uniqueDigests = Array.from(
    new Map(digests.map(d => [d.id, d])).values()
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#3b82f6',
          marginBottom: '3px',
        }}>
          📋 历史简报
        </h1>
        <p style={{
          color: '#5a5a5a',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        }}>
          浏览所有历史简报记录
        </p>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px',
          color: '#5a5a5a',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            marginBottom: '12px',
          }} />
          加载中...
        </div>
      ) : digests.length > 0 ? (
        <>
          <div style={{
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {uniqueDigests.map(digest => (
              <DigestCard key={digest.id} digest={digest} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={loadMore}
                style={{
                  height: '32px',
                  padding: '0 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#8b8b8b',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8b8b8b';
                }}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#5a5a5a',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>📭</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            暂无历史简报
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            首次抓取后，简报将显示在这里
          </div>
        </div>
      )}
    </div>
  );
}
