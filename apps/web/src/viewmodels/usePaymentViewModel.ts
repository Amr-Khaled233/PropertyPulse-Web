// ViewModel: subscription plans + checkout state.
// Plans are localized in the View via their i18n keys; here we hold the
// pricing data, selection, card fields and the (mock) checkout action.

import { useMemo, useState } from 'react';
import { paymentService, type PlanId } from '../services/api/paymentService';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import type { TranslationKey } from '../i18n';

export interface Plan {
  id: PlanId;
  tierKey: TranslationKey;
  nameKey: TranslationKey;
  price: number;
  cadenceKey: TranslationKey;
  featureKeys: TranslationKey[];
  ctaKey: TranslationKey;
  popular?: boolean;
}

const VAT_RATE = 0.14;
const CURRENCY = 'EGP';

export const PLANS: Plan[] = [
  {
    id: 'free',
    tierKey: 'pricing.base',
    nameKey: 'pricing.free',
    price: 0,
    cadenceKey: 'pricing.foreverFree',
    featureKeys: ['pricing.f.basicSearch', 'pricing.f.reports2', 'pricing.f.compare1', 'pricing.f.limitedData'],
    ctaKey: 'pricing.currentPlan',
  },
  {
    id: 'pro',
    tierKey: 'pricing.elevate',
    nameKey: 'pricing.pro',
    price: 850,
    cadenceKey: 'pricing.perMonthYearly',
    featureKeys: [
      'pricing.f.unlimitedReports',
      'pricing.f.fullAdvisor',
      'pricing.f.realtimeTrends',
      'pricing.f.portfolioTools',
    ],
    ctaKey: 'pricing.upgradeNow',
    popular: true,
  },
  {
    id: 'enterprise',
    tierKey: 'pricing.scale',
    nameKey: 'pricing.enterprise',
    price: 2400,
    cadenceKey: 'pricing.customAccess',
    featureKeys: [
      'pricing.f.teamCollab',
      'pricing.f.apiAccess',
      'pricing.f.customEngine',
      'pricing.f.priorityManager',
    ],
    ctaKey: 'pricing.contactSales',
  },
];

export function usePaymentViewModel() {
  const pushToast = useUiStore((s) => s.pushToast);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [selectedId, setSelectedId] = useState<PlanId>('pro');
  const [processing, setProcessing] = useState(false);

  const selected = useMemo(() => PLANS.find((p) => p.id === selectedId) ?? PLANS[1], [selectedId]);
  const subtotal = selected.price;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  async function subscribe(planName: string): Promise<void> {
    setProcessing(true);
    try {
      // Try real Stripe Checkout first; redirect the user to Stripe's page.
      const checkout = await paymentService.startCheckout(selected.id);
      if (checkout.url) {
        window.location.href = checkout.url;
        return; // we leave the app; the rest happens after redirect back
      }
      // Fallback (free plan or Stripe not configured): upgrade directly.
      await paymentService.subscribe({ plan: selected.id, amount: total, currency: CURRENCY });
      if (user) setUser({ ...user, plan: selected.id });
      pushToast(`Subscription activated — welcome to ${planName}!`, 'success');
    } catch {
      pushToast('Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  }

  /** Called by the Pricing page when Stripe redirects back with a session id. */
  async function confirmReturn(sessionId: string): Promise<void> {
    try {
      const res = await paymentService.confirm(sessionId);
      if (user) setUser({ ...user, plan: res.plan });
      pushToast(`Payment successful — welcome to ${res.plan.toUpperCase()}!`, 'success');
    } catch {
      pushToast('We could not confirm your payment.', 'error');
    }
  }

  return {
    plans: PLANS,
    selected,
    selectedId,
    selectPlan: setSelectedId,
    currency: CURRENCY,
    subtotal,
    vat,
    total,
    processing,
    subscribe,
    confirmReturn,
  };
}
