export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      paddingTop: '56px',
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        border: '2px solid rgba(216, 222, 233, 0.08)',
        borderTopColor: '#88C0D0',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        marginBottom: '12px',
      }} />
      <div style={{
        color: '#4C566A',
        fontSize: '13px',
        fontFamily: 'var(--font-sans)',
      }}>
        加载中...
      </div>
    </div>
  );
}
