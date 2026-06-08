// Payment controller: subscribe (upgrade the authenticated user's plan).

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { paymentService } from '../services/payment.service.js';

export const paymentController = {
  /** POST /payments/subscribe  { plan: 'pro' | 'enterprise' | 'free' } */
  subscribe: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await paymentService.subscribe(req.user.id, req.body.plan);
    ok(res, result);
  }),
};
