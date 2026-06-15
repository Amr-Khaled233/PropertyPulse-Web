// API calls for investment analysis (metric computation + comparison).

import type { Property, FinancialAssumptions, InvestmentMetrics } from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

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
  score: number;
  reasoning: string[];
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

export const analysisService = {
  /** Compute metrics for a stored property (server runs the shared financial engine). */
  async computeForProperty(
    propertyId: string,
    overrides: Partial<FinancialAssumptions> = {},
  ): Promise<MetricsResult> {
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
    const { data } = await apiClient.post<MetricsResult>('/analysis/metrics', {
      property,
      assumptions: overrides,
    });
    return data;
  },

  async compare(propertyIds: string[], lang = 'en'): Promise<ComparisonResult> {
    const { data } = await apiClient.post<ComparisonResult>('/analysis/compare', { propertyIds, lang });
    return data;
  },

  /** AI-grounded negotiation guidance for a single property. */
  async negotiation(propertyId: string, lang = 'en'): Promise<NegotiationResult> {
    const { data } = await apiClient.post<NegotiationResult>('/analysis/negotiation', { propertyId, lang });
    return data;
  },
};
