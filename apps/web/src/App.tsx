// Root component — applies theme/language to <html> then renders the router.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { ROUTES } from './routes/routes';
import { useUiStore, applyDocument } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { authService } from './services/api/authService';
import { IS_MOCK } from './services/api/apiClient';
import { supabase } from './services/supabase/supabaseClient';

export function App() {
  const theme = useUiStore((s) => s.theme);
  const lang = useUiStore((s) => s.lang);
  const navigate = useNavigate();

  useEffect(() => {
    applyDocument(theme, lang);
  }, [theme, lang]);

  useEffect(() => {
    if (IS_MOCK) return;
    const { user, logout } = useAuthStore.getState();
    if (!user) return;
    authService.me().catch(() => logout());
  }, []);

  useEffect(() => {
    if (IS_MOCK || !supabase) return;
    const adopt = async (token?: string) => {
      if (!token) return;
      const hadUser = !!useAuthStore.getState().user;
      const user = await useAuthStore.getState().adoptSupabaseSession(token);
      // Forward to the right home only when coming from a public/auth screen.
      const onPublic = ['/', ROUTES.login, ROUTES.register].includes(window.location.pathname);
      if (user && !hadUser && onPublic) {
        navigate(user.role === 'admin' ? ROUTES.admin : ROUTES.dashboard, { replace: true });
      }
    };
    supabase.auth.getSession().then(({ data }) => void adopt(data.session?.access_token));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void adopt(session?.access_token);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return <AppRouter />;
}
