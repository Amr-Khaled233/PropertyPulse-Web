// API calls for authentication. Accounts live in Supabase Auth (server auth.service);
// Google sign-in uses Supabase OAuth.

import type { UserProfile } from '@propertypulse/shared-types';
import { apiClient, setToken } from './apiClient';
import { supabase } from '../supabase/supabaseClient';

export interface AuthResult {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/login', { email, password });
    setToken(data.accessToken);
    return data;
  },

  async loginWithGoogle(): Promise<AuthResult | void> {
    // Real OAuth via Supabase — redirects to Google, returns to the app.
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      return;
    }
    throw new Error('Google sign-in requires Supabase configuration.');
  },

  async register(email: string, password: string, fullName: string): Promise<UserProfile> {
    const { data } = await apiClient.post<UserProfile>('/auth/register', { email, password, fullName });
    return data;
  },

  async me(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    return data;
  },

  /** All registered accounts — used by the admin dashboard. */
  async listUsers(): Promise<UserProfile[]> {
    const { data } = await apiClient.get<UserProfile[]>('/admin/users');
    return data;
  },

  logout(): void {
    setToken(null);
    if (supabase) void supabase.auth.signOut();
  },
};
