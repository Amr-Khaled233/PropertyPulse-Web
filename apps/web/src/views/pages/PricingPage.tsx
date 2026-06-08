// Payment & Subscription page (View) — plan selection + secure checkout.
// Public/marketing chrome (Navbar + Footer). Checkout is wired to the mock
// payment service in mock mode; swap in a real gateway (Paymob/Stripe) later.

import { useI18n } from '../../i18n';
import { usePaymentViewModel } from '../../viewmodels/usePaymentViewModel';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const BANNER_IMG =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=70';

export function PricingPage() {
  const { t } = useI18n();
  const vm = usePaymentViewModel();
  const { selected } = vm;
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
        {/* Plans + custom banner */}
        <div className="col" style={{ gap: 18 }}>
          <div className="plan-grid">
            {vm.plans.map((plan) => {
              const active = vm.selectedId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`card plan-card${plan.popular ? ' plan-popular' : ''}${active ? ' plan-active' : ''}`}
                  onClick={() => vm.selectPlan(plan.id)}
                >
                  {plan.popular && <span className="plan-badge">{t('pricing.mostPopular')}</span>}
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
                    variant={plan.popular ? 'green' : 'outline'}
                    block
                    onClick={(e) => { e.stopPropagation(); vm.selectPlan(plan.id); }}
                  >
                    {t(plan.ctaKey)}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="card card-pad custom-banner">
            <div className="cb-img" style={{ backgroundImage: `url(${BANNER_IMG})` }} />
            <div>
              <b className="serif" style={{ fontSize: '1.05rem' }}>{t('pricing.customTitle')}</b>
              <p className="muted" style={{ margin: '4px 0 8px', fontSize: '0.88rem' }}>{t('pricing.customDesc')}</p>
              <a className="accent" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('pricing.bookCall')} →</a>
            </div>
          </div>
        </div>

        {/* Secure checkout */}
        <aside className="card card-pad checkout">
          <h3 style={{ marginBottom: 14 }}>{t('pricing.checkout')}</h3>

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

          <div className="col" style={{ gap: 14, marginTop: 16 }}>
            <Input
              label={t('pricing.cardName')}
              placeholder={t('pricing.cardNamePh')}
              value={vm.card.cardName}
              onChange={(e) => vm.setCardName(e.target.value)}
            />
            <Input
              label={t('pricing.cardNumber')}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              value={vm.card.cardNumber}
              onChange={(e) => vm.setCardNumber(e.target.value)}
            />
            <div className="grid grid-2" style={{ gap: 14 }}>
              <Input
                label={t('pricing.expiry')}
                placeholder="MM/YY"
                value={vm.card.expiry}
                onChange={(e) => vm.setExpiry(e.target.value)}
              />
              <Input
                label={t('pricing.cvv')}
                placeholder="123"
                inputMode="numeric"
                value={vm.card.cvv}
                onChange={(e) => vm.setCvv(e.target.value)}
              />
            </div>
          </div>

          <div className="pay-divider">{t('pricing.orPayWith')}</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <button
              type="button"
              className={`pay-method${vm.method === 'vodafone' ? ' active' : ''}`}
              onClick={() => vm.setMethod('vodafone')}
            >
              <span className="pm-vodafone">Vodafone</span> Cash
            </button>
            <button
              type="button"
              className={`pay-method${vm.method === 'fawry' ? ' active' : ''}`}
              onClick={() => vm.setMethod('fawry')}
            >
              <span className="pm-fawry">Fawry</span>
            </button>
          </div>

          <div className="checkout-summary">
            <div className="between"><span className="muted">{t('pricing.subtotal')}</span><span>{money(vm.subtotal, true)}</span></div>
            <div className="between"><span className="muted">{t('pricing.vat')}</span><span>{money(vm.vat, true)}</span></div>
            <div className="between summary-total"><b>{t('pricing.total')}</b><b>{money(vm.total, true)}</b></div>
          </div>

          <Button
            variant="green"
            block
            disabled={vm.processing}
            onClick={() => void vm.subscribe(planLabel)}
            style={{ marginTop: 4 }}
          >
            {vm.processing ? t('common.loading') : t('pricing.payNow')}
          </Button>
          <div className="center muted secured">🔒 {t('pricing.secured')}</div>
        </aside>
      </div>
    </div>
  );
}
