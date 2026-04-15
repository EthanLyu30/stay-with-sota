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
        loading...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            height: '32px',
            padding: '0 14px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: '#f0f0f0',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#60a5fa';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
          }}
        >
          {showForm ? '✕ 取消' : '+ 添加数据源'}
        </button>
      </div>

      {showForm && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: '#282c34',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '6px',
        }}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#8b8b8b',
                marginBottom: '3px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                类型
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as SourceType }))}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  background: '#1f2228',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '4px',
                  color: '#f0f0f0',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  height: '32px',
                  outline: 'none',
                }}
              >
                {SOURCE_TYPES.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#8b8b8b',
                marginBottom: '3px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                名称
              </label>
              <input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="数据源名称"
                required
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  background: '#1f2228',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '4px',
                  color: '#f0f0f0',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  height: '32px',
                  outline: 'none',
                }}
              />
            </div>
            {(formData.type === 'rss' || formData.type === 'github-release') && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#8b8b8b',
                  marginBottom: '3px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {formData.type === 'rss' ? 'RSS URL' : '仓库地址 (owner/repo)'}
                </label>
                <input
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={formData.type === 'rss' ? 'https://example.com/feed.xml' : 'langgenius/dify'}
                  required
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: '#1f2228',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    color: '#f0f0f0',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    height: '32px',
                    outline: 'none',
                  }}
                />
              </div>
            )}
            <button type="submit" style={{
              height: '32px',
              padding: '0 14px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: '#f0f0f0',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#60a5fa';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
            }}
            >
              添加
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {sources.map(source => {
          const meta = SOURCE_META[source.type] || { icon: '📡', label: source.type };
          return (
            <div key={source.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#2d3139'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{meta.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: '#f0f0f0',
                }}>
                  {source.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#5a5a5a',
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
                  width: '36px',
                  height: '20px',
                  background: source.enabled ? 'rgba(59, 130, 246, 0.2)' : '#1f2228',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  border: `1px solid ${source.enabled ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)'}`,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: source.enabled ? '18px' : '2px',
                  width: '14px',
                  height: '14px',
                  background: source.enabled ? '#3b82f6' : '#5a5a5a',
                  borderRadius: '50%',
                  transition: 'all 150ms ease',
                }} />
              </div>
              <button
                onClick={() => handleDelete(source.id)}
                style={{
                  height: '26px',
                  padding: '0 8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '4px',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.15)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.15)';
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
          color: '#5a5a5a',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>📡</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            暂无数据源
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            点击上方按钮添加数据源
          </div>
        </div>
      )}
    </div>
  );
}
