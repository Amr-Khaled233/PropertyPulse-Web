// Analysis controller: computeMetrics, compare.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { analysisService } from '../services/analysis.service.js';

export const analysisController = {
  /** POST /analysis/metrics  { propertyId?, property?, assumptions? } */
  computeMetrics: asyncHandler(async (req, res) => {
    const { propertyId, property, assumptions } = req.body;
    const result = propertyId
      ? await analysisService.computeForProperty(propertyId, assumptions)
      : analysisService.computeForPayload(property, assumptions);
    ok(res, result);
  }),

  /** POST /analysis/compare  { propertyIds: string[], lang? } — auth + plan-gated */
  compare: asyncHandler(async (req, res) => {
    const result = await analysisService.compare(req.body.propertyIds, req.body.lang, req.user?.id);
    ok(res, result);
  }),

  /** POST /analysis/negotiation  { propertyId, lang? } */
  negotiation: asyncHandler(async (req, res) => {
    const result = await analysisService.negotiation(req.body.propertyId, req.body.lang);
    ok(res, result);
  }),

  /** GET /analysis/comparisons — the user's saved comparisons. */
  listComparisons: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    ok(res, await analysisService.listComparisons(req.user.id));
  }),

  /** DELETE /analysis/comparisons/:id */
  deleteComparison: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    await analysisService.deleteComparison(req.params.id, req.user.id);
    ok(res, { id: req.params.id, deleted: true });
  }),
};
