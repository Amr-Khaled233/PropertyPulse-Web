// Inquiry routes: public submission + the user's own inquiries (Notifications).

import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createInquirySchema } from '../validators/inquiry.validator.js';

export const inquiryRouter = Router();

inquiryRouter.get('/my', requireAuth, inquiryController.mine);
inquiryRouter.post('/', validate(createInquirySchema), inquiryController.create);
