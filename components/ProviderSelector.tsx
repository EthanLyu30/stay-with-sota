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

  if (loading) {
    return (
      <div style={{
        width: '32px',
        height: '32px',
        border: '2px solid rgba(255, 255, 255, 0.06)',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    );
  }

  return (
    <div>
      <h3 style={{
        marginBottom: '16px',
        fontSize: '16px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: '#f0f0f0',
      }}>
        AI 模型配置
      </h3>
      <p style={{
        color: '#8b8b8b',
        fontSize: '13px',
        marginBottom: '16px',
        lineHeight: 1.5,
      }}>
        选择用于信息筛选和摘要的 AI 模型。当前通过环境变量 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>LLM_PROVIDER</code> 控制。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {providers.map(provider => (
          <div
            key={provider.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              borderLeft: provider.id === activeProvider ? '2px solid #3b82f6' : '2px solid transparent',
              background: provider.id === activeProvider ? 'rgba(59, 130, 246, 0.03)' : 'transparent',
              transition: 'background 150ms ease',
            }}
          >
            <div style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>
              {provider.type === 'ollama' ? '🖥️' : '☁️'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {provider.name}
                {provider.id === activeProvider && (
                  <span style={{
                    fontSize: '11px',
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    当前使用
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#5a5a5a',
                fontFamily: 'var(--font-mono)',
              }}>
                {provider.model} &middot; {provider.description}
              </div>
            </div>
            <span style={{
              fontSize: '12px',
              color: provider.configured ? '#22c55e' : '#f59e0b',
            }}>
              {provider.configured ? '✅' : '⚠️ 需配置'}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: '#282c34',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#8b8b8b',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: '#f0f0f0' }}>切换方式：</strong>在环境变量中设置 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>LLM_PROVIDER</code> 为提供商 ID（如 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>deepseek</code>、<code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>gemini</code>、<code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>qwen</code>），
        并配置对应的 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}>LLM_API_KEY</code>。
      </div>
    </div>
  );
}
