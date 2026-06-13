// Live market analytics computed from the real properties dataset.

import type { MarketTrendPoint } from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

export interface MarketOverview {
  activeListings: number;
  totalValue: number;
  avgPrice: number;
  topDistricts: { name: string; count: number; sharePct: number }[];
  byType: { type: string; count: number }[];
  byCity: { city: string; count: number }[];
  trend: MarketTrendPoint[];
  appreciationPct: number;
}

export const marketService = {
  async overview(): Promise<MarketOverview> {
    const { data } = await apiClient.get<MarketOverview>('/market/overview');
    return data;
  },
};
