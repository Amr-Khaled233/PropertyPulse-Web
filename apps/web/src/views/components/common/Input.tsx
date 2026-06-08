// Reusable input component.

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  pill?: boolean;
}

export function Input({ label, error, pill = false, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={['input', pill ? 'input-pill' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
