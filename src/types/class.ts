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
