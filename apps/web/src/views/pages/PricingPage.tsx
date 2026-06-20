// Payment & Subscription page (View) — plan selection + secure checkout.
// Public/marketing chrome (Navbar + Footer). Checkout is wired to the mock
// payment service in mock mode; swap in a real gateway (Paymob/Stripe) later.

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { usePaymentViewModel } from '../../viewmodels/usePaymentViewModel';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../components/common/Button';

export function PricingPage() {
  const { t } = useI18n();
  const vm = usePaymentViewModel();
  const { selected } = vm;
  const [params, setParams] = useSearchParams();
  const pushToast = useUiStore((s) => s.pushToast);

  // Handle the redirect back from Stripe Checkout.
  useEffect(() => {
    const sessionId = params.get('session_id');
    const canceled = params.get('canceled');
    if (sessionId) {
      // confirmReturn navigates on its own (dashboard on success, back to pricing
      // on failure), so we must NOT also setParams here — that would override the
      // navigation and bounce the user back to /pricing.
      void vm.confirmReturn(sessionId);
    } else if (canceled) {
      pushToast('Payment canceled.', 'info');
      setParams({}, { replace: true });
    }
  }, []);
  const planLabel = `PropertyPulse ${t(selected.nameKey)}`;
  const money = (n: number, dec = false) =>
    `EGP ${dec ? n.toFixed(2) : n.toLocaleString('en-US')}`;

  return (
    <div className="pricing-page">
      <div>
        <h1 className="serif">{t('pricing.title')}</h1>
        <p className="muted" style={{ maxWidth: 560 }}>{t('pricing.subtitle')}</p>
      </div>

      <div className="pricing-layout">
        {/* Plans */}
        <div className="plan-grid">
          {vm.plans.map((plan) => {
            const active = vm.selectedId === plan.id;
            const isCurrent = plan.id === vm.currentPlan;
            const ctaText = isCurrent
              ? t('pricing.currentPlan')
              : plan.id === 'free'
                ? t('pricing.included')
                : t('pricing.upgradeNow');
            return (
              <div
                key={plan.id}
                className={`card plan-card${plan.popular ? ' plan-popular' : ''}${active ? ' plan-active' : ''}${isCurrent ? ' plan-current' : ''}`}
                onClick={() => { if (!isCurrent) vm.selectPlan(plan.id); }}
              >
                {isCurrent ? (
                  <span className="plan-badge plan-badge-current">✓ {t('pricing.activePlan')}</span>
                ) : (
                  plan.popular && <span className="plan-badge">{t('pricing.mostPopular')}</span>
                )}
                <div className="plan-tier">{t(plan.tierKey)}</div>
                <h3 className="plan-name">{t(plan.nameKey)}</h3>
                <div className="plan-price">{money(plan.price)}</div>
                <div className="muted plan-cadence">{t(plan.cadenceKey)}</div>
                <ul className="plan-features">
                  {plan.featureKeys.map((k) => (
                    <li key={k}><span className="tick">✓</span>{t(k)}</li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent || plan.id === 'free' ? 'outline' : 'green'}
                  block
                  disabled={isCurrent || plan.id === 'free'}
                  onClick={(e) => { e.stopPropagation(); if (!isCurrent) vm.selectPlan(plan.id); }}
                >
                  {ctaText}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Secure checkout (Stripe) */}
        <aside className="card card-pad checkout">
          <h3 style={{ marginBottom: 14 }}>{t('pricing.checkout')}</h3>

          {vm.currentPlan !== 'free' && (
            <div className="checkout-active">
              <span className="muted">{t('pricing.activePlan')}</span>
              <span className="badge badge-green">{vm.currentPlan.toUpperCase()}</span>
            </div>
          )}

          <div className="checkout-plan">
            <div>
              <small className="muted">{t('pricing.selectedPlan')}</small>
              <div>
                <b className="accent">{planLabel}</b>{' '}
                <span className="muted" style={{ fontSize: '0.82rem' }}>({t('pricing.monthly')})</span>
              </div>
            </div>
            <b className="accent">{money(selected.price, true)}</b>
          </div>

          <div className="checkout-summary" style={{ marginTop: 16 }}>
            <div className="between"><span className="muted">{t('pricing.subtotal')}</span><span>{money(vm.subtotal, true)}</span></div>
            <div className="between"><span className="muted">{t('pricing.vat')}</span><span>{money(vm.vat, true)}</span></div>
            <div className="between summary-total"><b>{t('pricing.total')}</b><b>{money(vm.total, true)}</b></div>
          </div>

          <Button
            variant="green"
            block
            disabled={vm.processing || selected.price === 0 || selected.id === vm.currentPlan}
            onClick={() => void vm.subscribe(planLabel)}
            style={{ marginTop: 16 }}
          >
            {vm.processing
              ? t('common.loading')
              : selected.id === vm.currentPlan
                ? t('pricing.alreadySubscribed')
                : selected.price === 0
                  ? t('pricing.currentPlan')
                  : t('pricing.payStripe')}
          </Button>

          <div className="center muted secured">🔒 {t('pricing.secured')}</div>
          <p className="muted center" style={{ fontSize: '0.78rem', marginTop: 8 }}>{t('pricing.stripeNote')}</p>
        </aside>
      </div>
    </div>
  );
}
