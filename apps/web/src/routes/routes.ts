// Route path constants used by the router and links.

import type { TranslationKey } from '../i18n/translations';

export const ROUTES = {
  landing: '/',
  dashboard: '/dashboard',
  search: '/search',
  property: (id = ':id') => `/property/${id}`,
  analysis: (id = ':id') => `/analysis/${id}`,
  reports: '/reports',
  report: (id = ':id') => `/reports/${id}`,
  watchlist: '/watchlist',
  compare: '/compare',
  chat: '/chat',
  market: '/market',
  pricing: '/pricing',
  admin: '/admin',
  login: '/login',
  register: '/register',
} as const;

export interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: string;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, labelKey: 'nav.dashboard', icon: '◧' },
  { to: ROUTES.search, labelKey: 'nav.search', icon: '⌕' },
  { to: ROUTES.chat, labelKey: 'nav.chat', icon: '✦' },
  { to: ROUTES.watchlist, labelKey: 'nav.watchlist', icon: '★' },
  { to: ROUTES.market, labelKey: 'nav.market', icon: '▤' },
  { to: ROUTES.reports, labelKey: 'nav.reports', icon: '❏' },
  { to: ROUTES.pricing, labelKey: 'nav.pricing', icon: '◇' },
  { to: ROUTES.admin, labelKey: 'nav.admin', icon: '⚙', adminOnly: true },
];
