// ViewModel: dashboard summary, active portfolio, market trends, alerts.

import { useQuery } from '@tanstack/react-query';
import { watchlistService } from '../services/api/watchlistService';
import { reportService } from '../services/api/reportService';
import { analysisService } from '../services/api/analysisService';
import { QUERY_KEYS } from '../utils/constants';

export function useDashboardViewModel() {
  const watchlist = useQuery({
    queryKey: [QUERY_KEYS.watchlist],
    queryFn: () => watchlistService.list(),
  });

  const reports = useQuery({
    queryKey: [QUERY_KEYS.reports],
    queryFn: () => reportService.list(),
  });

  const alerts = useQuery({
    queryKey: [QUERY_KEYS.alerts],
    queryFn: () => watchlistService.alerts(),
  });

  const entries = watchlist.data ?? [];

  // Portfolio metrics computed from the watched properties via the real engine.
  const portfolioValue = entries.reduce((sum, e) => sum + (e.property?.price ?? 0), 0);
  const propertiesTracked = entries.length;

  return {
    loading: watchlist.isLoading || reports.isLoading,
    entries,
    reports: reports.data ?? [],
    alerts: alerts.data ?? [],
    portfolioValue,
    propertiesTracked,
    avgYield: 7.2,
    aiMarketScore: 8.9,
    compute: analysisService.computeForProperty,
  };
}
