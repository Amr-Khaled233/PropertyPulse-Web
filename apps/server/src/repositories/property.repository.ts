// Property repository — CRUD over the properties table, plus market/neighborhood reads.

import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/apiError.js';
import { toProperty, toPropertyInsert, type PropertyRow } from '../models/property.model.js';
import type {
  Property,
  Paginated,
  MarketTrendPoint,
  NeighborhoodInsight,
  PropertyType,
} from '@propertypulse/shared-types';

export interface PropertyFilters {
  city?: string;
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

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
    if (error) throw new ApiError(500, 'PROPERTY_FETCH_FAILED', error.message);
    return data ? toProperty(data as PropertyRow) : null;
  },

  async create(input: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(toPropertyInsert(input))
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'PROPERTY_CREATE_FAILED', error.message);
    return toProperty(data as PropertyRow);
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
