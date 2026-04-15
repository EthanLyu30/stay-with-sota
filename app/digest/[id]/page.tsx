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
          setError('\u7B80\u62A5\u672A\u627E\u5230');
        }
      })
      .catch(err => {
        setError(err.message || '\u52A0\u8F7D\u5931\u8D25');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px',
        color: '#555',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(255, 255, 255, 0.06)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          marginBottom: '12px',
        }} />
        \u52A0\u8F7D\u4E2D...
      </div>
    );
  }

  if (error || !digest) {
    return (
      <div>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#555',
          fontSize: '13px',
          marginBottom: '20px',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          transition: 'color 150ms ease',
        }}>
          \u2190 \u8FD4\u56DE\u5386\u53F2
        </Link>
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#555',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>\uD83D\uDE15</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            {error || '\u7B80\u62A5\u672A\u627E\u5230'}
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            \u8BE5\u7B80\u62A5\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\u6216\u4E0D\u5B58\u5728
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#555',
          fontSize: '13px',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#10b981'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#555'; }}
        >
          \u2190 \u8FD4\u56DE\u5386\u53F2
        </Link>
        <ExportButton digestId={digest.id} date={digest.date} />
      </div>
      <DigestDetail digest={digest} />
    </div>
  );
}
