// Display formatting helpers. Thin wrappers over @propertypulse/shared-utils
// plus a few web-only helpers.

export {
  formatCurrency,
  formatPercent,
  formatArea,
  formatDate,
} from '@propertypulse/shared-utils';

/** Compact currency, e.g. $1.2M / $850K. */
export function formatCompactCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** "3 bed · 2 bath · 120 m²" style summary line. */
export function formatPropertySpecs(bedrooms: number, bathrooms: number, areaSqm: number): string {
  return `${bedrooms} bed · ${bathrooms} bath · ${areaSqm.toLocaleString()} m²`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
}

/** Years value that may be Infinity / null (never breaks even).
 *  Note: JSON serializes Infinity to null, so the API can send null here. */
export function formatYears(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(1)} yrs`;
}
