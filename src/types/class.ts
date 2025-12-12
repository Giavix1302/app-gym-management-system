export type ClassType = 'yoga' | 'dance' | 'boxing' | 'gym';

export interface ClassRecurrence {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: {
    hour: number;
    minute: number;
  };
  endTime: {
    hour: number;
    minute: number;
  };
  roomName?: string;
  roomId?: string;
}

export interface ClassSession {
  _id: string;
  title: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  room: string;
}

export interface Trainer {
  _id: string;
  name: string;
  avatar: string;
  phone: string;
  specialization: string;
  rating: number;
}

export interface Address {
  street: string;
  ward: string;
  province: string;
}

export interface Class {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  enrolled: number;
  trainers: Trainer[];
  classType: ClassType;
  price: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  image: string;
  locationName: string;
  address: Address;
  recurrence: ClassRecurrence[];
  classSession: ClassSession[];
}

export interface EnrolledClass extends Class {
  enrolledAt: string; // ISO date string
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  classEnrollmentId: string;
}

export interface ClassEnrollmentPaymentInput {
  userId: string;
  classId: string;
  title: string;
  price: number;
}

export interface ClassEnrollmentPaymentResponse {
  success: boolean;
  paymentUrl: string;
}

export interface CancelEnrollmentResponse {
  success: boolean;
  message: string;
}

// ==================== PT Class Management Types ====================

export interface PTClassTrainer {
  _id: string;
  fullName: string;
  avatar: string;
  phone: string;
  specialization: string;
  rating: number;
}

export interface PTClassRecurrence {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: {
    hour: number;
    minute: number;
  };
  endTime: {
    hour: number;
    minute: number;
  };
  roomId: string;
}

export interface PTClassLocationInfo {
  _id: string;
  name: string;
  address: {
    street: string;
    ward: string;
    province: string;
  };
}

export interface PTClassSession {
  _id: string;
  className: string;
  hours: number;
  startTime: string; // ISO UTC string
  endTime: string; // ISO UTC string
  roomName: string;
  title: string;
}

export interface PTClassEnrolled {
  userId: string;
  fullName: string;
  phone: string;
  avatar: string;
}

export interface PTClass {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  trainers: PTClassTrainer[];
  classType: string;
  price: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  recurrence: PTClassRecurrence[];
  locationInfo: PTClassLocationInfo;
  classSession: PTClassSession[];
  classEnrolled: PTClassEnrolled[];
  image: string;
}

export interface PTClassListResponse {
  success: boolean;
  message: string;
  classes: PTClass[];
}

// For calendar display
export interface ClassSessionEvent {
  _id: string;
  classId: string;
  className: string;
  startTime: string;
  endTime: string;
  roomName: string;
  title: string;
  classType: string;
  image?: string;
}
