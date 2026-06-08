// Web UI constants.

import type { PropertyType } from '@propertypulse/shared-types';

export const APP_NAME = 'PropertyPulse';
export const APP_TAGLINE = 'AI-Powered Real Estate Investment Advisor';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

export const RECOMMENDATION_LABELS = {
  buy: 'Strong Buy',
  hold: 'Hold / Watch',
  avoid: 'Avoid',
} as const;

export const RECOMMENDATION_COLORS = {
  buy: '#16a34a',
  hold: '#d97706',
  avoid: '#dc2626',
} as const;

export const RISK_COLORS = {
  low: '#16a34a',
  moderate: '#d97706',
  high: '#dc2626',
} as const;

export const DEFAULT_PAGE_SIZE = 12;

export const QUERY_KEYS = {
  properties: 'properties',
  property: 'property',
  reports: 'reports',
  report: 'report',
  watchlist: 'watchlist',
  alerts: 'alerts',
  metrics: 'metrics',
} as const;
