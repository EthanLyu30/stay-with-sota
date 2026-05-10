'use client';

import { useState } from 'react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth?: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response?: object;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/health',
    description: '健康检查端点，返回系统和依赖服务状态',
    response: {
      success: true,
      status: 'healthy',
      timestamp: '2025-01-10T12:00:00Z',
      version: '0.1.0',
      checks: { redis: { status: 'ok' } }
    }
  },
  {
    method: 'GET',
    path: '/api/digests',
    description: '获取简报列表（分页）',
    params: [
      { name: 'page', type: 'number', required: false, description: '页码，默认 1' },
      { name: 'pageSize', type: 'number', required: false, description: '每页数量，默认 10，最大 50' }
    ],
    response: {
      success: true,
      data: [{ id: 'xxx', date: '2025-01-10', title: '...' }],
      meta: { page: 1, pageSize: 10, total: 100, hasMore: true }
    }
  },
  {
    method: 'GET',
    path: '/api/digests/[id]',
    description: '获取单个简报详情',
    response: {
      success: true,
      data: { id: 'xxx', date: '2025-01-10', title: '...', content: '...' }
    }
  },
  {
    method: 'GET',
    path: '/api/search',
    description: '全文搜索简报',
    params: [
      { name: 'q', type: 'string', required: true, description: '搜索关键词' },
      { name: 'page', type: 'number', required: false, description: '页码' }
    ],
    response: {
      success: true,
      data: [{ id: 'xxx', date: '2025-01-10', title: '...' }],
      meta: { page: 1, total: 50 }
    }
  },
  {
    method: 'POST',
    path: '/api/fetch-now',
    description: '手动触发数据抓取（需要认证）',
    auth: true,
    response: {
      success: true,
      message: 'Fetch job started'
    }
  },
  {
    method: 'POST',
    path: '/api/test-email',
    description: '发送测试邮件（需要认证）',
    auth: true,
    response: {
      success: true,
      message: 'Test email sent'
    }
  },
  {
    method: 'GET',
    path: '/api/sources',
    description: '获取所有数据源',
    response: {
      success: true,
      data: [{ id: 'xxx', name: 'Source Name', url: 'https://...' }]
    }
  },
  {
    method: 'POST',
    path: '/api/sources',
    description: '添加数据源（需要认证）',
    auth: true,
    response: {
      success: true,
      data: { id: 'xxx', name: 'Source Name', url: 'https://...' }
    }
  },
  {
    method: 'GET',
    path: '/api/providers',
    description: '获取 AI 模型提供商列表',
    response: {
      success: true,
      data: [{ id: 'openai', name: 'OpenAI' }, { id: 'anthropic', name: 'Anthropic' }]
    }
  }
];

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const methodColors: Record<string, string> = {
    GET: '#A3BE8C',
    POST: '#88C0D0',
    PATCH: '#EBCB8B',
    DELETE: '#BF616A'
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ 
        fontSize: '26px', 
        fontWeight: 700, 
        color: '#88C0D0',
        marginBottom: '8px'
      }}>
        API 文档
      </h1>
      <p style={{ color: '#4C566A', marginBottom: '32px' }}>
        SOTA Daily REST API 参考文档
      </p>

      <div style={{ 
        background: '#3B4252', 
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid rgba(216, 222, 233, 0.08)'
      }}>
        <h3 style={{ color: '#ECEFF4', marginBottom: '12px', fontSize: '14px' }}>
          认证方式
        </h3>
        <p style={{ color: '#D8DEE9', fontSize: '13px', marginBottom: '8px' }}>
          需要认证的接口使用 Bearer Token：
        </p>
        <code style={{
          display: 'block',
          padding: '12px',
          background: '#2E3440',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#88C0D0',
          fontFamily: 'var(--font-mono)'
        }}>
          Authorization: Bearer {'<your-api-secret>'}
        </code>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {endpoints.map((ep) => (
          <div
            key={ep.path}
            style={{
              background: '#3B4252',
              borderRadius: '8px',
              border: '1px solid rgba(216, 222, 233, 0.08)',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setExpanded(expanded === ep.path ? null : ep.path)}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                background: `${methodColors[ep.method]}20`,
                color: methodColors[ep.method]
              }}>
                {ep.method}
              </span>
              <code style={{
                color: '#ECEFF4',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)'
              }}>
                {ep.path}
              </code>
              {ep.auth && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  color: '#EBCB8B',
                  padding: '2px 8px',
                  background: 'rgba(235, 203, 139, 0.1)',
                  borderRadius: '4px'
                }}>
                  需认证
                </span>
              )}
            </button>
            
            {expanded === ep.path && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ color: '#D8DEE9', marginBottom: '16px', fontSize: '14px' }}>
                  {ep.description}
                </p>
                
                {ep.params && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ color: '#ECEFF4', fontSize: '13px', marginBottom: '8px' }}>
                      参数
                    </h4>
                    <table style={{
                      width: '100%',
                      fontSize: '13px',
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(216, 222, 233, 0.08)' }}>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#4C566A' }}>名称</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#4C566A' }}>类型</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#4C566A' }}>必需</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#4C566A' }}>描述</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map(p => (
                          <tr key={p.name} style={{ borderBottom: '1px solid rgba(216, 222, 233, 0.04)' }}>
                            <td style={{ padding: '8px', color: '#88C0D0', fontFamily: 'var(--font-mono)' }}>{p.name}</td>
                            <td style={{ padding: '8px', color: '#D8DEE9' }}>{p.type}</td>
                            <td style={{ padding: '8px', color: p.required ? '#BF616A' : '#4C566A' }}>
                              {p.required ? '是' : '否'}
                            </td>
                            <td style={{ padding: '8px', color: '#D8DEE9' }}>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {ep.response && (
                  <div>
                    <h4 style={{ color: '#ECEFF4', fontSize: '13px', marginBottom: '8px' }}>
                      响应示例
                    </h4>
                    <pre style={{
                      padding: '12px',
                      background: '#2E3440',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#D8DEE9',
                      fontFamily: 'var(--font-mono)',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(ep.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
