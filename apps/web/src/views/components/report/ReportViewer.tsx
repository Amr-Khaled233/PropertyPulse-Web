// Renders a full InvestmentReport: summary, recommendation, metrics, risk, trends.

import type { InvestmentReport } from '@propertypulse/shared-types';
import { RECOMMENDATION_COLORS } from '../../../utils/constants';
import { useI18n, type TranslationKey } from '../../../i18n';
import { formatPercent, formatCompactCurrency } from '../../../utils/formatters';
import { MarketTrendChart } from '../analysis/MarketTrendChart';
import { ROIChart } from '../analysis/ROIChart';
import { RiskMeter } from '../analysis/RiskMeter';
import { RentalYieldCard } from '../analysis/RentalYieldCard';

interface Props {
  report: InvestmentReport;
}

export function ReportViewer({ report }: Props) {
  const { t } = useI18n();
  const rec = report.recommendation;
  const m = report.metrics;
  const breakEven = Number.isFinite(m.breakEvenYears)
    ? `${m.breakEvenYears.toFixed(1)} ${t('report.years')}`
    : '—';

  return (
    <div className="col" style={{ gap: 22 }}>
      <div className="card card-pad">
        <div className="between wrap" style={{ gap: 12 }}>
          <div>
            <span className="eyebrow">{t('report.eyebrow')}</span>
            <h2 style={{ margin: '6px 0 0' }}>{t('report.recommendation')}</h2>
          </div>
          <span
            className="badge"
            style={{ background: RECOMMENDATION_COLORS[rec], color: '#fff', fontSize: '0.9rem', padding: '8px 16px' }}
          >
            {t(`report.rec.${rec}` as TranslationKey)} · {Math.round(report.confidence * 100)}%
          </span>
        </div>
        <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>{report.summary}</p>
      </div>

      <div className="grid grid-4">
        <RentalYieldCard label={t('report.netYield')} value={formatPercent(m.netRentalYield)} />
        <RentalYieldCard label={t('report.roi')} value={formatPercent(m.fiveYearRoi)} positive sub={t('report.projected')} />
        <RentalYieldCard label={t('report.cashFlow')} value={formatCompactCurrency(m.monthlyCashFlow, 'EGP')} />
        <RentalYieldCard label={t('report.breakEven')} value={breakEven} />
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3>{t('report.projection')}</h3>
          <ROIChart metrics={m} />
        </div>
        <div className="card card-pad">
          <h3>{t('report.risk')}</h3>
          <RiskMeter risk={report.risk} />
        </div>
      </div>

      <div className="card card-pad">
        <h3>{t('report.trends')}</h3>
        <MarketTrendChart data={report.marketTrends} />
      </div>
    </div>
  );
}
