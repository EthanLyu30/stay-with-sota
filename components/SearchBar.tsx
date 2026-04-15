'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SOURCE_META } from '@/lib/utils';

interface SearchResult {
  digestId: string;
  digestTitle: string;
  digestDate: string;
  itemId: string;
  title: string;
  summary: string;
  url: string;
  sourceType: string;
  relevanceScore: number;
  tags: string[];
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [total, setTotal] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          className="form-input"
          type="text"
          placeholder="🔍 搜索历史简报内容..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {showResults && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          maxHeight: '500px',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {results.length > 0 ? (
            <>
              <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', borderBottom: '1px solid var(--border-primary)' }}>
                找到 {total} 条结果
              </div>
              {results.map(item => (
                <a
                  key={item.itemId}
                  href={`/digest/${item.digestId}`}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-primary)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span>{SOURCE_META[item.sourceType]?.icon || '📡'}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      color: item.relevanceScore >= 70 ? 'var(--accent-green)' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      {item.relevanceScore}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.summary}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.digestDate} · {item.tags.map(t => `#${t}`).join(' ')}
                  </div>
                </a>
              ))}
            </>
          ) : !loading && query ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              未找到相关内容
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
