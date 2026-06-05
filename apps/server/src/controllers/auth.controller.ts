// Auth controller: register, login, getProfile.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    created(res, user);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    ok(res, result);
  }),

  me: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await authService.getProfile(req.user.id);
    ok(res, profile);
  }),
};
