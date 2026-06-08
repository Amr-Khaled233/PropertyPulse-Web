// Watchlist / Portfolio page (View).

import { useWatchlistViewModel } from '../../viewmodels/useWatchlistViewModel';
import { useI18n } from '../../i18n';
import { Loader } from '../components/common/Loader';
import { PropertyList } from '../components/property/PropertyList';

export function WatchlistPage() {
  const vm = useWatchlistViewModel();
  const { t } = useI18n();

  if (vm.loading) return <Loader full />;

  const properties = vm.entries.map((e) => e.property).filter(Boolean) as NonNullable<typeof vm.entries[number]['property']>[];

  return (
    <div className="col" style={{ gap: 18 }}>
      <h2 style={{ margin: 0 }}>{t('watch.title')}</h2>
      <PropertyList
        properties={properties}
        watchedIds={properties.map((p) => p.id)}
        onToggleWatch={(id) => {
          const entry = vm.entries.find((e) => e.propertyId === id);
          if (entry) vm.remove(entry.id);
        }}
        empty={t('watch.empty')}
      />
    </div>
  );
}
