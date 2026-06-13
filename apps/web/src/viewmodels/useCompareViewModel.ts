// ViewModel: AI property comparison — pick 2–4 saved properties and rank them.

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analysisService, type ComparisonResult } from '../services/api/analysisService';
import { useWatchlistViewModel } from './useWatchlistViewModel';
import { useUiStore } from '../store/uiStore';
import { toErrorMessage } from '../services/api/apiClient';
import type { Property } from '@propertypulse/shared-types';

const MAX = 4;

export function useCompareViewModel() {
  const watch = useWatchlistViewModel();
  const lang = useUiStore((s) => s.lang);
  const pushToast = useUiStore((s) => s.pushToast);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Saved properties are the pool to compare from.
  const pool: Property[] = watch.entries
    .map((e) => e.property)
    .filter((p): p is Property => Boolean(p));

  function toggle(id: string) {
    setResult(null);
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id],
    );
  }

  const run = useMutation({
    mutationFn: () => analysisService.compare(selected, lang),
    onSuccess: (data) => setResult(data),
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  return {
    loading: watch.loading,
    pool,
    selected,
    toggle,
    canCompare: selected.length >= 2,
    max: MAX,
    comparing: run.isPending,
    compare: () => run.mutate(),
    result,
    reset: () => { setSelected([]); setResult(null); },
  };
}
