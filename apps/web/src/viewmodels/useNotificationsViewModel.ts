// ViewModel: Notifications — role-aware.
//  • Investors see admin updates on their own inquiries (incl. a 'deleted' notice).
//  • Admins see new inquiries and newly registered users.
// "Seen" state is stored locally (per role); the data comes from the server.

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { InquiryKind, InquiryStatus } from '@propertypulse/shared-types';
import { inquiryService } from '../services/api/inquiryService';
import { adminService } from '../services/api/adminService';
import { useAuthStore } from '../store/authStore';
import { useI18n, type TranslationKey } from '../i18n';

export type NotifTone = InquiryStatus | 'info';

export interface NotifItem {
  id: string; // stable per source row
  sig: string; // changes when the item's state changes (re-notifies)
  countable: boolean; // whether it can contribute to the unseen badge
  title: string;
  detail?: string;
  date: string;
  tone: NotifTone;
  toneLabel: string;
  exp?: string;
}

type SeenMap = Record<string, string>;

function loadSeen(key: string): SeenMap {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as SeenMap;
  } catch {
    return {};
  }
}

const KIND_KEY: Record<InquiryKind, TranslationKey> = {
  buyer_inquiry: 'notif.kind.buyer_inquiry',
  viewing_request: 'notif.kind.viewing_request',
  contact_message: 'notif.kind.contact_message',
  application: 'notif.kind.application',
};

export function useNotificationsViewModel() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const seenKey = `notif_seen_${isAdmin ? 'admin' : 'investor'}`;
  const [seen, setSeen] = useState<SeenMap>(() => loadSeen(seenKey));

  const adminInq = useQuery({
    queryKey: ['notif', 'adminInquiries'],
    queryFn: () => adminService.listInquiries(),
    enabled: !!user && isAdmin,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const adminUsers = useQuery({
    queryKey: ['notif', 'adminUsers'],
    queryFn: () => adminService.listUsers(),
    enabled: !!user && isAdmin,
    refetchInterval: 60_000,
  });
  const mine = useQuery({
    queryKey: ['notif', 'mine', user?.id],
    queryFn: () => inquiryService.mine(),
    enabled: !!user && !isAdmin,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const items: NotifItem[] = useMemo(() => {
    if (isAdmin) {
      const inq: NotifItem[] = (adminInq.data ?? []).map((q) => ({
        id: `inq_${q.id}`,
        sig: 'exists',
        countable: true,
        title: t('notif.adm.newInquiry'),
        detail: `${q.name} · ${t(KIND_KEY[q.kind])}${q.message ? ` — ${q.message}` : ''}`,
        date: q.createdAt,
        tone: 'new',
        toneLabel: t('notif.adm.inquiryTag'),
      }));
      const usr: NotifItem[] = (adminUsers.data ?? []).map((u) => ({
        id: `usr_${u.id}`,
        sig: 'exists',
        countable: true,
        title: t('notif.adm.newUser'),
        detail: u.fullName || u.email,
        date: u.createdAt,
        tone: 'info',
        toneLabel: t('notif.adm.userTag'),
      }));
      return [...inq, ...usr].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40);
    }

    return (mine.data ?? []).map((q) => ({
      id: q.id,
      sig: q.status, // a status change (incl. 'deleted') re-notifies
      countable: q.status !== 'new', // the user's own fresh submission isn't a notification
      title: t(KIND_KEY[q.kind]),
      detail: q.message ?? undefined,
      date: q.createdAt,
      tone: q.status,
      toneLabel: t(`notif.status.${q.status}` as TranslationKey),
      exp: t(`notif.exp.${q.status}` as TranslationKey),
    }));
  }, [isAdmin, adminInq.data, adminUsers.data, mine.data, t]);

  const unseen = items.filter((i) => i.countable && seen[i.id] !== i.sig).length;

  const markAllSeen = useCallback(() => {
    const next: SeenMap = { ...loadSeen(seenKey) };
    for (const i of items) next[i.id] = i.sig;
    localStorage.setItem(seenKey, JSON.stringify(next));
    setSeen(next);
  }, [items, seenKey]);

  return { items, unseen, loading: adminInq.isLoading || mine.isLoading, markAllSeen };
}
