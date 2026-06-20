// Market Trends page (View) — live Egyptian market analytics from the dataset.

import { useI18n } from '../../i18n';
import { useMarketViewModel } from '../../viewmodels/useMarketViewModel';
import { MarketTrendChart } from '../components/analysis/MarketTrendChart';
import { RentalYieldCard } from '../components/analysis/RentalYieldCard';
import { Loader } from '../components/common/Loader';
import { formatCompactCurrency, formatNumber } from '../../utils/formatters';

export function MarketTrendsPage() {
  const { t } = useI18n();
  const { loading, data } = useMarketViewModel();

  if (loading || !data) return <Loader full />;

  return (
    <div className="col" style={{ gap: 22 }}>
      <div className="grid grid-3">
        <RentalYieldCard
          label={t('market.priceIndex')}
          value={`${data.appreciationPct >= 0 ? '+' : ''}${data.appreciationPct}%`}
          positive={data.appreciationPct >= 0}
          sub={t('market.vsPrior')}
        />
        <RentalYieldCard label={t('market.activeListings')} value={formatNumber(data.activeListings)} sub={t('market.liveListings')} />
        <RentalYieldCard label={t('market.totalValue')} value={formatCompactCurrency(data.totalValue, 'EGP')} positive sub={t('market.acrossDataset')} dark />
      </div>

      <div className="row wrap" style={{ gap: 22, alignItems: 'stretch' }}>
        <div className="grow card card-pad" style={{ minWidth: 280 }}>
          <h3>{t('market.appreciation')}</h3>
          {data.trend.length > 0 ? (
            <MarketTrendChart data={data.trend} height={300} />
          ) : (
            <p className="muted center" style={{ padding: 40 }}>{t('market.noTrend')}</p>
          )}
        </div>

        <div className="card-dark card-pad app-aside" style={{ width: 280, maxWidth: '100%', flexShrink: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--green)' }}>{t('market.analystNote')}</span>
          <p style={{ color: 'var(--text-on-dark)', marginTop: 10, fontSize: '0.9rem' }}>
            {t('market.note')
              .replace('{listings}', formatNumber(data.activeListings))
              .replace('{top}', data.topDistricts[0]?.name ?? '—')
              .replace('{avg}', formatCompactCurrency(data.avgPrice, 'EGP'))}
          </p>
          <div className="divider" style={{ background: 'var(--navy-600)' }} />
          <span className="badge badge-orange">⚠ {t('market.riskFactor')}: Moderate</span>
          <p style={{ color: 'var(--text-on-dark-muted)', marginTop: 10, fontSize: '0.82rem' }}>
            {t('market.riskNote')}
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3>{t('market.byType')}</h3>
          <div className="col" style={{ gap: 14 }}>
            {data.byType.slice(0, 6).map((r) => {
              const pct = Math.round((r.count / data.activeListings) * 100);
              return (
                <div key={r.type}>
                  <div className="between" style={{ fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{r.type}</span>
                    <span className="muted">{formatNumber(r.count)} · {pct}%</span>
                  </div>
                  <div className="meter" style={{ marginTop: 4 }}><span style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad">
          <h3>{t('market.topAreas')}</h3>
          <div className="col" style={{ gap: 14 }}>
            {data.topDistricts.map((r) => (
              <div key={r.name}>
                <div className="between" style={{ fontSize: '0.85rem' }}>
                  <span>{r.name}</span>
                  <span className="muted">{formatNumber(r.count)} · {r.sharePct}%</span>
                </div>
                <div className="meter" style={{ marginTop: 4 }}>
                  <span style={{ width: `${r.sharePct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
