// Median price appreciation line chart.

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { MarketTrendPoint } from '@propertypulse/shared-types';
import { theme } from '../../../styles/theme';

interface Props {
  data: MarketTrendPoint[];
  height?: number;
}

/** Compact axis numbers, e.g. 45000 → 45K, 2000000 → 2M. */
const compact = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
};

export function MarketTrendChart({ data, height = 260 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tickFormatter={compact} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          formatter={(v: number) => [`${compact(v)} EGP`, 'Median price']}
          contentStyle={{ background: theme.colors.navy, border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }}
        />
        {/* Single, clear appreciation line (rent was on the same axis and looked
            flat at this scale, so it's removed for clarity). */}
        <Line type="monotone" dataKey="medianPrice" name="Median price" stroke={theme.colors.primary} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
