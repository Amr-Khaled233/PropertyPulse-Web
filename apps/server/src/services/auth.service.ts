// Auth service — registration, login and profile lookup via Supabase Auth.

import { supabase } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/apiError.js';
import type { UserProfile } from '@propertypulse/shared-types';

export interface AuthResult {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(input: { email: string; password: string; fullName?: string }): Promise<UserProfile> {
    const { data, error } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (error || !data.user) throw ApiError.badRequest(error?.message ?? 'Registration failed');

    return userRepository.upsert({
      id: data.user.id,
      email: input.email,
      fullName: input.fullName,
    });
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data.session || !data.user) {
      throw ApiError.unauthorized(error?.message ?? 'Invalid credentials');
    }

    const profile =
      (await userRepository.getById(data.user.id)) ??
      (await userRepository.upsert({ id: data.user.id, email: input.email }));

    return {
      user: profile,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await userRepository.getById(userId);
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile;
  },
};
