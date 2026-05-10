'use client';

import { useEffect, useState, useCallback } from 'react';
import DigestCard from '@/components/DigestCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

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
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#ECEFF4',
          marginBottom: '6px',
          letterSpacing: '-0.03em',
        }}>
          📋 历史简报
        </h1>
        <p style={{
          color: '#4C566A',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
        }}>
          浏览所有历史简报记录
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : digests.length > 0 ? (
        <>
          {uniqueDigests.map(digest => (
            <DigestCard key={digest.id} digest={digest} />
          ))}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                onClick={loadMore}
                style={{
                  height: '36px',
                  padding: '0 20px',
                  background: 'transparent',
                  border: '1px solid rgba(136, 192, 208, 0.2)',
                  borderRadius: '8px',
                  color: '#88C0D0',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(136, 192, 208, 0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(136, 192, 208, 0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(136, 192, 208, 0.2)';
                }}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="📋"
          title="暂无历史简报"
          description="首次抓取后，简报将显示在这里"
        />
      )}
    </div>
  );
}
