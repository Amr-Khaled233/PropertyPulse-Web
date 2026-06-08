// Register page (View) — split layout: navy feature panel + white sign-up card.
// Mirrors the brand design (Newsreader headline, green CTA, Google sign-up).

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ThemeLangToggle } from '../components/layout/ThemeLangToggle';
import { GoogleButton } from '../components/auth/GoogleButton';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=70';

export function RegisterPage() {
  const { loading, error, errorFor, submitRegister } = useAuthViewModel();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [investorType, setInvestorType] = useState('individual');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    void submitRegister(email, password, fullName);
  }

  const features = [
    { icon: '◉', title: t('reg.f1Title'), desc: t('reg.f1Desc') },
    { icon: '↗', title: t('reg.f2Title'), desc: t('reg.f2Desc') },
    { icon: '⚖', title: t('reg.f3Title'), desc: t('reg.f3Desc') },
  ];

  return (
    <div className="auth-page">
      {/* Left: navy value-proposition panel */}
      <aside className="auth-aside">
        <div className="center-row" style={{ gap: 10 }}>
          <span className="logo">◧</span>
          <b className="serif" style={{ fontSize: '1.2rem', color: '#fff' }}>{t('app.name')}</b>
        </div>

        <div className="auth-hero">
          <h2 className="serif">{t('reg.heroTitle')}</h2>
          <ul className="feature-list">
            {features.map((f) => (
              <li key={f.title}>
                <span className="feature-ico">{f.icon}</span>
                <div>
                  <b>{f.title}</b>
                  <p>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-photo" style={{ backgroundImage: `url(${HERO_PHOTO})` }} />
      </aside>

      {/* Right: sign-up card */}
      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="between" style={{ marginBottom: 18 }}>
            <span className="eyebrow">{t('common.signUp')}</span>
            <ThemeLangToggle />
          </div>

          <h1 style={{ marginBottom: 4 }}>{t('reg.joinTitle')}</h1>
          <p className="muted" style={{ marginBottom: 22 }}>{t('reg.joinSubtitle')}</p>

          <form className="col" style={{ gap: 16 }} onSubmit={onSubmit}>
            <Input
              label={t('common.fullName')}
              name="fullName"
              placeholder="Jonathan Sterling"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errorFor('fullName')}
            />
            <Input
              label={t('common.email')}
              type="email"
              name="email"
              placeholder="j.sterling@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorFor('email')}
            />

            <div className="grid grid-2" style={{ gap: 16 }}>
              <Input
                label={t('reg.phone')}
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="field">
                <label className="label" htmlFor="investorType">{t('reg.investorType')}</label>
                <select
                  id="investorType"
                  className="select"
                  value={investorType}
                  onChange={(e) => setInvestorType(e.target.value)}
                >
                  <option value="individual">{t('reg.individual')}</option>
                  <option value="institution">{t('reg.institution')}</option>
                  <option value="fund">{t('reg.fund')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16 }}>
              <Input
                label={t('common.password')}
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errorFor('password')}
              />
              <Input
                label={t('reg.confirmPassword')}
                type="password"
                name="confirm"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={mismatch ? t('reg.passwordMismatch') : undefined}
              />
            </div>

            {error && <div className="field-error">{error}</div>}

            <Button type="submit" variant="green" block disabled={loading}>
              {loading ? t('common.loading') : t('reg.createAccount')}
            </Button>

            <div className="auth-divider">{t('reg.orContinue')}</div>
            <GoogleButton onClick={() => void loginWithGoogle()} label={t('reg.googleSignup')} />

            <p className="muted center" style={{ margin: '4px 0 0' }}>
              {t('auth.haveAccount')}{' '}
              <Link to={ROUTES.login} className="accent">{t('common.signIn')}</Link>
            </p>
            <div className="center auth-foot-links">
              <Link to={ROUTES.register}>{t('reg.privacy')}</Link>
              {'  ·  '}
              <Link to={ROUTES.register}>{t('reg.terms')}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
