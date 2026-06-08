// A single metric stat card (label, value, optional trend sub-line).

interface Props {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  dark?: boolean;
}

export function RentalYieldCard({ label, value, sub, positive, dark = false }: Props) {
  return (
    <div className={`${dark ? 'card-dark' : 'card'} stat`}>
      <div className="stat-label" style={dark ? { color: 'var(--text-on-dark-muted)' } : undefined}>
        {label}
      </div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div
          className="stat-sub"
          style={{ color: positive === undefined ? 'var(--text-muted)' : positive ? 'var(--green)' : 'var(--orange)' }}
        >
          {positive !== undefined ? (positive ? '▲ ' : '▼ ') : ''}
          {sub}
        </div>
      )}
    </div>
  );
}
