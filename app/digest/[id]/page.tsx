'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DigestDetail from '@/components/DigestDetail';
import ExportButton from '@/components/ExportButton';
import type { Digest } from '@/lib/types';

export default function DigestPage() {
  const params = useParams();
  const id = params.id as string;
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/digests/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setDigest(data.data);
        } else {
          setError('简报未找到');
        }
      })
      .catch(err => {
        setError(err.message || '加载失败');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <div>加载中...</div>
      </div>
    );
  }

  if (error || !digest) {
    return (
      <div>
        <Link href="/history" className="back-link">← 返回历史</Link>
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">{error || '简报未找到'}</div>
          <div className="empty-state-text">该简报可能已被删除或不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/history" className="back-link">← 返回历史</Link>
        <ExportButton digestId={digest.id} date={digest.date} />
      </div>
      <DigestDetail digest={digest} />
    </div>
  );
}
