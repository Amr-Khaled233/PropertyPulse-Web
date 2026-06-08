// ViewModel: property search with filters + debounced city query.

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { propertyService } from '../services/api/propertyService';
import { useDebounce } from '../hooks/useDebounce';
import { QUERY_KEYS } from '../utils/constants';
import type { PropertySearchParams } from '../types';

export function usePropertySearchViewModel() {
  const [filters, setFilters] = useState<PropertySearchParams>({ page: 1, pageSize: 12 });
  const debouncedCity = useDebounce(filters.city ?? '', 350);

  const effective: PropertySearchParams = { ...filters, city: debouncedCity || undefined };

  const query = useQuery({
    queryKey: [QUERY_KEYS.properties, effective],
    queryFn: () => propertyService.search(effective),
    placeholderData: keepPreviousData,
  });

  // Available towns/areas for the district filter, scoped to the selected city.
  const townsQuery = useQuery({
    queryKey: [QUERY_KEYS.properties, 'towns', filters.city ?? ''],
    queryFn: () => propertyService.getTowns(filters.city || undefined),
    staleTime: 10 * 60_000,
  });

  function update(patch: Partial<PropertySearchParams>) {
    setFilters((f) => {
      const next = { ...f, ...patch, page: patch.page ?? 1 };
      // Changing the city invalidates a previously chosen town.
      if (patch.city !== undefined) next.district = undefined;
      return next;
    });
  }

  function setPage(page: number) {
    setFilters((f) => ({ ...f, page }));
  }

  function reset() {
    setFilters({ page: 1, pageSize: 12 });
  }

  return {
    filters,
    update,
    reset,
    setPage,
    towns: townsQuery.data ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    properties: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    pageSize: query.data?.pageSize ?? 12,
  };
}
