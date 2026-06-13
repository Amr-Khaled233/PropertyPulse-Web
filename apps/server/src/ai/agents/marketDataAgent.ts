// Market data agent — collects rental, neighborhood and economic context for a property.
// Combines RAG retrieval (qualitative), market trends, and REAL comparable
// listings from the dataset so the report is grounded in actual data.

import type { Property, MarketTrendPoint, NeighborhoodInsight } from '@propertypulse/shared-types';
import { retrieve, type RetrievalResult } from '../rag/retriever.js';
import { marketRepository, propertyRepository } from '../../repositories/property.repository.js';
import { formatCurrency } from '@propertypulse/shared-utils';

export interface MarketContext {
  trends: MarketTrendPoint[];
  neighborhood?: NeighborhoodInsight;
  retrieval: RetrievalResult;
  /** Grounding text built from real comparable listings in the dataset. */
  dataContext: string;
  /** Subject price/m² vs comparable average (+ = pricier than comps). */
  pricePositionPct: number;
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Summarise real comparable listings (same area/type) into prompt context.
 *  Uses the MEDIAN price/m² (robust to luxury outliers) as the benchmark. */
function buildComparables(subject: Property, comps: Property[]): { text: string; pricePositionPct: number } {
  if (!comps.length) return { text: '', pricePositionPct: 0 };
  const ppsm = (p: Property) => (p.areaSqm ? p.price / p.areaSqm : 0);
  const values = comps.map(ppsm).filter((v) => v > 0);
  const avg = median(values);
  const subjectPpsm = ppsm(subject);
  const delta = avg ? ((subjectPpsm - avg) / avg) * 100 : 0;

  const lines = comps
    .slice(0, 6)
    .map(
      (c) =>
        `- ${c.title} | ${formatCurrency(c.price, c.currency)} | ${c.areaSqm} m² | ${formatCurrency(Math.round(ppsm(c)), c.currency)}/m² | ${[c.address.state, c.address.city].filter(Boolean).join(', ')}`,
    )
    .join('\n');

  const text = [
    `COMPARABLE LISTINGS (real platform data — same city & type)`,
    `Subject price/m²: ${formatCurrency(Math.round(subjectPpsm), subject.currency)}. Area median price/m²: ${formatCurrency(Math.round(avg), subject.currency)} across ${comps.length} comps.`,
    `The subject is ${delta >= 0 ? 'ABOVE' : 'BELOW'} the comparable average by ${Math.abs(delta).toFixed(1)}%.`,
    lines,
  ].join('\n');

  return { text, pricePositionPct: delta };
}

export async function collectMarketData(property: Property): Promise<MarketContext> {
  const query = `Rental market, neighborhood quality and economic outlook for a ${property.type} in ${property.address.city}, ${property.address.country}.`;

  const [retrieval, trends, neighborhood, comps] = await Promise.all([
    retrieve(query, 6),
    marketRepository.getTrends(property.address.city, property.type),
    marketRepository.getNeighborhood(property.address.city),
    propertyRepository.findComparables(
      { city: property.address.city, district: property.address.state, type: property.type, excludeId: property.id },
      12,
    ),
  ]);

  const { text, pricePositionPct } = buildComparables(property, comps);
  return { trends, neighborhood, retrieval, dataContext: text, pricePositionPct };
}
