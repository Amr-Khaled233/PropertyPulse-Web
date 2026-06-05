// Root API router — mounts all feature routers under /api.

import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { propertyRouter } from './property.routes.js';
import { analysisRouter } from './analysis.routes.js';
import { reportRouter } from './report.routes.js';
import { watchlistRouter } from './watchlist.routes.js';
import { chatRouter } from './chat.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/properties', propertyRouter);
apiRouter.use('/analysis', analysisRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/watchlist', watchlistRouter);
apiRouter.use('/chat', chatRouter);
