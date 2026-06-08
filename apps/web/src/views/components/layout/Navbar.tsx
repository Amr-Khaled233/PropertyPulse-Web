// Top navigation bar for the public (landing/marketing) pages.

import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import { ThemeLangToggle } from './ThemeLangToggle';
import { useI18n } from '../../../i18n';

export function Navbar() {
  const { t } = useI18n();
  return (
    <header className="container between" style={{ padding: '20px 24px' }}>
      <Link to={ROUTES.landing} className="center-row">
        <span style={{ fontSize: '1.3rem' }}>◧</span>
        <b className="serif" style={{ fontSize: '1.15rem' }}>{t('app.name')}</b>
      </Link>

      <nav className="center-row" style={{ gap: 26 }}>
        <a className="muted" href="#insights">Market Insights</a>
        <a className="muted" href="#engines">Platform</a>
      </nav>

      <div className="center-row">
        <ThemeLangToggle />
        <Link to={ROUTES.login} className="btn btn-ghost btn-sm">{t('common.signIn')}</Link>
        <Link to={ROUTES.register} className="btn btn-primary btn-sm">{t('common.getStarted')}</Link>
      </div>
    </header>
  );
}
