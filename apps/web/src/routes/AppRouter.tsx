// Application routes. View layer entry — maps URLs to pages.

import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from './routes';
import { useAuthStore } from '../store/authStore';
import { AppShell } from '../views/components/layout/AppShell';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n/translations';

import { LandingPage } from '../views/pages/LandingPage';
import { LoginPage } from '../views/pages/LoginPage';
import { RegisterPage } from '../views/pages/RegisterPage';
import { DashboardPage } from '../views/pages/DashboardPage';
import { PropertySearchPage } from '../views/pages/PropertySearchPage';
import { PropertyDetailPage } from '../views/pages/PropertyDetailPage';
import { AnalysisPage } from '../views/pages/AnalysisPage';
import { ReportPage } from '../views/pages/ReportPage';
import { WatchlistPage } from '../views/pages/WatchlistPage';
import { ChatPage } from '../views/pages/ChatPage';
import { MarketTrendsPage } from '../views/pages/MarketTrendsPage';
import { PricingPage } from '../views/pages/PricingPage';
import { AdminPage } from '../views/pages/AdminPage';

/** Require an authenticated session; otherwise redirect to login.
 *  Admins are confined to the admin panel — they don't use the investor app. */
function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  if (user.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to={ROUTES.admin} replace />;
  }
  return <Outlet />;
}

/** Require admin role. */
function RequireAdmin() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  if (!isAdmin) return <Navigate to={ROUTES.dashboard} replace />;
  return <Outlet />;
}

/** App shell wrapper that derives the topbar title from the current route. */
function ShellLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const titleKey: TranslationKey =
    pathname.startsWith('/search') ? 'nav.search'
    : pathname.startsWith('/property') ? 'detail.analysis'
    : pathname.startsWith('/analysis') ? 'detail.analysis'
    : pathname.startsWith('/reports') ? 'reports.title'
    : pathname.startsWith('/watchlist') ? 'watch.title'
    : pathname.startsWith('/chat') ? 'chat.title'
    : pathname.startsWith('/market') ? 'market.title'
    : pathname.startsWith('/pricing') ? 'nav.pricing'
    : pathname.startsWith('/admin') ? 'admin.title'
    : 'dash.title';
  return <AppShell title={t(titleKey)} />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.landing} element={<LandingPage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />

      {/* Authenticated app (dark sidebar shell) */}
      <Route element={<RequireAuth />}>
        <Route element={<ShellLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.search} element={<PropertySearchPage />} />
          <Route path={ROUTES.property()} element={<PropertyDetailPage />} />
          <Route path={ROUTES.analysis()} element={<AnalysisPage />} />
          <Route path={ROUTES.reports} element={<ReportPage />} />
          <Route path={ROUTES.report()} element={<ReportPage />} />
          <Route path={ROUTES.watchlist} element={<WatchlistPage />} />
          <Route path={ROUTES.chat} element={<ChatPage />} />
          <Route path={ROUTES.market} element={<MarketTrendsPage />} />
          <Route path={ROUTES.pricing} element={<PricingPage />} />

          <Route element={<RequireAdmin />}>
            <Route path={ROUTES.admin} element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
    </Routes>
  );
}
