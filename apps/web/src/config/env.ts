// Typed access to import.meta.env (VITE_* vars).
// `useMock` lets the whole web app run with seeded data and no backend/keys.

interface AppEnv {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** When true, API services return local seeded data instead of calling the server. */
  useMock: boolean;
}

const raw = import.meta.env;

// Mock mode is ON by default; set VITE_USE_MOCK=false to talk to the real server.
const useMock = (raw.VITE_USE_MOCK ?? 'true').toString().toLowerCase() !== 'false';

export const env: AppEnv = {
  apiUrl: raw.VITE_API_URL ?? 'http://localhost:4000/api',
  supabaseUrl: raw.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: raw.VITE_SUPABASE_ANON_KEY ?? '',
  useMock,
};
