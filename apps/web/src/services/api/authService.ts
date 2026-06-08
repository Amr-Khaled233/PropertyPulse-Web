// API calls for authentication. Falls back to mock data when VITE_USE_MOCK is on.
//
// Account persistence:
//   • Real mode  → Supabase Auth stores accounts in our Postgres (server auth.service).
//   • Mock mode  → accounts are saved to localStorage so registration/login persist
//                  across reloads without a backend (a stand-in for the DB).

import type { UserProfile } from '@propertypulse/shared-types';
import { apiClient, IS_MOCK, mockDelay, setToken } from './apiClient';
import { supabase } from '../supabase/supabaseClient';
import { MOCK_USER } from '../mock/mockData';

export interface AuthResult {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

const ACCOUNTS_KEY = 'pp.mockAccounts';
const ADMIN_EMAILS = ['admin@propertypulse.app'];

interface StoredAccount extends UserProfile {
  password?: string;
}

function readAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as StoredAccount[];
  } catch {
    return [];
  }
}
function writeAccounts(list: StoredAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}
function roleFor(email: string): UserProfile['role'] {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'investor';
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    if (IS_MOCK) {
      const existing = readAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
      const user: UserProfile = existing
        ? { ...existing, password: undefined } as UserProfile
        : { ...MOCK_USER, id: `user-${Date.now()}`, email, role: roleFor(email) };
      const result: AuthResult = { user, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
      setToken(result.accessToken);
      return mockDelay(result);
    }
    const { data } = await apiClient.post<AuthResult>('/auth/login', { email, password });
    setToken(data.accessToken);
    return data;
  },

  async loginWithGoogle(): Promise<AuthResult | void> {
    if (IS_MOCK) {
      const user: UserProfile = {
        id: 'user-google',
        email: 'google.user@gmail.com',
        fullName: 'Google Investor',
        role: 'investor',
        createdAt: new Date().toISOString(),
      };
      setToken('mock-google-token');
      return mockDelay({ user, accessToken: 'mock-google-token', refreshToken: 'mock-refresh' });
    }
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
    if (IS_MOCK) {
      const accounts = readAccounts();
      const user: StoredAccount = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        role: roleFor(email),
        createdAt: new Date().toISOString(),
        password,
      };
      writeAccounts([...accounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase()), user]);
      return mockDelay({ ...user, password: undefined } as UserProfile);
    }
    const { data } = await apiClient.post<UserProfile>('/auth/register', { email, password, fullName });
    return data;
  },

  async me(): Promise<UserProfile> {
    if (IS_MOCK) return mockDelay(MOCK_USER);
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    return data;
  },

  /** All registered accounts — used by the admin dashboard. */
  async listUsers(): Promise<UserProfile[]> {
    if (IS_MOCK) {
      const stored = readAccounts().map((a) => ({ ...a, password: undefined }) as UserProfile);
      const seeded = stored.some((u) => u.id === MOCK_USER.id) ? [] : [MOCK_USER];
      return mockDelay([...seeded, ...stored]);
    }
    const { data } = await apiClient.get<UserProfile[]>('/admin/users');
    return data;
  },

  logout(): void {
    setToken(null);
    if (supabase) void supabase.auth.signOut();
  },
};
