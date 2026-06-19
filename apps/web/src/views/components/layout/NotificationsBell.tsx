// Notifications bell — a red badge for unseen items and a dropdown listing them.
// Role-aware via the viewmodel: investors see updates on their inquiries; admins
// see new inquiries and new users.

import { useEffect, useRef, useState } from 'react';
import { useNotificationsViewModel, type NotifTone } from '../../../viewmodels/useNotificationsViewModel';
import { useI18n } from '../../../i18n';
import { formatDate } from '../../../utils/formatters';

const TONE_COLOR: Record<NotifTone, string> = {
  new: '#2563eb', // blue
  in_progress: '#D4850A', // amber
  closed: '#0B9972', // green
  deleted: '#C0392B', // red
  info: '#0B9972', // green
};

export function NotificationsBell() {
  const { t } = useI18n();
  const vm = useNotificationsViewModel();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) vm.markAllSeen(); // clear the badge on open
  }

  return (
    <div className="notif" ref={wrapRef}>
      <button className="icon-btn" aria-label={t('notif.title')} onClick={toggle}>
        🔔
        {vm.unseen > 0 && <span className="notif-badge">{vm.unseen > 9 ? '9+' : vm.unseen}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-head"><b>{t('notif.title')}</b></div>
          {vm.items.length === 0 ? (
            <div className="muted center" style={{ padding: '24px 12px' }}>{t('notif.empty')}</div>
          ) : (
            <ul className="notif-list">
              {vm.items.map((n) => (
                <li key={n.id} className="notif-item">
                  <div className="between" style={{ gap: 8 }}>
                    <span className="notif-kind">{n.title}</span>
                    <span className="notif-date muted">{formatDate(n.date)}</span>
                  </div>
                  {n.detail && <div className="notif-msg truncate">{n.detail}</div>}
                  <div className="center-row" style={{ gap: 8, marginTop: 6 }}>
                    <span className="notif-pill" style={{ background: TONE_COLOR[n.tone] }}>{n.toneLabel}</span>
                    {n.exp && <span className="notif-exp muted">{n.exp}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
