// Payment service — records a subscription and upgrades the user's plan.
// This is a mock gateway: a real integration (Paymob / Stripe) would verify the
// charge with the provider before calling setPlan.

import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/apiError.js';
import type { PlanTier } from '@propertypulse/shared-types';

const VALID_PLANS: PlanTier[] = ['free', 'pro', 'enterprise'];

export interface SubscribeResult {
  ok: boolean;
  plan: PlanTier;
  transactionId: string;
  paidAt: string;
}

export const paymentService = {
  async subscribe(userId: string, plan: PlanTier): Promise<SubscribeResult> {
    if (!VALID_PLANS.includes(plan)) throw ApiError.badRequest('Invalid plan');

    // TODO: verify the real charge with the payment provider here.
    const profile = await userRepository.setPlan(userId, plan);

    return {
      ok: true,
      plan: profile.plan ?? plan,
      transactionId: `txn_${Date.now().toString(36)}`,
      paidAt: new Date().toISOString(),
    };
  },
};
