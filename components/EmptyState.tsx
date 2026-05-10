interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
}

export default function EmptyState({ icon, title, description, iconColor = '#88C0D0' }: EmptyStateProps) {
  const dimBg = 'rgba(136, 192, 208, 0.08)';
  const dimBorder = 'rgba(136, 192, 208, 0.15)';

  return (
    <div style={{
      textAlign: 'center',
      padding: '64px',
      color: '#4C566A',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: dimBg,
        border: `1px solid ${dimBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '24px',
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#D8DEE9',
        marginBottom: '8px',
        fontFamily: 'var(--font-sans)',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '14px',
        maxWidth: '400px',
        margin: '0 auto',
        lineHeight: 1.6,
      }}>
        {description}
      </div>
    </div>
  );
}
