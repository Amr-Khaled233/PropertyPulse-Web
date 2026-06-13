// Side-by-side comparison table + AI/score ranking for selected properties.

import type { ComparisonResult } from '../../../services/api/analysisService';
import { useI18n } from '../../../i18n';
import { formatCompactCurrency, formatPercent, formatNumber } from '../../../utils/formatters';
import { Markdown } from '../common/Markdown';

const REC_COLOR: Record<string, string> = {
  buy: 'var(--green)',
  hold: 'var(--orange)',
  avoid: '#dc2626',
};

export function CompareResult({ result }: { result: ComparisonResult }) {
  const { t } = useI18n();
  const rankOf = (id: string) => result.ranking.find((r) => r.propertyId === id)?.rank;
  const best = result.ranking.find((r) => r.rank === 1)?.propertyId;

  const rows: { label: string; get: (c: ComparisonResult['candidates'][number]) => string }[] = [
    { label: 'Price', get: (c) => formatCompactCurrency(c.property.price, c.property.currency) },
    { label: 'Area', get: (c) => `${formatNumber(c.property.areaSqm)} m²` },
    { label: 'Price / m²', get: (c) => formatCompactCurrency(c.pricePerSqm, c.property.currency) },
    { label: 'vs market', get: (c) => `${c.pricePositionPct > 0 ? '+' : ''}${c.pricePositionPct}%` },
    { label: 'Net yield', get: (c) => formatPercent(c.metrics.netRentalYield) },
    { label: 'Cap rate', get: (c) => formatPercent(c.metrics.capRate) },
    { label: '5-yr ROI', get: (c) => formatPercent(c.metrics.fiveYearRoi) },
  ];

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="table-scroll">
        <table className="table compare-table">
          <thead>
            <tr>
              <th></th>
              {result.candidates.map((c) => (
                <th key={c.property.id} className={c.property.id === best ? 'best-col' : ''}>
                  <div className="truncate" style={{ maxWidth: 180 }}>{c.property.title}</div>
                  <span className="badge" style={{ background: REC_COLOR[c.recommendation], color: '#fff', marginTop: 4 }}>
                    {c.recommendation.toUpperCase()}
                  </span>
                  {rankOf(c.property.id) && <div className="muted" style={{ fontSize: '0.72rem', marginTop: 2 }}>Rank #{rankOf(c.property.id)}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="muted"><strong>{r.label}</strong></td>
                {result.candidates.map((c) => (
                  <td key={c.property.id} className={c.property.id === best ? 'best-col' : ''}>{r.get(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(result.verdict || result.ranking.length > 0) && (
        <div className="card card-pad" style={{ borderInlineStart: '3px solid var(--green)' }}>
          <b className="serif">{t('compare.verdict')}</b>
          {result.verdict && <div style={{ marginTop: 8 }}><Markdown text={result.verdict} /></div>}
          {result.ranking.length > 0 && (
            <ol style={{ marginTop: 10, paddingInlineStart: 20 }}>
              {[...result.ranking].sort((a, b) => a.rank - b.rank).map((r) => {
                const c = result.candidates.find((x) => x.property.id === r.propertyId);
                return <li key={r.propertyId} style={{ marginBottom: 6 }}><strong>{c?.property.title ?? r.propertyId}</strong> — {r.rationale}</li>;
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
