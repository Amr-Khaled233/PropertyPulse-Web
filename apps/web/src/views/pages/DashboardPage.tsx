// Dashboard page (View). Reads state from useDashboardViewModel.

import { Link } from 'react-router-dom';
import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { formatCompactCurrency } from '../../utils/formatters';
import { RentalYieldCard } from '../components/analysis/RentalYieldCard';
import { Loader } from '../components/common/Loader';
import { AdvisorPanel } from '../components/chat/AdvisorPanel';

export function DashboardPage() {
  const vm = useDashboardViewModel();
  const { t } = useI18n();

  return (
    <div className="row wrap" style={{ gap: 22, alignItems: 'flex-start' }}>
      <div className="grow col" style={{ gap: 22, minWidth: 280 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>{t('dash.title')}</h2>
          <p className="muted" style={{ margin: 0 }}>{t('dash.welcome')}</p>
        </div>

        <div className="grid grid-4">
          <RentalYieldCard
            label={t('dash.portfolioValue')}
            value={formatCompactCurrency(vm.portfolioValue, 'EGP')}
            positive={vm.hasPortfolio || undefined}
            sub={vm.hasPortfolio ? `${vm.monthlyChangePct.toFixed(1)}% this month` : t('dash.emptyHint')}
          />
          <RentalYieldCard
            label={t('dash.rentalYield')}
            value={vm.hasPortfolio ? `${vm.avgYield.toFixed(1)}%` : '—'}
            sub={vm.hasPortfolio ? 'Benchmark 6.5%' : undefined}
          />
          <RentalYieldCard
            label={t('dash.propertiesTracked')}
            value={String(vm.propertiesTracked)}
            sub={vm.hasPortfolio ? t('dash.tracked') : t('dash.emptyHint')}
          />
          <RentalYieldCard
            label={t('dash.aiScore')}
            value={vm.hasPortfolio ? `${vm.aiMarketScore.toFixed(1)}/10` : '—'}
            sub={vm.hasPortfolio ? 'High Opportunity Zone' : undefined}
            dark
          />
        </div>

        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{t('dash.activePortfolio')}</h3>
            <Link to={ROUTES.watchlist} className="accent" style={{ fontSize: '0.85rem' }}>{t('common.viewAll')} ›</Link>
          </div>

          {vm.loading ? (
            <Loader />
          ) : (
            <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('dash.property')}</th>
                  <th>{t('dash.estValue')}</th>
                  <th>{t('dash.roiStatus')}</th>
                  <th>{t('dash.trend')}</th>
                </tr>
              </thead>
              <tbody>
                {vm.items.map((it) => {
                  const e = it.entry;
                  const yieldPct = it.metrics?.netRentalYield ?? 0;
                  const rec = it.recommendation;
                  const badgeClass = rec === 'buy' ? 'badge-green' : rec === 'avoid' ? 'badge-red' : 'badge-soft';
                  const label = rec === 'buy' ? 'High' : rec === 'avoid' ? 'Low' : 'Stable';
                  const up = rec !== 'avoid';
                  return (
                    <tr key={e.id}>
                      <td>
                        <Link to={it.property ? ROUTES.property(it.property.id) : ROUTES.watchlist}>
                          <strong>{it.property?.title ?? 'Property'}</strong>
                          <div className="muted" style={{ fontSize: '0.78rem' }}>
                            {it.property?.address.city}, {it.property?.address.country}
                          </div>
                        </Link>
                      </td>
                      <td>{it.property ? formatCompactCurrency(it.property.price, 'EGP') : '—'}</td>
                      <td>
                        {it.metrics ? (
                          <span className={`badge ${badgeClass}`}>{label} {yieldPct.toFixed(1)}%</span>
                        ) : '—'}
                      </td>
                      <td style={{ color: up ? 'var(--green)' : 'var(--text-muted)' }}>{up ? '↗' : '→'}</td>
                    </tr>
                  );
                })}
                {!vm.items.length && (
                  <tr><td colSpan={4} className="muted center">No tracked properties yet.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: 340, maxWidth: '100%', flexShrink: 0 }}>
        <AdvisorPanel />
      </div>
    </div>
  );
}
