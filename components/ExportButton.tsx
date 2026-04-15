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
        color: '#8b8b8b',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59, 130, 246, 0.3)';
        (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
        (e.currentTarget as HTMLButtonElement).style.color = '#8b8b8b';
      }}
    >
      ↓ markdown
    </button>
  );
}
