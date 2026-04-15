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
        border: '1px solid rgba(136, 192, 208, 0.2)',
        borderRadius: '6px',
        color: '#88C0D0',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#88C0D0';
        (e.currentTarget as HTMLButtonElement).style.color = '#88C0D0';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(136, 192, 208, 0.2)';
        (e.currentTarget as HTMLButtonElement).style.color = '#88C0D0';
      }}
    >
      ↓ Markdown
    </button>
  );
}
