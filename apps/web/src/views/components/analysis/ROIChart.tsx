// 5-year cumulative cash-flow + appreciation projection (recharts area/bar).

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { InvestmentMetrics } from '@propertypulse/shared-types';
import { theme } from '../../../styles/theme';

interface Props {
  metrics: InvestmentMetrics;
  height?: number;
}

const compact = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}K`;
  return String(Math.round(v));
};

export function ROIChart({ metrics, height = 240 }: Props) {
  // Project cumulative return across 5 years from the computed metrics.
  const data = Array.from({ length: 5 }).map((_, i) => {
    const year = i + 1;
    const cumulativeCashFlow = metrics.annualCashFlow * year;
    const cumulativeRoi = (metrics.fiveYearRoi / 5) * year;
    return {
      year: `Y${year}`,
      cashFlow: Math.round(cumulativeCashFlow),
      roi: Number(cumulativeRoi.toFixed(1)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={compact} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={56} />
        <Tooltip
          formatter={(v: number, n) => [n === 'ROI %' ? `${v}%` : `${compact(v)} EGP`, n]}
          contentStyle={{ background: theme.colors.navy, border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }}
        />
        <Bar dataKey="cashFlow" name="Cumulative Cash Flow" fill={theme.colors.success} radius={[4, 4, 0, 0]} barSize={26} />
        <Line type="monotone" dataKey="roi" name="ROI %" stroke={theme.colors.orange} strokeWidth={2.5} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
