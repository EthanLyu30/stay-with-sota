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
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  return (
    <div>
      <div className="action-bar">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ 取消' : '+ 添加数据源'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">类型</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as SourceType }))}
              >
                {SOURCE_TYPES.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">名称</label>
              <input
                className="form-input"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="数据源名称"
                required
              />
            </div>
            {(formData.type === 'rss' || formData.type === 'github-release') && (
              <div className="form-group">
                <label className="form-label">
                  {formData.type === 'rss' ? 'RSS URL' : '仓库地址 (owner/repo)'}
                </label>
                <input
                  className="form-input"
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={formData.type === 'rss' ? 'https://example.com/feed.xml' : 'langgenius/dify'}
                  required
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary">添加</button>
          </form>
        </div>
      )}

      <div className="source-list">
        {sources.map(source => {
          const meta = SOURCE_META[source.type] || { icon: '📡', label: source.type };
          return (
            <div key={source.id} className="source-item">
              <div className="source-item-icon">{meta.icon}</div>
              <div className="source-item-info">
                <div className="source-item-name">{source.name}</div>
                <div className="source-item-type">{source.type}</div>
              </div>
              <div
                className={`toggle ${source.enabled ? 'active' : ''}`}
                onClick={() => handleToggle(source)}
                role="switch"
                aria-checked={source.enabled}
              />
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(source.id)}
              >
                删除
              </button>
            </div>
          );
        })}
      </div>

      {sources.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <div className="empty-state-title">暂无数据源</div>
          <div className="empty-state-text">点击上方按钮添加数据源</div>
        </div>
      )}
    </div>
  );
}
