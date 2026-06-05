// User repository — profiles table access.

import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/apiError.js';
import { toUserProfile, type ProfileRow } from '../models/user.model.js';
import type { UserProfile } from '@propertypulse/shared-types';

export const userRepository = {
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw new ApiError(500, 'PROFILE_FETCH_FAILED', error.message);
    return data ? toUserProfile(data as ProfileRow) : null;
  },

  async upsert(profile: {
    id: string;
    email: string;
    fullName?: string;
    role?: UserProfile['role'];
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName ?? null,
        role: profile.role ?? 'investor',
      })
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'PROFILE_UPSERT_FAILED', error.message);
    return toUserProfile(data as ProfileRow);
  },
};
