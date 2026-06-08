// Property repository — CRUD over the properties table, plus market/neighborhood reads.

import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/apiError.js';
import { toProperty, toPropertyInsert, toPropertyUpdate, type PropertyRow } from '../models/property.model.js';
import type {
  Property,
  Paginated,
  MarketTrendPoint,
  NeighborhoodInsight,
  PropertyType,
} from '@propertypulse/shared-types';

const townCache = new Map<string, { towns: string[]; expires: number }>();

export interface PropertyFilters {
  city?: string;
  district?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  pageSize?: number;
}

export const propertyRepository = {
  async search(filters: PropertyFilters): Promise<Paginated<Property>> {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);

    let query = supabase.from('properties').select('*', { count: 'exact' });
    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    // `state` holds the town/area (see import script). Exact match from the dropdown.
    if (filters.district) query = query.eq('state', filters.district);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.minPrice != null) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice);
    if (filters.bedrooms != null) query = query.gte('bedrooms', filters.bedrooms);

    query = query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw new ApiError(500, 'PROPERTY_SEARCH_FAILED', error.message);

    return {
      items: (data as PropertyRow[]).map(toProperty),
      page,
      pageSize,
      total: count ?? 0,
    };
  },

  // Distinct list of towns/areas (stored in `state`), optionally scoped to a
  // city. Cached in-memory since the dataset is static between imports.
  async listTowns(city?: string): Promise<string[]> {
    const cacheKey = city?.toLowerCase() ?? '*';
    const cached = townCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.towns;

    const towns = new Set<string>();
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      let q = supabase
        .from('properties')
        .select('state')
        .not('state', 'is', null)
        .range(from, from + pageSize - 1);
      if (city) q = q.ilike('city', `%${city}%`);
      const { data, error } = await q;
      if (error) throw new ApiError(500, 'TOWNS_FETCH_FAILED', error.message);
      if (!data || data.length === 0) break;
      for (const r of data) {
        const s = (r as { state: string | null }).state;
        if (s && s.trim()) towns.add(s.trim());
      }
      if (data.length < pageSize) break;
    }
    const sorted = [...towns].sort((a, b) => a.localeCompare(b));
    townCache.set(cacheKey, { towns: sorted, expires: Date.now() + 10 * 60_000 });
    return sorted;
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
    if (error) throw new ApiError(500, 'PROPERTY_FETCH_FAILED', error.message);
    return data ? toProperty(data as PropertyRow) : null;
  },

  /** Comparable listings from the real dataset (same city + type), used to
   *  ground the AI report in actual market data rather than guesswork. */
  async findComparables(
    opts: { city?: string; type?: string; district?: string; excludeId?: string },
    limit = 8,
  ): Promise<Property[]> {
    let q = supabase.from('properties').select('*').limit(limit);
    if (opts.city) q = q.ilike('city', `%${opts.city}%`);
    if (opts.type) q = q.eq('type', opts.type);
    if (opts.district) q = q.eq('state', opts.district);
    if (opts.excludeId) q = q.neq('id', opts.excludeId);
    const { data, error } = await q;
    if (error) throw new ApiError(500, 'COMPARABLES_FETCH_FAILED', error.message);
    return (data as PropertyRow[]).map(toProperty);
  },

  async create(input: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(toPropertyInsert(input))
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'PROPERTY_CREATE_FAILED', error.message);
    townCache.clear();
    return toProperty(data as PropertyRow);
  },

  async update(id: string, patch: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(toPropertyUpdate(patch))
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'PROPERTY_UPDATE_FAILED', error.message);
    townCache.clear();
    return toProperty(data as PropertyRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw new ApiError(500, 'PROPERTY_DELETE_FAILED', error.message);
    townCache.clear();
  },
};

// --- Market / neighborhood reads used by the market data agent -------------
export const marketRepository = {
  async getTrends(city: string, type?: PropertyType): Promise<MarketTrendPoint[]> {
    let query = supabase
      .from('rental_market_stats')
      .select('period, median_price, median_rent')
      .ilike('city', `%${city}%`)
      .order('period', { ascending: true })
      .limit(24);
    if (type) query = query.eq('property_type', type);

    const { data, error } = await query;
    if (error) throw new ApiError(500, 'MARKET_TRENDS_FAILED', error.message);

    return (data ?? []).map((row) => ({
      period: (row as { period: string }).period,
      medianPrice: Number((row as { median_price: number }).median_price ?? 0),
      medianRent: Number((row as { median_rent: number }).median_rent ?? 0),
    }));
  },

  async getNeighborhood(city: string): Promise<NeighborhoodInsight | undefined> {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('name, walk_score, safety_score, schools_score, amenities, summary')
      .ilike('city', `%${city}%`)
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, 'NEIGHBORHOOD_FETCH_FAILED', error.message);
    if (!data) return undefined;

    const row = data as {
      name: string;
      walk_score: number | null;
      safety_score: number | null;
      schools_score: number | null;
      amenities: string[] | null;
      summary: string | null;
    };
    return {
      name: row.name,
      walkScore: row.walk_score ?? undefined,
      safetyScore: row.safety_score ?? undefined,
      schoolsScore: row.schools_score ?? undefined,
      amenities: row.amenities ?? [],
      summary: row.summary ?? '',
    };
  },
};
