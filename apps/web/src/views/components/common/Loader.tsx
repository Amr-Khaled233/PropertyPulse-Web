// Loading spinner component.

interface LoaderProps {
  label?: string;
  full?: boolean;
}

export function Loader({ label, full = false }: LoaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: full ? '80px 0' : '28px 0',
        color: 'var(--text-muted)',
      }}
    >
      <span className="spinner" />
      {label && <span style={{ fontSize: '0.85rem' }}>{label}</span>}
    </div>
  );
}
