// Public inquiry submission (contact / viewing request from a property page).

import type { Inquiry, InquiryKind } from '@propertypulse/shared-types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';

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
    if (IS_MOCK) {
      return mockDelay({
        id: `inq-${Date.now()}`,
        status: 'new',
        createdAt: new Date().toISOString(),
        ...draft,
      } as Inquiry);
    }
    const { data } = await apiClient.post<Inquiry>('/inquiries', draft);
    return data;
  },
};
