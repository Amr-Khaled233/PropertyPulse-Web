// Market Trends page (View) — Egyptian market analytics matching the design.

import { useI18n } from '../../i18n';
import { MarketTrendChart } from '../components/analysis/MarketTrendChart';
import { RentalYieldCard } from '../components/analysis/RentalYieldCard';
import { MOCK_MARKET_TRENDS } from '../../services/mock/mockData';

const HEATMAP = [
  [3, 4, 2, 5, 3, 4, 5],
  [2, 5, 4, 3, 5, 4, 3],
  [4, 3, 5, 4, 2, 5, 4],
];
const shade = (v: number) => `rgba(14,155,114,${0.15 + v * 0.16})`;

export function MarketTrendsPage() {
  const { t } = useI18n();

  return (
    <div className="col" style={{ gap: 22 }}>
      <div className="grid grid-3">
        <RentalYieldCard label="Price Index YoY" value="+24.4%" positive sub="vs. prior year" />
        <RentalYieldCard label="Mobile Supply" value="14,280" sub="active listings" />
        <RentalYieldCard label="Institutional Buy" value="EGP 2.1B" positive sub="this quarter" dark />
      </div>

      <div className="row wrap" style={{ gap: 22, alignItems: 'stretch' }}>
        <div className="grow card card-pad" style={{ minWidth: 280 }}>
          <h3>{t('market.appreciation')}</h3>
          <MarketTrendChart data={MOCK_MARKET_TRENDS} height={300} />
        </div>

        <div className="card-dark card-pad" style={{ width: 280, maxWidth: '100%', flexShrink: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--green)' }}>{t('market.analystNote')}</span>
          <p style={{ color: 'var(--text-on-dark)', marginTop: 10, fontSize: '0.9rem' }}>
            The Egyptian market continues its upward momentum. New Cairo and Sheikh Zayed lead appreciation,
            driven by compound demand and institutional inflows.
          </p>
          <div className="divider" style={{ background: 'var(--navy-600)' }} />
          <span className="badge badge-orange">⚠ {t('market.riskFactor')}: Moderate</span>
          <p style={{ color: 'var(--text-on-dark-muted)', marginTop: 10, fontSize: '0.82rem' }}>
            Currency volatility and interest-rate shifts may compress short-term yields in select corridors.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3>{t('market.rentalDemand')}</h3>
          <div className="col" style={{ gap: 6 }}>
            {HEATMAP.map((row, i) => (
              <div key={i} className="row" style={{ gap: 6 }}>
                {row.map((v, j) => (
                  <div key={j} style={{ flex: 1, height: 34, borderRadius: 6, background: shade(v) }} title={`Demand ${v}/5`} />
                ))}
              </div>
            ))}
          </div>
          <div className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>Weekly rental demand intensity by district.</div>
        </div>

        <div className="card card-pad">
          <h3>Inventory Velocity</h3>
          <div className="col" style={{ gap: 14 }}>
            {[
              { label: 'New Cairo', v: 86 },
              { label: 'Sheikh Zayed', v: 72 },
              { label: 'Heliopolis', v: 64 },
              { label: 'Maadi', v: 51 },
            ].map((r) => (
              <div key={r.label}>
                <div className="between" style={{ fontSize: '0.85rem' }}>
                  <span>{r.label}</span>
                  <span className="muted">{r.v}%</span>
                </div>
                <div className="meter" style={{ marginTop: 4 }}>
                  <span style={{ width: `${r.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
