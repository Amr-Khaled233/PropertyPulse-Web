// Admin controller — users, property CRUD/moderation, CRM inquiries.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';
import { adminService } from '../services/admin.service.js';

export const adminController = {
  listUsers: asyncHandler(async (_req, res) => {
    ok(res, await adminService.listUsers());
  }),

  updateUser: asyncHandler(async (req, res) => {
    ok(res, await adminService.updateUser(req.params.id, { plan: req.body.plan, role: req.body.role }));
  }),

  deleteUser: asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id);
    ok(res, { id: req.params.id, deleted: true });
  }),

  createProperty: asyncHandler(async (req, res) => {
    created(res, await adminService.createProperty(req.body));
  }),

  updateProperty: asyncHandler(async (req, res) => {
    ok(res, await adminService.updateProperty(req.params.id, req.body));
  }),

  deleteProperty: asyncHandler(async (req, res) => {
    await adminService.deleteProperty(req.params.id);
    ok(res, { id: req.params.id, deleted: true });
  }),

  listInquiries: asyncHandler(async (_req, res) => {
    ok(res, await adminService.listInquiries());
  }),

  setInquiryStatus: asyncHandler(async (req, res) => {
    ok(res, await adminService.setInquiryStatus(req.params.id, req.body.status));
  }),

  deleteInquiry: asyncHandler(async (req, res) => {
    await adminService.deleteInquiry(req.params.id);
    ok(res, { id: req.params.id, deleted: true });
  }),
};
