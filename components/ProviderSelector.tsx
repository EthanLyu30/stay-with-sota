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
        borderTopColor: '#10b981',
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
        color: '#e8e8e8',
      }}>
        AI \u6A21\u578B\u914D\u7F6E
      </h3>
      <p style={{
        color: '#8b8b8b',
        fontSize: '13px',
        marginBottom: '16px',
        lineHeight: 1.5,
      }}>
        \u9009\u62E9\u7528\u4E8E\u4FE1\u606F\u7B5B\u9009\u548C\u6458\u8981\u7684 AI \u6A21\u578B\u3002\u5F53\u524D\u901A\u8FC7\u73AF\u5883\u53D8\u91CF <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>LLM_PROVIDER</code> \u63A7\u5236\u3002
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
              borderLeft: provider.id === activeProvider ? '2px solid #10b981' : '2px solid transparent',
              background: provider.id === activeProvider ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
              transition: 'background 150ms ease',
            }}
          >
            <div style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>
              {provider.type === 'ollama' ? '\uD83D\uDDA5\uFE0F' : '\u2601\uFE0F'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: '#e8e8e8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {provider.name}
                {provider.id === activeProvider && (
                  <span style={{
                    fontSize: '11px',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    \u5F53\u524D\u4F7F\u7528
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#555',
                fontFamily: 'var(--font-mono)',
              }}>
                {provider.model} &middot; {provider.description}
              </div>
            </div>
            <span style={{
              fontSize: '12px',
              color: provider.configured ? '#10b981' : '#f59e0b',
            }}>
              {provider.configured ? '\u2705' : '\u26A0\uFE0F \u9700\u914D\u7F6E'}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#8b8b8b',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: '#e8e8e8' }}>\u5207\u6362\u65B9\u5F0F\uFF1A</strong>\u5728\u73AF\u5883\u53D8\u91CF\u4E2D\u8BBE\u7F6E <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>LLM_PROVIDER</code> \u4E3A\u63D0\u4F9B\u5546 ID\uFF08\u5982 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>deepseek</code>\u3001<code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>gemini</code>\u3001<code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>qwen</code>\uFF09\uFF0C
        \u5E76\u914D\u7F6E\u5BF9\u5E94\u7684 <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#10b981',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.12)',
        }}>LLM_API_KEY</code>\u3002
      </div>
    </div>
  );
}
