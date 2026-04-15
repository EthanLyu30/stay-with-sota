'use client';

import { useState, useRef, useEffect } from 'react';

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
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
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#282c34',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
        padding: '0 12px',
      }}>
        <span style={{ color: '#5a5a5a', fontSize: '14px' }}>$</span>
        <input
          type="text"
          placeholder="搜索历史简报..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f0f0f0',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            padding: '10px 0',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3b82f6',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {loading ? '...' : '↵'}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: '4px',
          background: '#282c34',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '6px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#5a5a5a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            found {total} results
          </div>
          {results.map(item => (
            <a
              key={item.itemId}
              href={`/digest/${item.digestId}`}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: '13px', color: '#f0f0f0', marginBottom: '2px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: '#5a5a5a' }}>
                {item.summary.substring(0, 80)}...
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
