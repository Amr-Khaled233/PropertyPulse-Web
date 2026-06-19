// Admin API — property moderation/CRUD + CRM inquiries. Admin-only endpoints.

import type {
  Property,
  UserProfile,
  Inquiry,
  InquiryStatus,
  PlanTier,
} from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

export type PropertyDraft = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

export const adminService = {
  async listUsers(): Promise<UserProfile[]> {
    const { data } = await apiClient.get<UserProfile[]>('/admin/users');
    return data;
  },

  async updateUser(id: string, patch: { plan?: PlanTier; role?: UserProfile['role'] }): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>(`/admin/users/${id}`, patch);
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async createProperty(input: PropertyDraft): Promise<Property> {
    const { data } = await apiClient.post<Property>('/admin/properties', input);
    return data;
  },

  async updateProperty(id: string, patch: Partial<Property>): Promise<Property> {
    const { data } = await apiClient.put<Property>(`/admin/properties/${id}`, patch);
    return data;
  },

  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete(`/admin/properties/${id}`);
  },

  async listInquiries(): Promise<Inquiry[]> {
    const { data } = await apiClient.get<Inquiry[]>('/admin/inquiries');
    return data;
  },

  async setInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const { data } = await apiClient.put<Inquiry>(`/admin/inquiries/${id}/status`, { status });
    return data;
  },

  async deleteInquiry(id: string): Promise<void> {
    await apiClient.delete(`/admin/inquiries/${id}`);
  },
};
