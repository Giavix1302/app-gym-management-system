// ==================== Membership Types ====================
export interface Membership {
  _id?: string;
  remainingSessions: number;
  startDate: string;
  endDate: string;
  status: string;
  name: string;
  durationMonth: number;
  bannerURL: string;
  totalCheckin: number;
}

// Membership Package từ API /memberships
export interface MembershipPackage {
  _id: string;
  name: string;
  durationMonth: number;
  price: number;
  discount: number;
  description: string;
  type: 'gym' | 'pt';
  features: string[];
  bannerURL: string;
  createdAt: number;
  updatedAt: number | null;
  _destroy: boolean;
  totalUsers: number;
}

export interface MembershipPackagesResponse {
  success: boolean;
  message: string;
  memberships: MembershipPackage[];
}

// ==================== User Types ====================
export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: 'user' | 'pt';
  isActived: boolean;
  gender: string;
  address: string;
  avatar: string;
  myMembership?: Membership;
  createdAt: string;
  updatedAt: string;
}

// ==================== Trainer Types ====================
export interface Trainer {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: 'pt';
  isActived: boolean;
  gender: string;
  address: string;
  avatar: string;
  height: number;
  weight: number;
  achievements: string;
  experience: number;
  certification: string;
  specialty: string;
  myMembership?: Membership;
  createdAt: string;
  updatedAt: string;
}

// ==================== Login Types ====================
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  trainer?: Trainer;
  myMembership?: Membership;
  accessToken: string;
  refreshToken: string;
}

// ==================== Default Empty Membership ====================
export const EMPTY_MEMBERSHIP: Membership = {
  _id: '',
  remainingSessions: 0,
  startDate: '',
  endDate: '',
  status: '',
  name: '',
  durationMonth: 0,
  bannerURL: '',
  totalCheckin: 0,
};

// ==================== Location Types ====================
export interface Address {
  street: string;
  ward: string;
  province: string;
}

export interface Location {
  _id: string;
  name: string;
  phone: string;
  address: Address;
  images: string[];
}

export interface LocationsResponse {
  success: boolean;
  message: string;
  locations: Location[];
}

// ==================== Notification Types ====================
export type NotificationType =
  | 'USER_UPCOMING_BOOKING'
  | 'USER_BOOKING_CONFIRMED'
  | 'USER_BOOKING_CANCELLED'
  | 'USER_CLASS_REMINDER'
  | 'PT_NEW_BOOKING'
  | 'PT_BOOKING_CANCELLED'
  | 'MEMBERSHIP_EXPIRING'
  | 'MEMBERSHIP_EXPIRED';

export type ReferenceType = 'BOOKING' | 'CLASS' | 'MEMBERSHIP' | 'SYSTEM';

export interface Notification {
  _id: string;
  userId: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  scheduledAt?: string;
  sentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  count: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
  modifiedCount: number;
}
