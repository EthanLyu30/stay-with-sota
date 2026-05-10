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
        width: '28px',
        height: '28px',
        border: '2px solid rgba(216, 222, 233, 0.08)',
        borderTopColor: '#88C0D0',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    );
  }

  return (
    <div>
      <h3 style={{
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        color: '#ECEFF4',
        letterSpacing: '-0.02em',
      }}>
        AI 模型配置
      </h3>
      <p style={{
        color: '#D8DEE9',
        fontSize: '13px',
        marginBottom: '20px',
        lineHeight: 1.6,
      }}>
        选择用于信息筛选和摘要的 AI 模型。当前通过环境变量 <code>LLM_PROVIDER</code> 控制。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {providers.map(provider => {
          const isActive = provider.id === activeProvider;
          return (
            <div
              key={provider.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: isActive ? 'rgba(136, 192, 208, 0.06)' : '#3B4252',
                border: `1px solid ${isActive ? 'rgba(136, 192, 208, 0.2)' : 'rgba(216, 222, 233, 0.08)'}`,
                borderRadius: '8px',
                transition: 'all 150ms ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(136, 192, 208, 0.12)';
                  (e.currentTarget as HTMLDivElement).style.background = '#434C5E';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(216, 222, 233, 0.08)';
                  (e.currentTarget as HTMLDivElement).style.background = '#3B4252';
                }
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: isActive ? 'rgba(136, 192, 208, 0.1)' : 'rgba(216, 222, 233, 0.04)',
                border: `1px solid ${isActive ? 'rgba(136, 192, 208, 0.15)' : 'rgba(216, 222, 233, 0.08)'}`,
                flexShrink: 0,
              }}>
                {provider.type === 'ollama' ? '🖥' : '☁'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  color: '#ECEFF4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '2px',
                }}>
                  {provider.name}
                  {isActive && (
                    <span style={{
                      fontSize: '11px',
                      color: '#88C0D0',
                      background: 'rgba(136, 192, 208, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid rgba(136, 192, 208, 0.15)',
                    }}>
                      当前使用
                    </span>
                  )}
                  <span style={{
                    fontSize: '10px',
                    color: '#4C566A',
                    background: 'rgba(216, 222, 233, 0.04)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {provider.type === 'ollama' ? 'Local' : 'Cloud'}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4C566A',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {provider.model} · {provider.description}
                </div>
              </div>
              <span style={{
                fontSize: '13px',
                color: provider.configured ? '#A3BE8C' : '#EBCB8B',
              }}>
                {provider.configured ? '✓' : '⚠ 需配置'}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#3B4252',
        border: '1px solid rgba(216, 222, 233, 0.08)',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#D8DEE9',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#ECEFF4' }}>切换方式：</strong>在环境变量中设置 <code>LLM_PROVIDER</code> 为提供商 ID（如 <code>deepseek</code>、<code>gemini</code>、<code>qwen</code>），并配置对应的 <code>LLM_API_KEY</code>。
      </div>
    </div>
  );
}
