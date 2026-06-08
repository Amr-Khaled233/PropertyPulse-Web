// Market trend line chart (median price + median rent over time).

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { MarketTrendPoint } from '@propertypulse/shared-types';
import { theme } from '../../../styles/theme';

interface Props {
  data: MarketTrendPoint[];
  height?: number;
}

export function MarketTrendChart({ data, height = 260 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          contentStyle={{
            background: theme.colors.navy,
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="medianPrice" name="Median Price" stroke={theme.colors.primary} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="medianRent" name="Median Rent" stroke={theme.colors.success} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
