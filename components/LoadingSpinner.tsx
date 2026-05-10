interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 28, text = '加载中...' }: LoadingSpinnerProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px',
      color: '#4C566A',
      fontSize: '13px',
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '2px solid rgba(216, 222, 233, 0.08)',
        borderTopColor: '#88C0D0',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        marginBottom: '12px',
      }} />
      {text}
    </div>
  );
}
