// Public inquiry submission (contact / viewing request from a property page).

import type { Inquiry, InquiryKind } from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

export interface InquiryDraft {
  kind: InquiryKind;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string;
}

export const inquiryService = {
  async create(draft: InquiryDraft): Promise<Inquiry> {
    const { data } = await apiClient.post<Inquiry>('/inquiries', draft);
    return data;
  },

  /** The signed-in user's own inquiries (for Notifications). */
  async mine(): Promise<Inquiry[]> {
    const { data } = await apiClient.get<Inquiry[]>('/inquiries/my');
    return data;
  },
};
