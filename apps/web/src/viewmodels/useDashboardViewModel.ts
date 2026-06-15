// ViewModel: dashboard summary + active portfolio, computed from the user's
// real watchlist via the shared financial engine. When the watchlist is empty
// every headline number is zero (no seeded placeholders).

import { useQuery } from '@tanstack/react-query';
import {
  computeInvestmentMetrics,
  estimateMonthlyRent,
  deriveRecommendation,
  DEFAULT_ASSUMPTIONS,
  type Recommendation,
} from '@propertypulse/shared-utils';
import type { InvestmentMetrics } from '@propertypulse/shared-types';
import { watchlistService } from '../services/api/watchlistService';
import { reportService } from '../services/api/reportService';
import { analysisService } from '../services/api/analysisService';
import { QUERY_KEYS } from '../utils/constants';
import type { Property, WatchlistEntry } from '../types';

export interface PortfolioItem {
  entry: WatchlistEntry;
  property?: Property;
  metrics?: InvestmentMetrics;
  recommendation?: Recommendation;
  score: number;
}

/** Compute metrics client-side with the same assumptions the server uses, so the
 *  dashboard agrees with the AI report engine. */
function metricsFor(property: Property): { metrics: InvestmentMetrics; recommendation: Recommendation; score: number } {
  const purchasePrice = property.price;
  const monthlyRent = estimateMonthlyRent(property.areaSqm, property.type);
  const monthlyExpenses = Math.round(monthlyRent * 0.3);
  const metrics = computeInvestmentMetrics({
    purchasePrice,
    downPaymentPct: DEFAULT_ASSUMPTIONS.downPaymentPct,
    loanInterestRate: DEFAULT_ASSUMPTIONS.loanInterestRate,
    loanTermYears: DEFAULT_ASSUMPTIONS.loanTermYears,
    monthlyRent,
    vacancyRatePct: DEFAULT_ASSUMPTIONS.vacancyRatePct,
    monthlyExpenses,
    annualAppreciationPct: DEFAULT_ASSUMPTIONS.annualAppreciationPct,
    closingCosts: Math.round(purchasePrice * 0.03),
  });
  const d = deriveRecommendation(metrics);
  return { metrics, recommendation: d.recommendation, score: d.score };
}

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

  // Enrich each watched property with real, deterministic metrics.
  const items: PortfolioItem[] = entries.map((entry) => {
    if (!entry.property) return { entry, score: 0 };
    const { metrics, recommendation, score } = metricsFor(entry.property);
    return { entry, property: entry.property, metrics, recommendation, score };
  });
  const valued = items.filter((it) => it.metrics);

  const propertiesTracked = entries.length;
  const portfolioValue = items.reduce((sum, it) => sum + (it.property?.price ?? 0), 0);
  const avgYield = valued.length
    ? valued.reduce((s, it) => s + it.metrics!.netRentalYield, 0) / valued.length
    : 0;
  // Average investment score (0–100) mapped onto a 0–10 opportunity score.
  const aiMarketScore = valued.length
    ? valued.reduce((s, it) => s + it.score, 0) / valued.length / 10
    : 0;
  // Real monthly appreciation implied by the engine's annual growth assumption.
  const monthlyChangePct = valued.length ? DEFAULT_ASSUMPTIONS.annualAppreciationPct / 12 : 0;

  return {
    loading: watchlist.isLoading || reports.isLoading,
    items,
    reports: reports.data ?? [],
    alerts: alerts.data ?? [],
    hasPortfolio: propertiesTracked > 0,
    portfolioValue,
    propertiesTracked,
    avgYield,
    aiMarketScore,
    monthlyChangePct,
    compute: analysisService.computeForProperty,
  };
}
