'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Source, SourceType } from '@/lib/types';
import { SOURCE_META } from '@/lib/utils';

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'github-trending', label: 'GitHub Trending' },
  { value: 'github-release', label: 'GitHub Release' },
  { value: 'arxiv', label: 'ArXiv 论文' },
  { value: 'huggingface', label: 'HuggingFace Daily Papers' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'rss', label: 'RSS 订阅' },
];

export default function SourceManager() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rss' as SourceType,
    name: '',
    url: '',
  });

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.success) setSources(data.data || []);
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleToggle = async (source: Source) => {
    try {
      await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      setSources(prev =>
        prev.map(s => s.id === source.id ? { ...s, enabled: !s.enabled } : s)
      );
    } catch (err) {
      console.error('Failed to toggle source:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个数据源吗？')) return;
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSources(prev => [...prev, data.data]);
        setFormData({ type: 'rss', name: '', url: '' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to add source:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px',
        color: '#475569',
        fontSize: '13px',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          border: '2px solid rgba(255, 255, 255, 0.06)',
          borderTopColor: '#818CF8',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          marginBottom: '12px',
        }} />
        加载中...
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 14px',
    background: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    color: '#edf2f7',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    height: '38px',
    outline: 'none',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: '6px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.02em',
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            height: '36px',
            padding: '0 16px',
            background: '#818CF8',
            border: 'none',
            borderRadius: '8px',
            color: '#0B0F19',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#a5b4fc';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#818CF8';
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          {showForm ? '取消' : '添加数据源'}
        </button>
      </div>

      {showForm && (
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          animation: 'slideUp 0.2s ease',
        }}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>类型</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as SourceType }))}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                }}
                onFocus={e => {
                  (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(129, 140, 248, 0.4)';
                  (e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.08)';
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  (e.currentTarget as HTMLSelectElement).style.boxShadow = 'none';
                }}
              >
                {SOURCE_TYPES.map(st => (
                  <option key={st.value} value={st.value} style={{ background: '#111827' }}>{st.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>名称</label>
              <input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="数据源名称"
                required
                style={inputStyle}
                onFocus={e => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(129, 140, 248, 0.4)';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.08)';
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
            </div>
            {(formData.type === 'rss' || formData.type === 'github-release') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{formData.type === 'rss' ? 'RSS URL' : '仓库地址 (owner/repo)'}</label>
                <input
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={formData.type === 'rss' ? 'https://example.com/feed.xml' : 'langgenius/dify'}
                  required
                  style={inputStyle}
                  onFocus={e => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(129, 140, 248, 0.4)';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.08)';
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
            <button type="submit" style={{
              height: '36px',
              padding: '0 16px',
              background: '#818CF8',
              border: 'none',
              borderRadius: '8px',
              color: '#0B0F19',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#a5b4fc';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#818CF8';
            }}
            >
              添加
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sources.map(source => {
          const meta = SOURCE_META[source.type] || { icon: '📡', label: source.type };
          return (
            <div key={source.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(129, 140, 248, 0.15)';
              (e.currentTarget as HTMLDivElement).style.background = '#151d2e';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
              (e.currentTarget as HTMLDivElement).style.background = '#111827';
            }}
            >
              <div style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{meta.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  color: '#edf2f7',
                }}>
                  {source.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#475569',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {source.type}
                </div>
              </div>
              <div
                onClick={() => handleToggle(source)}
                role="switch"
                aria-checked={source.enabled}
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '22px',
                  background: source.enabled ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'background 200ms ease',
                  border: `1px solid ${source.enabled ? 'rgba(129, 140, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: source.enabled ? '20px' : '2px',
                  width: '16px',
                  height: '16px',
                  background: source.enabled ? '#818CF8' : '#475569',
                  borderRadius: '50%',
                  transition: 'all 200ms ease',
                  boxShadow: source.enabled ? '0 0 8px rgba(129, 140, 248, 0.4)' : 'none',
                }} />
              </div>
              <button
                onClick={() => handleDelete(source.id)}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#f87171',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248, 113, 113, 0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                删除
              </button>
            </div>
          );
        })}
      </div>

      {sources.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#475569',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(129, 140, 248, 0.08)',
            border: '1px solid rgba(129, 140, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '20px',
          }}>
            📡
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '6px',
            fontFamily: 'var(--font-sans)',
          }}>
            暂无数据源
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            点击上方按钮添加数据源
          </div>
        </div>
      )}
    </div>
  );
}
