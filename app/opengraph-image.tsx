import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2E3440',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>❄️</div>
        <div style={{ fontSize: '48px', fontWeight: 700, color: '#ECEFF4', marginBottom: '12px' }}>
          SOTA Daily
        </div>
        <div style={{ fontSize: '24px', color: '#88C0D0' }}>
          AI 领域最新动态，每日精选推送
        </div>
      </div>
    ),
    { ...size }
  );
}
