// API calls for the watchlist (saved properties + alerts).

import type { WatchlistItem } from '@propertypulse/shared-types';
import type { WatchlistEntry } from '../../types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { propertyService } from './propertyService';
import { MOCK_PROPERTIES, MOCK_WATCHLIST } from '../mock/mockData';

// Mutable in-memory copy so add/remove feel real in mock mode for the session.
let mockItems: WatchlistItem[] = [...MOCK_WATCHLIST];

function join(items: WatchlistItem[]): WatchlistEntry[] {
  return items.map((item) => ({
    ...item,
    property: MOCK_PROPERTIES.find((p) => p.id === item.propertyId),
  }));
}

export const watchlistService = {
  async list(): Promise<WatchlistEntry[]> {
    if (IS_MOCK) return mockDelay(join(mockItems));
    const { data } = await apiClient.get<WatchlistItem[]>('/watchlist');
    // Real mode: hydrate each saved item with its actual property from the DB.
    return Promise.all(
      data.map(async (item) => ({
        ...item,
        property: await propertyService.getById(item.propertyId).catch(() => undefined),
      })),
    );
  },

  async add(propertyId: string, notes?: string): Promise<WatchlistItem> {
    if (IS_MOCK) {
      const item: WatchlistItem = {
        id: `w-${Date.now()}`,
        userId: 'user-1',
        propertyId,
        notes,
        notifyOnChange: true,
        createdAt: new Date().toISOString(),
      };
      mockItems = [item, ...mockItems.filter((i) => i.propertyId !== propertyId)];
      return mockDelay(item);
    }
    const { data } = await apiClient.post<WatchlistItem>('/watchlist', { propertyId, notes });
    return data;
  },

  async remove(id: string): Promise<void> {
    if (IS_MOCK) {
      mockItems = mockItems.filter((i) => i.id !== id && i.propertyId !== id);
      await mockDelay(null);
      return;
    }
    await apiClient.delete<null>(`/watchlist/${id}`);
  },

  async alerts(): Promise<{ propertyId: string; message: string }[]> {
    if (IS_MOCK) {
      return mockDelay([
        { propertyId: 'prop-2', message: 'Price dropped 3% — improved entry yield.' },
        { propertyId: 'prop-4', message: 'Tenant demand surged in this corridor this quarter.' },
      ]);
    }
    const { data } = await apiClient.get<{ propertyId: string; message: string }[]>('/watchlist/alerts');
    return data;
  },
};
