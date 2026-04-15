'use client';

interface ExportButtonProps {
  digestId: string;
  date: string;
}

export default function ExportButton({ digestId }: ExportButtonProps) {
  return (
    <button
      onClick={() => window.open(`/api/export/${digestId}`, '_blank')}
      style={{
        height: '32px',
        padding: '0 14px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        color: '#9ca3af',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16, 185, 129, 0.3)';
        (e.currentTarget as HTMLButtonElement).style.color = '#10b981';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
        (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
      }}
    >
      \u2193 markdown
    </button>
  );
}
