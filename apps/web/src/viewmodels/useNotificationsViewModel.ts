// ViewModel: Notifications — admin status updates on the user's inquiries.
// Mirrors the mobile app: unseen = inquiries whose status moved off 'new' and
// changed since the user last viewed them. "Seen" state is local; the inquiries
// themselves come from the server (source of truth).

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Inquiry } from '@propertypulse/shared-types';
import { inquiryService } from '../services/api/inquiryService';
import { useAuthStore } from '../store/authStore';

const SEEN_KEY = 'notif_seen';

type SeenMap = Record<string, string>;

function loadSeen(): SeenMap {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as SeenMap;
  } catch {
    return {};
  }
}
function saveSeen(map: SeenMap): void {
  localStorage.setItem(SEEN_KEY, JSON.stringify(map));
}

export function countUnseen(list: Inquiry[], seen: SeenMap): number {
  return list.filter((i) => i.status !== 'new' && seen[i.id] !== i.status).length;
}

export function useNotificationsViewModel() {
  const user = useAuthStore((s) => s.user);
  const [seen, setSeen] = useState<SeenMap>(loadSeen);

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => inquiryService.mine(),
    enabled: !!user,
    refetchInterval: 60_000, // poll for admin status updates
    refetchOnWindowFocus: true,
  });

  const list = query.data ?? [];
  const unseen = countUnseen(list, seen);

  // Mark all currently-loaded inquiries as seen (called when the panel opens).
  const markAllSeen = useCallback(() => {
    const next: SeenMap = { ...loadSeen() };
    for (const i of list) next[i.id] = i.status;
    saveSeen(next);
    setSeen(next);
  }, [list]);

  return { list, unseen, loading: query.isLoading, markAllSeen };
}
