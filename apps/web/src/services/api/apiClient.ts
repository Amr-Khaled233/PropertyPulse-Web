// Axios instance configured with VITE_API_URL + auth interceptor.
// Unwraps the server's ApiResponse<T> envelope so services receive plain data.

import axios, { type AxiosInstance } from 'axios';
import type { ApiResponse } from '@propertypulse/shared-types';
import { env } from '../../config/env';

const TOKEN_KEY = 'pp.accessToken';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const instance: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 handling: surface the error to the caller and let the React Router
// guard (RequireAuth) decide what to do. We deliberately do NOT hard-redirect
// via window.location or wipe the session here — a single transient 401 (e.g.
// a query racing a freshly-created session) would otherwise reload the page and
// kick a just-signed-in user back to /login in a loop. Real logout is explicit
// (logout button), and expired tokens simply produce visible per-page errors.
instance.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

/** Simulate network latency in mock mode for realistic loading states. */
export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const IS_MOCK = env.useMock;

interface RequestMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<{ data: T; meta?: RequestMeta }> {
  const res = await p;
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.error?.message ?? 'Request failed');
  }
  return { data: body.data, meta: body.meta as RequestMeta | undefined };
}

export const apiClient = {
  async get<T>(url: string, params?: Record<string, unknown>) {
    return unwrap<T>(instance.get<ApiResponse<T>>(url, { params }));
  },
  async post<T>(url: string, data?: unknown) {
    return unwrap<T>(instance.post<ApiResponse<T>>(url, data));
  },
  async put<T>(url: string, data?: unknown) {
    return unwrap<T>(instance.put<ApiResponse<T>>(url, data));
  },
  async delete<T>(url: string) {
    return unwrap<T>(instance.delete<ApiResponse<T>>(url));
  },
};

/** Normalize unknown errors to a readable message for the UI. */
export function toErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as ApiResponse<unknown>)?.error?.message ?? err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}
