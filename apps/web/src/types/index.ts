// Web type surface — re-exports shared domain types plus web-only view types.

export * from '@propertypulse/shared-types';

import type { Property, InvestmentReport, WatchlistItem } from '@propertypulse/shared-types';

/** Filters bound to the property search UI. */
export interface PropertySearchParams {
  city?: string;
  district?: string;
  type?: Property['type'];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  pageSize?: number;
}

/** Generic async UI state used by viewmodels. */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** A watchlist row joined with its property for display. */
export interface WatchlistEntry extends WatchlistItem {
  property?: Property;
}

export type { Property, InvestmentReport, WatchlistItem };
