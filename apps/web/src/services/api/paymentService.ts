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
};
