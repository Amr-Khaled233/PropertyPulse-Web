// Zustand store: UI state (sidebar, theme, language, toasts).

import { create } from 'zustand';
import type { Lang } from '../i18n/translations';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Theme = 'light' | 'dark';

const THEME_KEY = 'pp.theme';
const LANG_KEY = 'pp.lang';

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function initialLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'en';
}

/** Reflect theme + language onto <html> so CSS and RTL respond globally. */
export function applyDocument(theme: Theme, lang: Lang): void {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
}

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  lang: Lang;
  toasts: Toast[];
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLang: (lang: Lang) => void;
  pushToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Desktop: rail is always visible. Mobile: start with the drawer closed.
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 860 : true,
  theme: initialTheme(),
  lang: initialLang(),
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),

  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyDocument(theme, get().lang);
    set({ theme });
  },
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyDocument(theme, get().lang);
    set({ theme });
  },
  setLang: (lang) => {
    localStorage.setItem(LANG_KEY, lang);
    applyDocument(get().theme, lang);
    set({ lang });
  },

  pushToast: (message, type = 'info') => {
    const id = `t-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
