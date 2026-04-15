import SourceManager from '@/components/SourceManager';
import ProviderSelector from '@/components/ProviderSelector';

export default function SettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          marginBottom: '6px',
          letterSpacing: '-0.03em',
        }}>
          设置
        </h1>
        <p style={{
          color: '#475569',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
        }}>
          管理数据源、AI 模型和系统配置
        </p>
      </div>

      {/* AI Provider Section */}
      <div style={{
        marginBottom: '36px',
        padding: '24px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
      }}>
        <ProviderSelector />
      </div>

      {/* Source Manager Section */}
      <div style={{
        marginBottom: '36px',
        padding: '24px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
      }}>
        <h3 style={{
          marginBottom: '8px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          letterSpacing: '-0.02em',
        }}>
          数据源管理
        </h3>
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          marginBottom: '20px',
          lineHeight: 1.6,
        }}>
          添加、删除或启用/禁用数据源。系统会从启用的数据源中自动抓取内容。
        </p>
        <SourceManager />
      </div>

      {/* System Info */}
      <div style={{
        padding: '24px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
      }}>
        <h3 style={{
          marginBottom: '20px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          letterSpacing: '-0.02em',
        }}>
          系统信息
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          fontSize: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {[
            ['框架', 'Next.js 15 (App Router)'],
            ['部署', 'Vercel'],
            ['数据库', 'Vercel KV (Upstash Redis)'],
            ['AI 引擎', '多模型支持 (Ollama / Gemini / DeepSeek / 通义 / 智谱)'],
            ['邮件', 'QQ 邮箱 SMTP'],
            ['定时任务', '每日 08:00 (北京时间)'],
            ['内容去重', '✅ 跨源自动去重'],
          ].map(([label, value], idx) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: idx < 6 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
              background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
              <span style={{ color: '#edf2f7', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
