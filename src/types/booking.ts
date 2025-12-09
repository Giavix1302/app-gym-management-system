// Booking-related TypeScript types

export interface Slot {
  _id: string;
  startTime: string; // ISO UTC string
  endTime: string; // ISO UTC string
}

export interface TrainerInfo {
  _id: string;
  userInfo: {
    fullName: string;
    avatar: string;
    email: string;
    phone: string;
  };
  trainerInfo: {
    specialization: string;
    bio: string;
    experience: string;
    education: string;
    pricePerHour: string | number;
    physiqueImages: string[];
  };
  schedule: Slot[];
  review: {
    rating: number;
    totalBookings: number;
  };
}

export interface TrainerWithSlots extends TrainerInfo {
  availableSlots: Slot[];
}

export interface BookingSession {
  bookingId: string;
  startTime: string;
  endTime: string;
  location: {
    _id: string;
    name: string;
    address: {
      street: string;
      ward: string;
      province: string;
    };
  };
  status: 'pending' | 'booking' | 'completed' | 'cancelled';
  price: number;
  note: string;
}

export interface TrainerSummary {
  trainerId: string;
  userInfo: {
    fullName: string;
    avatar: string;
    email: string;
  };
  specialization: string;
  rating: number;
  pricePerHour?: number;
}

export interface GroupedBooking {
  trainer: TrainerSummary;
  allSessions: BookingSession[];
}

export interface HistoryBooking {
  _id: string;
  price: number;
  note: string;
  trainerAdvice: any[];
  trainer: TrainerSummary;
  bookingId: string;
  status: 'completed' | 'cancelled';
  session: {
    startTime: string;
    endTime: string;
    location: {
      name: string;
      address: {
        street: string;
        ward: string;
        province: string;
      };
    };
  };
  review?: {
    rating: number;
    comment: string;
  };
}

export interface BookingPaymentInput {
  title: string;
  userId: string;
  scheduleId: string;
  locationId: string;
  price: number;
  note?: string;
}

export interface BookingPaymentResponse {
  success: boolean;
  paymentUrl: string;
  paymentId: string;
  bookingIds: string[];
  expiresAt: string;
}

export interface ReviewInput {
  bookingId: string;
  userId: string;
  trainerId: string;
  rating: number; // 1-5
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review: {
    _id: string;
    bookingId: string;
    userId: string;
    trainerId: string;
    rating: number;
    comment: string;
  };
}

export interface CancelInfo {
  canCancel: boolean;
  hasRefund: boolean;
  refundPercentage: number;
  hoursUntilSession: number;
  warningMessage?: string;
}
