import SourceManager from '@/components/SourceManager';
import ProviderSelector from '@/components/ProviderSelector';

export default function SettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#3b82f6',
          marginBottom: '3px',
        }}>
          ⚙️ 设置
        </h1>
        <p style={{
          color: '#5a5a5a',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        }}>
          管理数据源、AI 模型和系统配置
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <ProviderSelector />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          marginBottom: '8px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: '#f0f0f0',
        }}>
          📡 数据源管理
        </h3>
        <p style={{
          color: '#8b8b8b',
          fontSize: '13px',
          marginBottom: '16px',
          lineHeight: 1.5,
        }}>
          添加、删除或启用/禁用数据源。系统会从启用的数据源中自动抓取内容。
        </p>
        <SourceManager />
      </div>

      {/* System Info */}
      <div style={{
        maxWidth: '600px',
        padding: '16px 20px',
        background: '#282c34',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
      }}>
        <h3 style={{
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: '#f0f0f0',
        }}>
          🔧 系统信息
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '13px',
        }}>
          {[
            ['框架', 'Next.js 15 (App Router)'],
            ['部署', 'Vercel'],
            ['数据库', 'Vercel KV (Upstash Redis)'],
            ['AI 引擎', '多模型支持 (Ollama / Gemini / DeepSeek / 通义 / 智谱)'],
            ['邮件', 'QQ 邮箱 SMTP'],
            ['定时任务', '每日 08:00 (北京时间)'],
            ['内容去重', '✅ 跨源自自动去重'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b8b8b' }}>{label}</span>
              <span style={{ color: '#f0f0f0', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
