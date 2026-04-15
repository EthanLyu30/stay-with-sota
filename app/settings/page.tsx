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
          background: 'linear-gradient(135deg, #10b981, #6ee7b7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '3px',
        }}>
          \u2699\uFE0F \u8BBE\u7F6E
        </h1>
        <p style={{
          color: '#555',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        }}>
          \u7BA1\u7406\u6570\u636E\u6E90\u3001AI \u6A21\u578B\u548C\u7CFB\u7EDF\u914D\u7F6E
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
          color: '#e8e8e8',
        }}>
          \uD83D\uDCE1 \u6570\u636E\u6E90\u7BA1\u7406
        </h3>
        <p style={{
          color: '#8b8b8b',
          fontSize: '13px',
          marginBottom: '16px',
          lineHeight: 1.5,
        }}>
          \u6DFB\u52A0\u3001\u5220\u9664\u6216\u542F\u7528/\u7981\u7528\u6570\u636E\u6E90\u3002\u7CFB\u7EDF\u4F1A\u4ECE\u542F\u7528\u7684\u6570\u636E\u6E90\u4E2D\u81EA\u52A8\u6293\u53D6\u5185\u5BB9\u3002
        </p>
        <SourceManager />
      </div>

      {/* System Info */}
      <div style={{
        maxWidth: '600px',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
      }}>
        <h3 style={{
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: '#e8e8e8',
        }}>
          \uD83D\uDD27 \u7CFB\u7EDF\u4FE1\u606F
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '13px',
        }}>
          {[
            ['\u6846\u67B6', 'Next.js 15 (App Router)'],
            ['\u90E8\u7F72', 'Vercel'],
            ['\u6570\u636E\u5E93', 'Vercel KV (Upstash Redis)'],
            ['AI \u5F15\u64CE', '\u591A\u6A21\u578B\u652F\u6301 (Ollama / Gemini / DeepSeek / \u901A\u4E49 / \u667A\u8C31)'],
            ['\u90AE\u4EF6', 'QQ \u90AE\u7BB1 SMTP'],
            ['\u5B9A\u65F6\u4EFB\u52A1', '\u6BCF\u65E5 08:00 (\u5317\u4EAC\u65F6\u95F4)'],
            ['\u5185\u5BB9\u53BB\u91CD', '\u2705 \u8DE8\u6E90\u81EA\u52A8\u53BB\u91CD'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b8b8b' }}>{label}</span>
              <span style={{ color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
