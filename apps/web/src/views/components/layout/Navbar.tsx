// Top navigation bar for the public (landing/marketing) pages.
// Desktop: inline links. Mobile: "Get Started" stays visible + a hamburger menu.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import { ThemeLangToggle } from './ThemeLangToggle';
import { useI18n } from '../../../i18n';

export function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="container nav-bar">
      <Link to={ROUTES.landing} className="center-row" onClick={close}>
        <span style={{ fontSize: '1.3rem' }}>◧</span>
        <b className="serif" style={{ fontSize: '1.15rem' }}>{t('app.name')}</b>
      </Link>

      {/* Desktop links + actions */}
      <nav className="nav-desktop">
        <a className="muted" href="#insights">Market Insights</a>
        <a className="muted" href="#engines">Platform</a>
        <ThemeLangToggle />
        <Link to={ROUTES.login} className="btn btn-ghost btn-sm">{t('common.signIn')}</Link>
        <Link to={ROUTES.register} className="btn btn-primary btn-sm">{t('common.getStarted')}</Link>
      </nav>

      {/* Mobile actions: keep the primary CTA visible + a hamburger */}
      <div className="nav-mobile">
        <Link to={ROUTES.register} className="btn btn-primary btn-sm">{t('common.getStarted')}</Link>
        <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="nav-menu" onClick={close}>
          <a href="#insights">Market Insights</a>
          <a href="#engines">Platform</a>
          <Link to={ROUTES.login}>{t('common.signIn')}</Link>
          <div className="center-row" style={{ marginTop: 4 }}><ThemeLangToggle /></div>
        </div>
      )}
    </header>
  );
}
