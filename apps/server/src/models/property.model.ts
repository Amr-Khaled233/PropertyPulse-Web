// Property entity mapping: database row (snake_case) <-> domain Property type.

import type { Property, PropertyType, ListingStatus } from '@propertypulse/shared-types';

export interface PropertyRow {
  id: string;
  title: string;
  type: PropertyType;
  status: ListingStatus;
  price: number | string;
  currency: string;
  area_sqm: number | string;
  bedrooms: number;
  bathrooms: number;
  year_built: number | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  images: string[] | null;
  description: string | null;
  source: string | null;
  neighborhood_id: string | null;
  created_at: string;
  updated_at: string;
}

export function toProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    price: Number(row.price),
    currency: row.currency,
    areaSqm: Number(row.area_sqm),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    yearBuilt: row.year_built ?? undefined,
    address: {
      line1: row.address_line1 ?? '',
      city: row.city ?? '',
      state: row.state ?? undefined,
      country: row.country ?? '',
      postalCode: row.postal_code ?? undefined,
    },
    location: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    images: row.images ?? [],
    description: row.description ?? undefined,
    source: row.source ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPropertyInsert(p: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Record<string, unknown> {
  return {
    title: p.title,
    type: p.type,
    status: p.status,
    price: p.price,
    currency: p.currency,
    area_sqm: p.areaSqm,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    year_built: p.yearBuilt ?? null,
    address_line1: p.address.line1,
    city: p.address.city,
    state: p.address.state ?? null,
    country: p.address.country,
    postal_code: p.address.postalCode ?? null,
    lat: p.location?.lat ?? null,
    lng: p.location?.lng ?? null,
    images: p.images,
    description: p.description ?? null,
    source: p.source ?? null,
  };
}
