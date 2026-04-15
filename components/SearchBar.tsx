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
    <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#111827',
        border: `1px solid ${focused ? 'rgba(129, 140, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
        borderRadius: '12px',
        padding: '0 16px',
        transition: 'all 200ms ease',
        boxShadow: focused ? '0 0 0 3px rgba(129, 140, 248, 0.08)' : 'none',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="搜索历史简报..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          onFocus={() => { setFocused(true); if (results.length > 0) setShowResults(true); }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#edf2f7',
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
            color: loading ? '#475569' : '#818CF8',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color 200ms ease',
          }}
        >
          {loading ? '...' : '↵'}
        </button>
        {!focused && !query && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.02)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#475569',
            flexShrink: 0,
          }}>
            <span>⌘</span>
            <span>K</span>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: '8px',
          background: '#1a2235',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          animation: 'slideUp 0.2s ease',
        }}>
          <div style={{
            padding: '10px 16px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: '#475569',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 200ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(129, 140, 248, 0.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: '14px', color: '#edf2f7', marginBottom: '4px', fontWeight: 500 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                {item.summary.substring(0, 80)}...
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
