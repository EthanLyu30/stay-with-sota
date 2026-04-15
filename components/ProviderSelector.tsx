'use client';

import { useEffect, useState } from 'react';

interface Provider {
  id: string;
  name: string;
  type: string;
  model: string;
  description: string;
  batchSize: number;
  configured: boolean;
}

export default function ProviderSelector() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeProvider, setActiveProvider] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProviders(data.providers || []);
          setActiveProvider(data.activeProvider || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>🧠 AI 模型配置</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
        选择用于信息筛选和摘要的 AI 模型。当前通过环境变量 <code>LLM_PROVIDER</code> 控制。
      </p>
      <div className="source-list">
        {providers.map(provider => (
          <div
            key={provider.id}
            className="source-item"
            style={{
              borderColor: provider.id === activeProvider ? 'var(--accent-green)' : undefined,
              background: provider.id === activeProvider ? 'rgba(0, 255, 136, 0.05)' : undefined,
            }}
          >
            <div className="source-item-icon">
              {provider.type === 'ollama' ? '🖥️' : '☁️'}
            </div>
            <div className="source-item-info">
              <div className="source-item-name">
                {provider.name}
                {provider.id === activeProvider && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    color: 'var(--accent-green)',
                    background: 'rgba(0, 255, 136, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}>
                    当前使用
                  </span>
                )}
              </div>
              <div className="source-item-type">
                {provider.model} · {provider.description}
              </div>
            </div>
            <span style={{
              fontSize: '12px',
              color: provider.configured ? 'var(--accent-green)' : 'var(--accent-orange)',
            }}>
              {provider.configured ? '✅' : '⚠️ 需配置'}
            </span>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <strong>切换方式：</strong>在环境变量中设置 <code>LLM_PROVIDER</code> 为提供商 ID（如 <code>deepseek</code>、<code>gemini</code>、<code>qwen</code>），
        并配置对应的 <code>LLM_API_KEY</code>。
      </div>
    </div>
  );
}
