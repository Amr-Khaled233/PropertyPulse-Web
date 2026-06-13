// API calls for investment analysis (metric computation + comparison).

import type { Property, FinancialAssumptions, InvestmentMetrics } from '@propertypulse/shared-types';
import { computeInvestmentMetrics, DEFAULT_ASSUMPTIONS } from '@propertypulse/shared-utils';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { MOCK_PROPERTIES } from '../mock/mockData';

export interface MetricsResult {
  assumptions: FinancialAssumptions;
  metrics: InvestmentMetrics;
}

export interface ComparisonCandidate {
  property: Property;
  metrics: InvestmentMetrics;
  recommendation: 'buy' | 'hold' | 'avoid';
  pricePerSqm: number;
  pricePositionPct: number;
}

export interface ComparisonResult {
  candidates: ComparisonCandidate[];
  ranking: { propertyId: string; rank: number; rationale: string }[];
  verdict: string;
}

export interface NegotiationResult {
  askingPrice: number;
  currency: string;
  fairValue: number;
  pricePerSqm: number;
  marketAvgPerSqm: number;
  deltaPct: number;
  suggestedOffer: number;
  compCount: number;
  tips: string[];
  summary: string;
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

  async compare(propertyIds: string[], lang = 'en'): Promise<ComparisonResult> {
    if (IS_MOCK) {
      const cands = propertyIds.map((id) => {
        const property = MOCK_PROPERTIES.find((p) => p.id === id) ?? MOCK_PROPERTIES[0];
        const assumptions = buildAssumptions(property.price);
        return {
          property,
          metrics: computeInvestmentMetrics(assumptions),
          recommendation: 'hold' as const,
          pricePerSqm: Math.round(property.price / (property.areaSqm || 1)),
          pricePositionPct: 0,
        };
      });
      return mockDelay({
        candidates: cands,
        ranking: propertyIds.map((id, i) => ({
          propertyId: id,
          rank: i + 1,
          rationale: i === 0 ? 'Best risk-adjusted yield and liquidity.' : 'Solid fundamentals, slightly lower projected ROI.',
        })),
        verdict: 'The top-ranked property offers the strongest balance of yield, appreciation and liquidity.',
      });
    }
    const { data } = await apiClient.post<ComparisonResult>('/analysis/compare', { propertyIds, lang });
    return data;
  },

  /** AI-grounded negotiation guidance for a single property. */
  async negotiation(propertyId: string, lang = 'en'): Promise<NegotiationResult> {
    if (IS_MOCK) {
      const property = MOCK_PROPERTIES.find((p) => p.id === propertyId) ?? MOCK_PROPERTIES[0];
      const fair = Math.round(property.price * 0.95);
      return mockDelay({
        askingPrice: property.price, currency: property.currency, fairValue: fair,
        pricePerSqm: Math.round(property.price / (property.areaSqm || 1)),
        marketAvgPerSqm: Math.round(fair / (property.areaSqm || 1)),
        deltaPct: 5.3, suggestedOffer: Math.round(fair * 0.96), compCount: 8,
        tips: ['Priced slightly above market — negotiate toward fair value.', 'Offer cash for an extra discount.'],
        summary: 'A reasonable opening offer is ~8% below asking, citing comparable listings.',
      });
    }
    const { data } = await apiClient.post<NegotiationResult>('/analysis/negotiation', { propertyId, lang });
    return data;
  },
};
