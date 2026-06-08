// Lightweight client-side form validation helpers.

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function minLength(value: string, n: number): boolean {
  return value.trim().length >= n;
}

export interface FieldError {
  field: string;
  message: string;
}

export function validateLogin(email: string, password: string): FieldError[] {
  const errors: FieldError[] = [];
  if (!isEmail(email)) errors.push({ field: 'email', message: 'Enter a valid email address' });
  if (!minLength(password, 6))
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  return errors;
}

export function validateRegister(
  email: string,
  password: string,
  fullName: string,
): FieldError[] {
  const errors = validateLogin(email, password);
  if (!isNonEmpty(fullName)) errors.push({ field: 'fullName', message: 'Name is required' });
  return errors;
}
