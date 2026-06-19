// Admin repository — user listing + CRM inquiries access (service-role).

import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/apiError.js';
import { toUserProfile, type ProfileRow } from '../models/user.model.js';
import type { UserProfile, Inquiry, InquiryStatus } from '@propertypulse/shared-types';

interface InquiryRow {
  id: string;
  kind: Inquiry['kind'];
  status: InquiryStatus;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  property_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

function toInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    kind: row.kind,
    // A soft-deleted inquiry surfaces to its owner as a 'deleted' notification.
    status: row.deleted_at ? 'deleted' : row.status,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    propertyId: row.property_id ?? undefined,
    createdAt: row.created_at,
  };
}

export const adminRepository = {
  async listUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'USERS_FETCH_FAILED', error.message);
    return (data as ProfileRow[]).map(toUserProfile);
  },

  async listInquiries(): Promise<Inquiry[]> {
    let { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .is('deleted_at', null) // hide soft-deleted inquiries from the CRM
      .order('created_at', { ascending: false });
    // Fall back gracefully if the deleted_at column hasn't been migrated yet.
    if (error && /deleted_at/i.test(error.message)) {
      ({ data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false }));
    }
    if (error) throw new ApiError(500, 'INQUIRIES_FETCH_FAILED', error.message);
    return (data as InquiryRow[]).map(toInquiry);
  },

  /** A specific user's inquiries, matched by the email they submitted with. */
  async listInquiriesByEmail(email: string): Promise<Inquiry[]> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .ilike('email', email)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'INQUIRIES_FETCH_FAILED', error.message);
    return (data as InquiryRow[]).map(toInquiry);
  },

  async createInquiry(input: {
    kind: Inquiry['kind'];
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    propertyId?: string;
  }): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        kind: input.kind,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        message: input.message ?? null,
        property_id: input.propertyId ?? null,
      })
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'INQUIRY_CREATE_FAILED', error.message);
    return toInquiry(data as InquiryRow);
  },

  async setInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'INQUIRY_UPDATE_FAILED', error.message);
    return toInquiry(data as InquiryRow);
  },

  /** Soft-delete an inquiry (kept so the owner still gets a 'deleted' notice). */
  async deleteInquiry(id: string): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'INQUIRY_DELETE_FAILED', error.message);
    return toInquiry(data as InquiryRow);
  },

  /** Update a user's plan and/or role. */
  async updateUser(id: string, patch: { plan?: UserProfile['plan']; role?: UserProfile['role'] }): Promise<UserProfile> {
    const update: Record<string, unknown> = {};
    if (patch.plan !== undefined) update.plan = patch.plan;
    if (patch.role !== undefined) update.role = patch.role;
    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'USER_UPDATE_FAILED', error.message);
    return toUserProfile(data as ProfileRow);
  },

  /** Permanently delete a user (auth account + profile row). */
  async deleteUser(id: string): Promise<void> {
    const { error: authErr } = await supabase.auth.admin.deleteUser(id);
    if (authErr) throw new ApiError(500, 'USER_DELETE_FAILED', authErr.message);
    await supabase.from('profiles').delete().eq('id', id);
  },
};
