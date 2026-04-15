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
        border: '1px solid rgba(129, 140, 248, 0.2)',
        borderRadius: '6px',
        color: '#818CF8',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129, 140, 248, 0.1)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129, 140, 248, 0.3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129, 140, 248, 0.2)';
      }}
    >
      ↓ Markdown
    </button>
  );
}
