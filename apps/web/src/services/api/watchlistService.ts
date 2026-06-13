// API calls for the watchlist (saved properties + alerts).

import type { WatchlistItem } from '@propertypulse/shared-types';
import type { WatchlistEntry } from '../../types';
import { apiClient } from './apiClient';
import { propertyService } from './propertyService';

export const watchlistService = {
  async list(): Promise<WatchlistEntry[]> {
    const { data } = await apiClient.get<WatchlistItem[]>('/watchlist');
    // Hydrate each saved item with its actual property from the DB.
    return Promise.all(
      data.map(async (item) => ({
        ...item,
        property: await propertyService.getById(item.propertyId).catch(() => undefined),
      })),
    );
  },

  async add(propertyId: string, notes?: string): Promise<WatchlistItem> {
    const { data } = await apiClient.post<WatchlistItem>('/watchlist', { propertyId, notes });
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete<null>(`/watchlist/${id}`);
  },

  async alerts(): Promise<{ propertyId: string; message: string }[]> {
    const { data } = await apiClient.get<{ propertyId: string; message: string }[]>('/watchlist/alerts');
    return data;
  },
};
