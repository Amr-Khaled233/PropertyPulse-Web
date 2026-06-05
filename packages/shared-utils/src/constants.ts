// Shared constants and sensible defaults used across apps.

export const DEFAULT_ASSUMPTIONS = {
  downPaymentPct: 20,
  loanInterestRate: 6.5,
  loanTermYears: 30,
  vacancyRatePct: 5,
  annualAppreciationPct: 3,
} as const;

export const RECOMMENDATION_LABELS = {
  buy: 'Strong Buy',
  hold: 'Hold / Watch',
  avoid: 'Avoid',
} as const;

export const RISK_COLORS = {
  low: '#16a34a',
  moderate: '#d97706',
  high: '#dc2626',
} as const;
