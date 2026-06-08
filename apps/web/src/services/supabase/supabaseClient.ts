// Browser Supabase client (anon key) for auth/session.
// In mock mode (or when env vars are missing) this stays null and the app uses
// the mock auth flow instead.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

export const supabase: SupabaseClient | null =
  !env.useMock && env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey)
    : null;
