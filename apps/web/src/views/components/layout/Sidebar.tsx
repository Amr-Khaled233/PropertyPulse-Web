// Sidebar navigation (dark navy rail) used by the authenticated app shell.

import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, ROUTES } from '../../../routes/routes';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useI18n } from '../../../i18n';

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebar = useUiStore((s) => s.setSidebar);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const logout = useAuthStore((s) => s.logout);
  const { t } = useI18n();

  // Admins see only the admin panel; investors see everything except admin.
  const items = NAV_ITEMS.filter((item) => (isAdmin ? item.adminOnly : !item.adminOnly));
  // Close the mobile drawer after navigating (no-op on desktop where it stays open).
  const closeOnMobile = () => {
    if (window.innerWidth <= 860) setSidebar(false);
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="logo">◧</span>
        <span>
          <b>{t('app.name')}</b>
          <small>{isAdmin ? t('admin.console') : t('admin.investorPortal')}</small>
        </span>
      </div>

      <nav className="col" style={{ gap: 4 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeOnMobile}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="ico">{item.icon}</span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      {!isAdmin && (
        <NavLink to={ROUTES.search} onClick={closeOnMobile} className="btn btn-green btn-block" style={{ marginBottom: 8 }}>
          {t('nav.newAnalysis')}
        </NavLink>
      )}
      <button className="nav-link" onClick={logout} style={{ width: '100%' }}>
        <span className="ico">⎋</span>
        {t('common.signOut')}
      </button>
    </aside>
  );
}
