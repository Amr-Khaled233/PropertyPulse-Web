// Live market analytics computed from the real properties dataset.

import type { MarketTrendPoint } from '@propertypulse/shared-types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { MOCK_MARKET_TRENDS } from '../mock/mockData';

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
    if (IS_MOCK) {
      return mockDelay({
        activeListings: 15248,
        totalValue: 142_000_000_000,
        avgPrice: 9_300_000,
        topDistricts: [
          { name: 'New Cairo City', count: 6747, sharePct: 44 },
          { name: 'Sheikh Zayed', count: 2200, sharePct: 14 },
          { name: '6th of October', count: 1500, sharePct: 10 },
          { name: 'Mostakbal City', count: 1200, sharePct: 8 },
        ],
        byType: [
          { type: 'apartment', count: 9000 },
          { type: 'villa', count: 3000 },
          { type: 'townhouse', count: 2000 },
        ],
        byCity: [
          { city: 'Cairo', count: 11000 },
          { city: 'Giza', count: 4248 },
        ],
        trend: MOCK_MARKET_TRENDS,
        appreciationPct: 24.4,
      });
    }
    const { data } = await apiClient.get<MarketOverview>('/market/overview');
    return data;
  },
};
