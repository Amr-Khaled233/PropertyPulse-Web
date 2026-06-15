// Notifications bell — shows a red badge for unseen admin status updates on the
// user's inquiries, and a dropdown listing them. Matches the mobile app.

import { useEffect, useRef, useState } from 'react';
import type { Inquiry, InquiryKind, InquiryStatus } from '@propertypulse/shared-types';
import { useNotificationsViewModel } from '../../../viewmodels/useNotificationsViewModel';
import { useI18n } from '../../../i18n';
import { formatDate } from '../../../utils/formatters';

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: '#2563eb', // info / blue
  in_progress: '#D4850A', // amber
  closed: '#0B9972', // green
};

const KIND_KEY: Record<InquiryKind, 'notif.kind.buyer_inquiry' | 'notif.kind.viewing_request' | 'notif.kind.contact_message' | 'notif.kind.application'> = {
  buyer_inquiry: 'notif.kind.buyer_inquiry',
  viewing_request: 'notif.kind.viewing_request',
  contact_message: 'notif.kind.contact_message',
  application: 'notif.kind.application',
};

const STATUS_KEY: Record<InquiryStatus, 'notif.status.new' | 'notif.status.in_progress' | 'notif.status.closed'> = {
  new: 'notif.status.new',
  in_progress: 'notif.status.in_progress',
  closed: 'notif.status.closed',
};

const EXP_KEY: Record<InquiryStatus, 'notif.exp.new' | 'notif.exp.in_progress' | 'notif.exp.closed'> = {
  new: 'notif.exp.new',
  in_progress: 'notif.exp.in_progress',
  closed: 'notif.exp.closed',
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
          {vm.list.length === 0 ? (
            <div className="muted center" style={{ padding: '24px 12px' }}>{t('notif.empty')}</div>
          ) : (
            <ul className="notif-list">
              {vm.list.map((n: Inquiry) => (
                <li key={n.id} className="notif-item">
                  <div className="between" style={{ gap: 8 }}>
                    <span className="notif-kind">{t(KIND_KEY[n.kind])}</span>
                    <span className="notif-date muted">{formatDate(n.createdAt)}</span>
                  </div>
                  {n.message && <div className="notif-msg truncate">{n.message}</div>}
                  <div className="center-row" style={{ gap: 8, marginTop: 6 }}>
                    <span className="notif-pill" style={{ background: STATUS_COLOR[n.status] }}>{t(STATUS_KEY[n.status])}</span>
                    <span className="notif-exp muted">{t(EXP_KEY[n.status])}</span>
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
