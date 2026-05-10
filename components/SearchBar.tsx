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
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
        setFocused(false);
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
    <div ref={wrapperRef} role="search" style={{ position: 'relative', marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#3B4252',
        border: `1px solid ${focused ? 'rgba(136, 192, 208, 0.3)' : 'rgba(216, 222, 233, 0.08)'}`,
        borderRadius: '8px',
        padding: '0 16px',
        transition: 'all 150ms ease',
        boxShadow: focused ? '0 0 0 3px rgba(136, 192, 208, 0.06)' : 'none',
      }}>
        <span style={{ fontSize: '14px', color: '#4C566A', flexShrink: 0 }}>🔍</span>
        <input
          type="text"
          placeholder="搜索历史简报..."
          aria-label="搜索历史简报"
          aria-expanded={showResults}
          aria-controls="search-results"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          onFocus={() => { setFocused(true); if (results.length > 0) setShowResults(true); }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ECEFF4',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            padding: '12px 0',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            background: 'transparent',
            border: 'none',
            color: loading ? '#4C566A' : '#88C0D0',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color 150ms ease',
          }}
        >
          {loading ? '...' : '↵'}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div id="search-results" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: '8px',
          background: '#3B4252',
          border: '1px solid rgba(216, 222, 233, 0.08)',
          borderRadius: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          animation: 'slideUp 0.2s ease',
        }}>
          <div style={{
            padding: '10px 16px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: '#4C566A',
            borderBottom: '1px solid rgba(216, 222, 233, 0.08)',
          }}>
            找到 {total} 条结果
          </div>
          {results.map(item => (
            <a
              key={item.itemId}
              href={`/digest/${item.digestId}`}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(216, 222, 233, 0.05)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(136, 192, 208, 0.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: '14px', color: '#ECEFF4', marginBottom: '4px', fontWeight: 500 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13px', color: '#4C566A', lineHeight: 1.5 }}>
                {item.summary.substring(0, 80)}...
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
