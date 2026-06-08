// ViewModel: watchlist (saved properties) with add/remove.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService } from '../services/api/watchlistService';
import { useUiStore } from '../store/uiStore';
import { QUERY_KEYS } from '../utils/constants';

export function useWatchlistViewModel() {
  const qc = useQueryClient();
  const pushToast = useUiStore((s) => s.pushToast);

  const list = useQuery({
    queryKey: [QUERY_KEYS.watchlist],
    queryFn: () => watchlistService.list(),
  });

  const add = useMutation({
    mutationFn: (propertyId: string) => watchlistService.add(propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.watchlist] });
      pushToast('Added to watchlist', 'success');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => watchlistService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.watchlist] });
      pushToast('Removed from watchlist', 'info');
    },
  });

  const entries = list.data ?? [];

  return {
    loading: list.isLoading,
    entries,
    isWatched: (propertyId: string) => entries.some((e) => e.propertyId === propertyId),
    add: (propertyId: string) => add.mutate(propertyId),
    remove: (id: string) => remove.mutate(id),
  };
}
