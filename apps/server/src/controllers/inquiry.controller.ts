// Inquiry controller — public submission + the signed-in user's own inquiries
// (used by the Notifications feature).

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';
import { adminRepository } from '../repositories/admin.repository.js';

export const inquiryController = {
  create: asyncHandler(async (req, res) => {
    const inquiry = await adminRepository.createInquiry({
      kind: req.body.kind,
      name: req.body.name,
      email: req.body.email || undefined,
      phone: req.body.phone,
      message: req.body.message,
      propertyId: req.body.propertyId,
    });
    created(res, inquiry);
  }),

  /** GET /inquiries/my — the authenticated user's inquiries (matched by email). */
  mine: asyncHandler(async (req, res) => {
    const email = req.user?.email;
    if (!email) {
      ok(res, []);
      return;
    }
    ok(res, await adminRepository.listInquiriesByEmail(email));
  }),
};
