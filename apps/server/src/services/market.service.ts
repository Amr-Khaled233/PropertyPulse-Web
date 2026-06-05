// Market service — exposes rental/neighborhood market data to controllers and agents.

import { marketRepository } from '../repositories/property.repository.js';
import type { MarketTrendPoint, NeighborhoodInsight, PropertyType } from '@propertypulse/shared-types';

export const marketService = {
  getTrends(city: string, type?: PropertyType): Promise<MarketTrendPoint[]> {
    return marketRepository.getTrends(city, type);
  },

  getNeighborhood(city: string): Promise<NeighborhoodInsight | undefined> {
    return marketRepository.getNeighborhood(city);
  },
};
