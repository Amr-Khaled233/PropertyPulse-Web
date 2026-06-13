// Payment / subscription API — Stripe-backed endpoints on the server.

import { apiClient } from './apiClient';

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface SubscribeInput {
  plan: PlanId;
  amount: number;
  currency: string;
}

export interface SubscribeResult {
  ok: boolean;
  plan: PlanId;
  transactionId: string;
  paidAt: string;
}

export const paymentService = {
  async subscribe(input: SubscribeInput): Promise<SubscribeResult> {
    const { data } = await apiClient.post<SubscribeResult>('/payments/subscribe', input);
    return data;
  },

  /** Start a Stripe Checkout Session. Returns a redirect URL, or simulated=true
   *  when Stripe isn't configured (caller then upgrades directly). */
  async startCheckout(plan: PlanId): Promise<{ url: string | null; simulated: boolean }> {
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
