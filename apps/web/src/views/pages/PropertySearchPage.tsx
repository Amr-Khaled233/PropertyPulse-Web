// Property search page (View).

import { usePropertySearchViewModel } from '../../viewmodels/usePropertySearchViewModel';
import { useWatchlistViewModel } from '../../viewmodels/useWatchlistViewModel';
import { useI18n } from '../../i18n';
import { PropertyFilters } from '../components/property/PropertyFilters';
import { PropertyList } from '../components/property/PropertyList';
import { Pagination } from '../components/common/Pagination';
import { Loader } from '../components/common/Loader';

export function PropertySearchPage() {
  const vm = usePropertySearchViewModel();
  const watch = useWatchlistViewModel();
  const { t } = useI18n();

  return (
    <div className="col" style={{ gap: 18 }}>
      <PropertyFilters filters={vm.filters} towns={vm.towns} onChange={vm.update} onReset={vm.reset} />

      <div className="between">
        <span className="muted">
          {vm.total.toLocaleString()} {t('search.results')}
        </span>
        {vm.isFetching && <span className="muted" style={{ fontSize: '0.8rem' }}>{t('common.loading')}</span>}
      </div>

      {vm.loading ? (
        <Loader full />
      ) : (
        <>
          <PropertyList
            properties={vm.properties}
            watchedIds={watch.entries.map((e) => e.propertyId)}
            onToggleWatch={(id) => (watch.isWatched(id) ? undefined : watch.add(id))}
            empty={t('search.empty')}
          />
          <Pagination page={vm.page} pageSize={vm.pageSize} total={vm.total} onPage={vm.setPage} />
        </>
      )}
    </div>
  );
}
