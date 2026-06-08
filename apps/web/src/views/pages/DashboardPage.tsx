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
            value={formatCompactCurrency(vm.portfolioValue || 24_500_000, 'EGP')}
            positive
            sub="1.2% this month"
          />
          <RentalYieldCard label={t('dash.rentalYield')} value={`${vm.avgYield}%`} sub="Benchmark 6.5%" />
          <RentalYieldCard label={t('dash.propertiesTracked')} value={String(vm.propertiesTracked || 12)} sub="pending verification" />
          <RentalYieldCard label={t('dash.aiScore')} value={`${vm.aiMarketScore}/10`} sub="High Opportunity Zone" dark />
        </div>

        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{t('dash.activePortfolio')}</h3>
            <Link to={ROUTES.watchlist} className="accent" style={{ fontSize: '0.85rem' }}>{t('common.viewAll')} ›</Link>
          </div>

          {vm.loading ? (
            <Loader />
          ) : (
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
                {(vm.entries.length ? vm.entries : []).map((e, i) => (
                  <tr key={e.id}>
                    <td>
                      <Link to={e.property ? ROUTES.property(e.property.id) : ROUTES.watchlist}>
                        <strong>{e.property?.title ?? 'Property'}</strong>
                        <div className="muted" style={{ fontSize: '0.78rem' }}>
                          {e.property?.address.city}, {e.property?.address.country}
                        </div>
                      </Link>
                    </td>
                    <td>{e.property ? formatCompactCurrency(e.property.price, 'EGP') : '—'}</td>
                    <td>
                      <span className={`badge ${i % 3 === 0 ? 'badge-green' : i % 3 === 1 ? 'badge-soft' : 'badge-green'}`}>
                        {i % 3 === 1 ? 'Stable 6.8%' : `High ${(12 + i).toFixed(1)}%`}
                      </span>
                    </td>
                    <td style={{ color: i % 3 === 1 ? 'var(--text-muted)' : 'var(--green)' }}>
                      {i % 3 === 1 ? '→' : '↗'}
                    </td>
                  </tr>
                ))}
                {!vm.entries.length && (
                  <tr><td colSpan={4} className="muted center">No tracked properties yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ width: 340, maxWidth: '100%', flexShrink: 0 }}>
        <AdvisorPanel />
      </div>
    </div>
  );
}
