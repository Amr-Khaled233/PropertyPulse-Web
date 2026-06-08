// ViewModel: authentication forms + session.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { validateLogin, validateRegister, type FieldError } from '../utils/validators';
import { ROUTES } from '../routes/routes';

export function useAuthViewModel() {
  const { user, loading, error, login, register, logout } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const navigate = useNavigate();

  async function submitLogin(email: string, password: string) {
    const errors = validateLogin(email, password);
    setFieldErrors(errors);
    if (errors.length) return;
    if (await login(email, password)) {
      // Admins land in the admin console; investors in their dashboard.
      const role = useAuthStore.getState().user?.role;
      navigate(role === 'admin' ? ROUTES.admin : ROUTES.dashboard);
    }
  }

  async function submitRegister(email: string, password: string, fullName: string) {
    const errors = validateRegister(email, password, fullName);
    setFieldErrors(errors);
    if (errors.length) return;
    if (await register(email, password, fullName)) navigate(ROUTES.dashboard);
  }

  const errorFor = (field: string) => fieldErrors.find((e) => e.field === field)?.message;

  return { user, loading, error, fieldErrors, errorFor, submitLogin, submitRegister, logout };
}
