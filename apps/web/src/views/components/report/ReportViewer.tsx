// Renders a full InvestmentReport: summary, recommendation, metrics, risk, trends.

import type { InvestmentReport } from '@propertypulse/shared-types';
import { RECOMMENDATION_LABELS, RECOMMENDATION_COLORS } from '../../../utils/constants';
import { formatPercent, formatCompactCurrency, formatYears } from '../../../utils/formatters';
import { MarketTrendChart } from '../analysis/MarketTrendChart';
import { ROIChart } from '../analysis/ROIChart';
import { RiskMeter } from '../analysis/RiskMeter';
import { RentalYieldCard } from '../analysis/RentalYieldCard';

interface Props {
  report: InvestmentReport;
}

export function ReportViewer({ report }: Props) {
  const rec = report.recommendation;
  const m = report.metrics;

  return (
    <div className="col" style={{ gap: 22 }}>
      <div className="card card-pad">
        <div className="between wrap" style={{ gap: 12 }}>
          <div>
            <span className="eyebrow">AI Investment Report</span>
            <h2 style={{ margin: '6px 0 0' }}>Recommendation</h2>
          </div>
          <span
            className="badge"
            style={{ background: RECOMMENDATION_COLORS[rec], color: '#fff', fontSize: '0.9rem', padding: '8px 16px' }}
          >
            {RECOMMENDATION_LABELS[rec]} · {Math.round(report.confidence * 100)}%
          </span>
        </div>
        <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>{report.summary}</p>
      </div>

      <div className="grid grid-4">
        <RentalYieldCard label="Net Yield" value={formatPercent(m.netRentalYield)} />
        <RentalYieldCard label="5-Year ROI" value={formatPercent(m.fiveYearRoi)} positive sub="projected" />
        <RentalYieldCard label="Monthly Cash Flow" value={formatCompactCurrency(m.monthlyCashFlow, 'EGP')} />
        <RentalYieldCard label="Break-even" value={formatYears(m.breakEvenYears)} />
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3>5-Year Projection</h3>
          <ROIChart metrics={m} />
        </div>
        <div className="card card-pad">
          <h3>Risk Assessment</h3>
          <RiskMeter risk={report.risk} />
        </div>
      </div>

      <div className="card card-pad">
        <h3>Market Trends</h3>
        <MarketTrendChart data={report.marketTrends} />
      </div>
    </div>
  );
}
