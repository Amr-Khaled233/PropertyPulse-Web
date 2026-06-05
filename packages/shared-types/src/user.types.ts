// User and account types.

export type UserRole = 'investor' | 'consultant' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  propertyId: string;
  notes?: string;
  notifyOnChange: boolean;
  createdAt: string;
}
