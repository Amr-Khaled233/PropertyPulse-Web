// Investment analysis routes (compute metrics, compare properties).

import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import { computeMetricsSchema, compareSchema } from '../validators/analysis.validator.js';

export const analysisRouter = Router();

analysisRouter.post('/metrics', validate(computeMetricsSchema), analysisController.computeMetrics);
analysisRouter.post('/compare', aiLimiter, validate(compareSchema), analysisController.compare);
