// API calls for investment analysis (metric computation + comparison).

import type { Property, FinancialAssumptions, InvestmentMetrics } from '@propertypulse/shared-types';
import { computeInvestmentMetrics, DEFAULT_ASSUMPTIONS } from '@propertypulse/shared-utils';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { MOCK_PROPERTIES } from '../mock/mockData';

export interface MetricsResult {
  assumptions: FinancialAssumptions;
  metrics: InvestmentMetrics;
}

export interface ComparisonResult {
  ranking: { propertyId: string; rank: number; rationale: string }[];
  verdict: string;
}

function buildAssumptions(price: number, overrides: Partial<FinancialAssumptions> = {}): FinancialAssumptions {
  const purchasePrice = overrides.purchasePrice ?? price;
  const monthlyRent = overrides.monthlyRent ?? Math.round(purchasePrice * 0.005);
  return {
    purchasePrice,
    downPaymentPct: overrides.downPaymentPct ?? DEFAULT_ASSUMPTIONS.downPaymentPct,
    loanInterestRate: overrides.loanInterestRate ?? DEFAULT_ASSUMPTIONS.loanInterestRate,
    loanTermYears: overrides.loanTermYears ?? DEFAULT_ASSUMPTIONS.loanTermYears,
    monthlyRent,
    vacancyRatePct: overrides.vacancyRatePct ?? DEFAULT_ASSUMPTIONS.vacancyRatePct,
    monthlyExpenses: overrides.monthlyExpenses ?? Math.round(monthlyRent * 0.3),
    annualAppreciationPct: overrides.annualAppreciationPct ?? DEFAULT_ASSUMPTIONS.annualAppreciationPct,
    closingCosts: overrides.closingCosts ?? Math.round(purchasePrice * 0.03),
  };
}

export const analysisService = {
  /** Compute metrics for a stored property. In mock mode this runs the real
   *  shared-utils financial engine locally — numbers stay trustworthy. */
  async computeForProperty(
    propertyId: string,
    overrides: Partial<FinancialAssumptions> = {},
  ): Promise<MetricsResult> {
    if (IS_MOCK) {
      const property = MOCK_PROPERTIES.find((p) => p.id === propertyId) ?? MOCK_PROPERTIES[0];
      const assumptions = buildAssumptions(property.price, overrides);
      return mockDelay({ assumptions, metrics: computeInvestmentMetrics(assumptions) });
    }
    const { data } = await apiClient.post<MetricsResult>('/analysis/metrics', {
      propertyId,
      assumptions: overrides,
    });
    return data;
  },

  async computeForPayload(
    property: Property,
    overrides: Partial<FinancialAssumptions> = {},
  ): Promise<MetricsResult> {
    if (IS_MOCK) {
      const assumptions = buildAssumptions(property.price, overrides);
      return mockDelay({ assumptions, metrics: computeInvestmentMetrics(assumptions) });
    }
    const { data } = await apiClient.post<MetricsResult>('/analysis/metrics', {
      property,
      assumptions: overrides,
    });
    return data;
  },

  async compare(propertyIds: string[]): Promise<ComparisonResult> {
    if (IS_MOCK) {
      return mockDelay({
        ranking: propertyIds.map((id, i) => ({
          propertyId: id,
          rank: i + 1,
          rationale: i === 0 ? 'Best risk-adjusted yield and liquidity.' : 'Solid fundamentals, slightly lower projected ROI.',
        })),
        verdict: 'The top-ranked property offers the strongest balance of yield, appreciation and liquidity.',
      });
    }
    const { data } = await apiClient.post<ComparisonResult>('/analysis/compare', { propertyIds });
    return data;
  },
};
