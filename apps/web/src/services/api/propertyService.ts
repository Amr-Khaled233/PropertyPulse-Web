// API calls for property search and details.

import type { Property } from '@propertypulse/shared-types';
import type { PropertySearchParams } from '../../types';
import { apiClient } from './apiClient';

export interface PropertyPage {
  items: Property[];
  page: number;
  pageSize: number;
  total: number;
}

export const propertyService = {
  async search(params: PropertySearchParams = {}): Promise<PropertyPage> {
    const { data, meta } = await apiClient.get<Property[]>('/properties', params as Record<string, unknown>);
    return {
      items: data,
      page: meta?.page ?? 1,
      pageSize: meta?.pageSize ?? data.length,
      total: meta?.total ?? data.length,
    };
  },

  async getById(id: string): Promise<Property> {
    const { data } = await apiClient.get<Property>(`/properties/${id}`);
    return data;
  },

  /** Distinct towns/areas (for the district filter), optionally scoped to a city. */
  async getTowns(city?: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/properties/towns', city ? { city } : undefined);
    return data;
  },
};
