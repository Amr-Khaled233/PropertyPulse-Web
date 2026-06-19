// ViewModel: admin console — property management (CRUD/moderation) + CRM.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminService, type PropertyDraft } from '../services/api/adminService';
import { propertyService } from '../services/api/propertyService';
import { useUiStore } from '../store/uiStore';
import { toErrorMessage } from '../services/api/apiClient';
import type { Property, InquiryStatus, ListingStatus, PlanTier, UserProfile } from '@propertypulse/shared-types';

const PAGE_SIZE = 10;

export function useAdminViewModel() {
  const qc = useQueryClient();
  const pushToast = useUiStore((s) => s.pushToast);
  const [page, setPage] = useState(1);

  const props = useQuery({
    queryKey: ['admin', 'properties', page],
    queryFn: () => propertyService.search({ page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: () => adminService.listUsers() });
  const inquiries = useQuery({ queryKey: ['admin', 'inquiries'], queryFn: () => adminService.listInquiries() });

  function invalidateProps() {
    qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
  }

  const createMut = useMutation({
    mutationFn: (draft: PropertyDraft) => adminService.createProperty(draft),
    onSuccess: () => { invalidateProps(); pushToast('Property added.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Property> }) =>
      adminService.updateProperty(id, patch),
    onSuccess: () => { invalidateProps(); pushToast('Property updated.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteProperty(id),
    onSuccess: () => { invalidateProps(); pushToast('Property deleted.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  const inquiryMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      adminService.setInquiryStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] }),
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  const inquiryDeleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteInquiry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] }); pushToast('Inquiry deleted — the user was notified.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  function invalidateUsers() {
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
  }

  const userUpdateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { plan?: PlanTier; role?: UserProfile['role'] } }) =>
      adminService.updateUser(id, patch),
    onSuccess: () => { invalidateUsers(); pushToast('User updated.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  const userDeleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => { invalidateUsers(); pushToast('User deleted.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  return {
    // property table
    page,
    setPage,
    pageSize: PAGE_SIZE,
    properties: props.data?.items ?? [],
    total: props.data?.total ?? 0,
    loadingProps: props.isLoading,

    // collections
    users: users.data ?? [],
    inquiries: inquiries.data ?? [],
    loadingInquiries: inquiries.isLoading,

    // actions
    createProperty: (draft: PropertyDraft) => createMut.mutateAsync(draft),
    updateProperty: (id: string, patch: Partial<Property>) => updateMut.mutateAsync({ id, patch }),
    deleteProperty: (id: string) => deleteMut.mutate(id),
    toggleFeatured: (p: Property) => updateMut.mutate({ id: p.id, patch: { featured: !p.featured } }),
    setStatus: (p: Property, status: ListingStatus) => updateMut.mutate({ id: p.id, patch: { status } }),
    setApproved: (p: Property, approved: boolean) => updateMut.mutate({ id: p.id, patch: { approved } }),
    setInquiryStatus: (id: string, status: InquiryStatus) => inquiryMut.mutate({ id, status }),
    deleteInquiry: (id: string) => inquiryDeleteMut.mutate(id),
    setUserPlan: (id: string, plan: PlanTier) => userUpdateMut.mutate({ id, patch: { plan } }),
    deleteUser: (id: string) => userDeleteMut.mutate(id),
    saving: createMut.isPending || updateMut.isPending,
  };
}
