// Payment / subscription API. Mock mode simulates a gateway charge; real mode
// would post to the server (e.g. a Paymob / Stripe-backed /payments endpoint).

import { apiClient, IS_MOCK, mockDelay } from './apiClient';

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface SubscribeInput {
  plan: PlanId;
  amount: number;
  currency: string;
  cardName?: string;
  method?: 'card' | 'vodafone' | 'fawry';
}

export interface SubscribeResult {
  ok: boolean;
  plan: PlanId;
  transactionId: string;
  paidAt: string;
}

export const paymentService = {
  async subscribe(input: SubscribeInput): Promise<SubscribeResult> {
    if (IS_MOCK) {
      return mockDelay(
        {
          ok: true,
          plan: input.plan,
          transactionId: `txn_${Math.random().toString(36).slice(2, 10)}`,
          paidAt: new Date().toISOString(),
        },
        900,
      );
    }
    const { data } = await apiClient.post<SubscribeResult>('/payments/subscribe', input);
    return data;
  },

  /** Start a Stripe Checkout Session. Returns a redirect URL, or simulated=true
   *  when Stripe isn't configured (caller then upgrades directly). */
  async startCheckout(plan: PlanId): Promise<{ url: string | null; simulated: boolean }> {
    if (IS_MOCK) return mockDelay({ url: null, simulated: true });
    const { data } = await apiClient.post<{ url: string | null; simulated: boolean }>(
      '/payments/checkout',
      { plan },
    );
    return data;
  },

  /** Verify a returned Stripe Checkout session and apply the plan. */
  async confirm(sessionId: string): Promise<SubscribeResult> {
    const { data } = await apiClient.get<SubscribeResult>('/payments/confirm', {
      session_id: sessionId,
    });
    return data;
  },
};
