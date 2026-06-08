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
    featureKeys: ['pricing.f.basicSearch', 'pricing.f.reports3', 'pricing.f.limitedData'],
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
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [method, setMethod] = useState<'card' | 'vodafone' | 'fawry'>('card');
  const [processing, setProcessing] = useState(false);

  const selected = useMemo(() => PLANS.find((p) => p.id === selectedId) ?? PLANS[1], [selectedId]);
  const subtotal = selected.price;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  async function subscribe(planName: string): Promise<void> {
    setProcessing(true);
    try {
      await paymentService.subscribe({
        plan: selected.id,
        amount: total,
        currency: CURRENCY,
        cardName,
        method,
      });
      // Reflect the new tier immediately (server already persisted it in real mode).
      if (user) setUser({ ...user, plan: selected.id });
      pushToast(`Subscription activated — welcome to ${planName}!`, 'success');
    } catch {
      pushToast('Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  }

  return {
    plans: PLANS,
    selected,
    selectedId,
    selectPlan: setSelectedId,
    card: { cardName, cardNumber, expiry, cvv },
    setCardName,
    setCardNumber,
    setExpiry,
    setCvv,
    method,
    setMethod,
    currency: CURRENCY,
    subtotal,
    vat,
    total,
    processing,
    subscribe,
  };
}
