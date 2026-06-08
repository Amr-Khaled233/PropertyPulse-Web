// Login page (View) — email/password + Google, styled to the brand design.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ThemeLangToggle } from '../components/layout/ThemeLangToggle';
import { GoogleButton } from '../components/auth/GoogleButton';

export function LoginPage() {
  const { loading, error, errorFor, submitLogin } = useAuthViewModel();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const { t } = useI18n();
  const [email, setEmail] = useState('investor@propertypulse.app');
  const [password, setPassword] = useState('password');

  return (
    <div className="auth-page">
      <div className="auth-aside">
        <div className="center-row" style={{ gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>◧</span>
          <b className="serif" style={{ fontSize: '1.3rem', color: '#fff' }}>{t('app.name')}</b>
        </div>
        <div>
          <h2 style={{ color: '#fff', fontSize: '2rem' }}>{t('app.tagline')}</h2>
          <p style={{ color: 'var(--text-on-dark-muted)' }}>
            Institutional-grade analysis, rental yield, ROI projections and risk — in minutes.
          </p>
        </div>
        <span style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} PropertyPulse Institutional
        </span>
      </div>

      <div className="auth-form-wrap">
        <div className="between" style={{ width: '100%', maxWidth: 380, marginBottom: 8 }}>
          <span className="eyebrow">{t('common.signIn')}</span>
          <ThemeLangToggle />
        </div>
        <form
          className="col"
          style={{ width: '100%', maxWidth: 380, gap: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            submitLogin(email, password);
          }}
        >
          <div>
            <h1 style={{ marginBottom: 4 }}>{t('auth.loginTitle')}</h1>
            <p className="muted">{t('auth.loginSubtitle')}</p>
          </div>

          <Input
            label={t('common.email')}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errorFor('email')}
          />
          <Input
            label={t('common.password')}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errorFor('password')}
          />

          {error && <div className="field-error">{error}</div>}

          <Button type="submit" variant="green" block disabled={loading}>
            {loading ? t('common.loading') : t('common.signIn')}
          </Button>

          <div className="auth-divider">{t('auth.or')}</div>
          <GoogleButton onClick={() => loginWithGoogle()} label={t('common.continueGoogle')} />

          <p className="muted center" style={{ margin: 0 }}>
            {t('auth.noAccount')} <Link to={ROUTES.register} className="accent">{t('common.signUp')}</Link>
          </p>
          <p className="muted center" style={{ fontSize: '0.78rem', margin: 0 }}>
            Demo: any email works. Use <b>admin@propertypulse.app</b> for the admin dashboard.
          </p>
        </form>
      </div>
    </div>
  );
}
