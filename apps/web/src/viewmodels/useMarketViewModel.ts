// ViewModel: live market analytics overview.

import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services/api/marketService';

export function useMarketViewModel() {
  const query = useQuery({
    queryKey: ['market', 'overview'],
    queryFn: () => marketService.overview(),
    staleTime: 5 * 60_000,
  });

  return { loading: query.isLoading, data: query.data };
}
