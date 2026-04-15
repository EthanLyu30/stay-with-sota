import SourceManager from '@/components/SourceManager';
import ProviderSelector from '@/components/ProviderSelector';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ 设置</h1>
        <p className="page-subtitle">管理数据源、AI 模型和系统配置</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <ProviderSelector />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>📡 数据源管理</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          添加、删除或启用/禁用数据源。系统会从启用的数据源中自动抓取内容。
        </p>
        <SourceManager />
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>🔧 系统信息</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>框架</span>
            <span>Next.js 15 (App Router)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>部署</span>
            <span>Vercel</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>数据库</span>
            <span>Vercel KV (Upstash Redis)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>AI 引擎</span>
            <span>多模型支持 (Ollama / Gemini / DeepSeek / 通义 / 智谱)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>邮件</span>
            <span>QQ 邮箱 SMTP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>定时任务</span>
            <span>每日 08:00 (北京时间)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>内容去重</span>
            <span>✅ 跨源自动去重</span>
          </div>
        </div>
      </div>
    </div>
  );
}
