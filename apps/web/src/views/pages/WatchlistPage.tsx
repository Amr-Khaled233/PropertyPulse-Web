// Portfolio page (View) — saved properties + built-in AI comparison.

import { Link } from 'react-router-dom';
import { useCompareViewModel } from '../../viewmodels/useCompareViewModel';
import { useWatchlistViewModel } from '../../viewmodels/useWatchlistViewModel';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { CompareResult } from '../components/property/CompareResult';
import { propertyImage } from '../../utils/propertyImages';
import { formatCompactCurrency } from '../../utils/formatters';

export function WatchlistPage() {
  const vm = useCompareViewModel();
  const watch = useWatchlistViewModel();
  const { t } = useI18n();

  if (vm.loading) return <Loader full />;

  return (
    <div className="col" style={{ gap: 20 }}>
      <h2 style={{ margin: 0 }}>{t('watch.title')}</h2>

      {vm.pool.length === 0 ? (
        <div className="card card-pad muted center" style={{ padding: '48px 24px' }}>{t('watch.empty')}</div>
      ) : (
        <>
          <div className="grid grid-4" style={{ gap: 14 }}>
            {vm.pool.map((p) => {
              const on = vm.selected.includes(p.id);
              return (
                <div key={p.id} className={`card compare-pick${on ? ' on' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
                  <button className="compare-pick-img" style={{ height: 110, backgroundImage: `url(${propertyImage(p)})` }} onClick={() => vm.toggle(p.id)}>
                    <span className="compare-check">{on ? '✓' : ''}</span>
                  </button>
                  <div style={{ padding: 12 }}>
                    <strong className="truncate" style={{ display: 'block', fontSize: '0.9rem' }}>{p.title}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>{formatCompactCurrency(p.price, p.currency)} · {p.areaSqm} m²</div>
                    <div className="center-row" style={{ gap: 8, marginTop: 8 }}>
                      <Link to={ROUTES.property(p.id)} className="btn btn-outline btn-sm">{t('watch.view')}</Link>
                      <button className="icon-btn icon-btn-sm" title={t('watch.remove')} onClick={() => {
                        const entry = watch.entries.find((e) => e.propertyId === p.id);
                        if (entry) watch.remove(entry.id);
                      }}>★</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {vm.pool.length >= 2 && (
            <div className="center-row" style={{ gap: 12 }}>
              <Button variant="green" onClick={vm.compare} disabled={!vm.canCompare || vm.comparing}>
                {vm.comparing ? t('compare.comparing') : t('compare.cta')}
              </Button>
              {vm.selected.length > 0 && <button className="btn btn-outline btn-sm" onClick={vm.reset}>{t('compare.clear')}</button>}
            </div>
          )}

          {vm.comparing && <Loader label={t('compare.comparing')} />}
          {vm.result && <CompareResult result={vm.result} />}
        </>
      )}
    </div>
  );
}
