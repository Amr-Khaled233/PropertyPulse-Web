// Analysis controller: computeMetrics, compare.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
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

  /** POST /analysis/compare  { propertyIds: string[] } */
  compare: asyncHandler(async (req, res) => {
    const result = await analysisService.compare(req.body.propertyIds);
    ok(res, result);
  }),
};
