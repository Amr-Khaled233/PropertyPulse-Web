// Market data agent — collects rental, neighborhood and economic context for a property.
// Combines RAG retrieval (qualitative) with the market repository (quantitative trends).

import type { Property, MarketTrendPoint, NeighborhoodInsight } from '@propertypulse/shared-types';
import { retrieve, type RetrievalResult } from '../rag/retriever.js';
import { marketRepository } from '../../repositories/property.repository.js';

export interface MarketContext {
  trends: MarketTrendPoint[];
  neighborhood?: NeighborhoodInsight;
  retrieval: RetrievalResult;
}

export async function collectMarketData(property: Property): Promise<MarketContext> {
  const query = `Rental market, neighborhood quality and economic outlook for a ${property.type} in ${property.address.city}, ${property.address.country}.`;

  const [retrieval, trends, neighborhood] = await Promise.all([
    retrieve(query, 6),
    marketRepository.getTrends(property.address.city, property.type),
    marketRepository.getNeighborhood(property.address.city),
  ]);

  return { trends, neighborhood, retrieval };
}
