// Seeded demo data so the entire web app runs without a backend or API keys.
// Toggle with VITE_USE_MOCK (default true). Numbers are illustrative, Egypt-focused
// to match the design (EGP, Cairo neighborhoods).

import type {
  Property,
  InvestmentReport,
  InvestmentMetrics,
  RiskAssessment,
  MarketTrendPoint,
  NeighborhoodInsight,
  UserProfile,
  WatchlistItem,
} from '@propertypulse/shared-types';

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=70`;

export const MOCK_USER: UserProfile = {
  id: 'user-1',
  email: 'investor@propertypulse.app',
  fullName: 'Amr Khaled',
  role: 'investor',
  avatarUrl: undefined,
  createdAt: '2025-01-12T09:00:00.000Z',
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'The Zenith Penthouse',
    type: 'apartment',
    status: 'for_sale',
    price: 8_400_000,
    currency: 'EGP',
    areaSqm: 325,
    bedrooms: 4,
    bathrooms: 5,
    yearBuilt: 2022,
    address: { line1: 'Downtown', city: 'New Cairo', country: 'Egypt' },
    location: { lat: 30.0084, lng: 31.4913 },
    images: [img('photo-1512917774080-9991f1c4c750'), img('photo-1600596542815-ffad4c1539a9')],
    description:
      'A landmark penthouse combining skyline views, premium finishes and a strong rental track record in one of New Cairo’s most in-demand corridors.',
    source: 'mock',
    createdAt: '2025-03-01T10:00:00.000Z',
    updatedAt: '2025-05-20T10:00:00.000Z',
  },
  {
    id: 'prop-2',
    title: 'Heliopolis Luxury Apartment',
    type: 'apartment',
    status: 'for_sale',
    price: 4_300_000,
    currency: 'EGP',
    areaSqm: 180,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2019,
    address: { line1: 'Korba', city: 'Cairo', country: 'Egypt' },
    images: [img('photo-1502672260266-1c1ef2d93688'), img('photo-1493809842364-78817add7ffb')],
    description: 'Elegant apartment in historic Heliopolis with steady appreciation and high footfall.',
    source: 'mock',
    createdAt: '2025-02-11T10:00:00.000Z',
    updatedAt: '2025-05-10T10:00:00.000Z',
  },
  {
    id: 'prop-3',
    title: 'Sheikh Zayed Villa',
    type: 'villa',
    status: 'for_sale',
    price: 12_200_000,
    currency: 'EGP',
    areaSqm: 480,
    bedrooms: 5,
    bathrooms: 4,
    yearBuilt: 2021,
    address: { line1: 'Beverly Hills', city: 'Giza', country: 'Egypt' },
    images: [img('photo-1613490493576-7fde63acd811'), img('photo-1564013799919-ab600027ffc6')],
    description: 'Spacious family villa in a premium compound with private garden and pool.',
    source: 'mock',
    createdAt: '2025-01-22T10:00:00.000Z',
    updatedAt: '2025-04-30T10:00:00.000Z',
  },
  {
    id: 'prop-4',
    title: 'New Cairo Office',
    type: 'commercial',
    status: 'for_sale',
    price: 3_900_000,
    currency: 'EGP',
    areaSqm: 140,
    bedrooms: 0,
    bathrooms: 2,
    yearBuilt: 2023,
    address: { line1: '90th Street', city: 'New Cairo', country: 'Egypt' },
    images: [img('photo-1497366216548-37526070297c'), img('photo-1497366811353-6870744d04b2')],
    description: 'Grade-A commercial unit on the 90th Street corridor with surging tenant demand.',
    source: 'mock',
    createdAt: '2025-03-18T10:00:00.000Z',
    updatedAt: '2025-05-25T10:00:00.000Z',
  },
  {
    id: 'prop-5',
    title: 'Skyline Heights Tower',
    type: 'apartment',
    status: 'for_sale',
    price: 6_750_000,
    currency: 'EGP',
    areaSqm: 210,
    bedrooms: 3,
    bathrooms: 3,
    yearBuilt: 2024,
    address: { line1: 'Fifth Settlement', city: 'New Cairo', country: 'Egypt' },
    images: [img('photo-1545324418-cc1a3fa10c00'), img('photo-1486406146926-c627a92ad1ab')],
    description: 'Brand-new tower unit with high growth probability and institutional-grade amenities.',
    source: 'mock',
    createdAt: '2025-04-02T10:00:00.000Z',
    updatedAt: '2025-05-28T10:00:00.000Z',
  },
  {
    id: 'prop-6',
    title: 'Maadi Garden Townhouse',
    type: 'townhouse',
    status: 'for_sale',
    price: 9_100_000,
    currency: 'EGP',
    areaSqm: 300,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2018,
    address: { line1: 'Maadi Sarayat', city: 'Cairo', country: 'Egypt' },
    images: [img('photo-1568605114967-8130f3a36994'), img('photo-1576941089067-2de3c901e126')],
    description: 'Leafy, family-friendly townhouse in established Maadi with resilient demand.',
    source: 'mock',
    createdAt: '2025-02-28T10:00:00.000Z',
    updatedAt: '2025-05-15T10:00:00.000Z',
  },
];

export function mockMetrics(seed: number): InvestmentMetrics {
  return {
    grossRentalYield: 7.4 + (seed % 3) * 0.4,
    netRentalYield: 5.9 + (seed % 3) * 0.3,
    capRate: 6.2 + (seed % 2) * 0.5,
    cashOnCashReturn: 11.4 + (seed % 4) * 0.6,
    monthlyCashFlow: 18_500 + seed * 1200,
    annualCashFlow: 222_000 + seed * 14_400,
    breakEvenYears: 8.5 - (seed % 3) * 0.5,
    fiveYearRoi: 62 + (seed % 5) * 3.2,
  };
}

export function mockRisk(seed: number): RiskAssessment {
  const overall = seed % 3 === 0 ? 'low' : seed % 3 === 1 ? 'moderate' : 'high';
  return {
    overall,
    score: 28 + (seed % 5) * 9,
    factors: [
      { name: 'Market Demand', level: 'low', weight: 0.3, explanation: 'Strong rental demand and low vacancy in the corridor.' },
      { name: 'Liquidity', level: 'moderate', weight: 0.25, explanation: 'Resale times are average for the segment.' },
      { name: 'Regulatory', level: overall, weight: 0.2, explanation: 'Zoning and tenancy rules are stable but evolving.' },
      { name: 'Construction Risk', level: 'low', weight: 0.25, explanation: 'Completed asset, no delivery risk.' },
    ],
  };
}

export const MOCK_MARKET_TRENDS: MarketTrendPoint[] = Array.from({ length: 12 }).map((_, i) => {
  const base = 100 + i * 4 + Math.round(Math.sin(i / 2) * 6);
  return {
    period: `2024-${String(i + 1).padStart(2, '0')}`,
    medianPrice: 38_000 + base * 220,
    medianRent: 210 + base * 1.6,
  };
});

export const MOCK_NEIGHBORHOOD: NeighborhoodInsight = {
  name: 'New Cairo',
  walkScore: 65,
  safetyScore: 85,
  schoolsScore: 90,
  amenities: ['schools', 'compounds', 'parks', 'malls', 'metro link'],
  summary: 'Family-oriented, premium compounds, steady appreciation and strong institutional interest.',
};

export function mockReportFor(property: Property, seed = 3): InvestmentReport {
  return {
    id: `report-${property.id}`,
    propertyId: property.id,
    userId: MOCK_USER.id,
    summary:
      `${property.title} shows a compelling risk-adjusted return profile. Rental demand in ` +
      `${property.address.city} remains strong, and projected appreciation supports a multi-year hold.`,
    recommendation: seed % 3 === 0 ? 'buy' : seed % 3 === 1 ? 'hold' : 'avoid',
    confidence: 0.72 + (seed % 4) * 0.05,
    metrics: mockMetrics(seed),
    risk: mockRisk(seed),
    marketTrends: MOCK_MARKET_TRENDS,
    neighborhood: MOCK_NEIGHBORHOOD,
    sources: ['Egyptian Market Index 2025', 'Rental Demand Survey Q1', 'Compound Pricing Dataset'],
    generatedAt: '2025-05-30T12:00:00.000Z',
  };
}

export const MOCK_REPORTS: InvestmentReport[] = MOCK_PROPERTIES.slice(0, 3).map((p, i) =>
  mockReportFor(p, i + 2),
);

export const MOCK_WATCHLIST: WatchlistItem[] = [
  { id: 'w1', userId: MOCK_USER.id, propertyId: 'prop-2', notifyOnChange: true, createdAt: '2025-05-01T10:00:00.000Z' },
  { id: 'w2', userId: MOCK_USER.id, propertyId: 'prop-3', notes: 'Negotiating price', notifyOnChange: true, createdAt: '2025-05-05T10:00:00.000Z' },
  { id: 'w3', userId: MOCK_USER.id, propertyId: 'prop-4', notifyOnChange: false, createdAt: '2025-05-09T10:00:00.000Z' },
];
