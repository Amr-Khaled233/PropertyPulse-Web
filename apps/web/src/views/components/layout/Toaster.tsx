// Toast notifications rendered from the UI store.

import { useUiStore } from '../../../store/uiStore';

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  if (!toasts.length) return null;

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
