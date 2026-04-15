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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📜 历史简报</h1>
        <p className="page-subtitle">浏览所有历史简报记录</p>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <div>加载中...</div>
        </div>
      ) : digests.length > 0 ? (
        <>
          <div className="card-grid">
            {digests.map(digest => (
              <DigestCard key={digest.id} digest={digest} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={loadMore}>
                加载更多
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">暂无历史简报</div>
          <div className="empty-state-text">
            首次抓取后，简报将显示在这里
          </div>
        </div>
      )}
    </div>
  );
}
