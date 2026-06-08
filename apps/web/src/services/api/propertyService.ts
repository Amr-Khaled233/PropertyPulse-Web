// API calls for property search and details.

import type { Property } from '@propertypulse/shared-types';
import type { PropertySearchParams } from '../../types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { MOCK_PROPERTIES } from '../mock/mockData';

export interface PropertyPage {
  items: Property[];
  page: number;
  pageSize: number;
  total: number;
}

function filterMock(params: PropertySearchParams): PropertyPage {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  let items = [...MOCK_PROPERTIES];
  if (params.city) items = items.filter((p) => p.address.city.toLowerCase().includes(params.city!.toLowerCase()));
  if (params.district) items = items.filter((p) => p.address.state === params.district);
  if (params.type) items = items.filter((p) => p.type === params.type);
  if (params.minPrice != null) items = items.filter((p) => p.price >= params.minPrice!);
  if (params.maxPrice != null) items = items.filter((p) => p.price <= params.maxPrice!);
  if (params.bedrooms != null) items = items.filter((p) => p.bedrooms >= params.bedrooms!);
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, total };
}

export const propertyService = {
  async search(params: PropertySearchParams = {}): Promise<PropertyPage> {
    if (IS_MOCK) return mockDelay(filterMock(params));
    const { data, meta } = await apiClient.get<Property[]>('/properties', params as Record<string, unknown>);
    return {
      items: data,
      page: meta?.page ?? 1,
      pageSize: meta?.pageSize ?? data.length,
      total: meta?.total ?? data.length,
    };
  },

  async getById(id: string): Promise<Property> {
    if (IS_MOCK) {
      const found = MOCK_PROPERTIES.find((p) => p.id === id) ?? MOCK_PROPERTIES[0];
      return mockDelay(found);
    }
    const { data } = await apiClient.get<Property>(`/properties/${id}`);
    return data;
  },

  /** Distinct towns/areas (for the district filter), optionally scoped to a city. */
  async getTowns(city?: string): Promise<string[]> {
    if (IS_MOCK) {
      const towns = [...new Set(MOCK_PROPERTIES.map((p) => p.address.state).filter(Boolean))] as string[];
      return mockDelay(towns.sort());
    }
    const { data } = await apiClient.get<string[]>('/properties/towns', city ? { city } : undefined);
    return data;
  },
};
