// Zustand store: authenticated user/session. Session is persisted to localStorage
// so a reload keeps the user signed in (works in both mock and real modes).

import { create } from 'zustand';
import type { UserProfile } from '@propertypulse/shared-types';
import { authService } from '../services/api/authService';
import { setToken } from '../services/api/apiClient';

const SESSION_KEY = 'pp.session';

function loadSession(): UserProfile | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as UserProfile | null;
  } catch {
    return null;
  }
}
function saveSession(user: UserProfile | null): void {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
  /** Adopt a Supabase session token (e.g. after Google OAuth) as our app session. */
  adoptSupabaseSession: (accessToken: string) => Promise<UserProfile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadSession(),
  loading: false,
  error: null,

  isAdmin: () => get().user?.role === 'admin',

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { user } = await authService.login(email, password);
      saveSession(user);
      set({ user, loading: false });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed', loading: false });
      return false;
    }
  },

  async loginWithGoogle() {
    set({ loading: true, error: null });
    try {
      const result = await authService.loginWithGoogle();
      if (result) {
        saveSession(result.user);
        set({ user: result.user, loading: false });
      } else {
        set({ loading: false }); // real OAuth redirect in progress
      }
      return !!result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Google sign-in failed', loading: false });
      return false;
    }
  },

  async register(email, password, fullName) {
    set({ loading: true, error: null });
    try {
      await authService.register(email, password, fullName);
      const { user } = await authService.login(email, password);
      saveSession(user);
      set({ user, loading: false });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed', loading: false });
      return false;
    }
  },

  logout() {
    setToken(null);
    saveSession(null);
    authService.logout();
    set({ user: null });
  },

  setUser(user) {
    saveSession(user);
    set({ user });
  },

  async adoptSupabaseSession(accessToken) {
    setToken(accessToken);
    try {
      const user = await authService.me();
      saveSession(user);
      set({ user });
      return user;
    } catch {
      // Token not usable yet — leave existing state untouched.
      return null;
    }
  },
}));
