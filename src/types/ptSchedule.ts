// PT Schedule Types

export interface TrainerAdvice {
  title: string;
  content: string[];
}

export interface PTScheduleBookingInfo {
  bookingId?: string;
  userInfo: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  };
  locationName?: string;
  address: {
    street?: string;
    ward?: string;
    province?: string;
  };
  status?: 'booking' | 'completed' | 'cancelled';
  note?: string;
  price?: number;
  title?: string;
  trainerAdvice?: TrainerAdvice[];
  review: {
    rating: number | null;
    comment: string;
  };
}

export interface PTSchedule {
  _id: string;
  startTime: string; // ISO UTC string
  endTime: string; // ISO UTC string
  title?: string;
  booking: PTScheduleBookingInfo;
}

export interface PTScheduleListResponse {
  success: boolean;
  message: string;
  trainerId: string;
  listSchedule: PTSchedule[];
}

export interface CreateScheduleInput {
  trainerId: string;
  startTime: string; // ISO UTC string
  endTime: string; // ISO UTC string
}

export interface CreateScheduleResponse {
  success: boolean;
  message: string;
  newSchedule: {
    _id: string;
    trainerId: string;
    startTime: string;
    endTime: string;
    createdAt: number;
    updatedAt: number | null;
    _destroy: boolean;
  };
  listSchedule: PTSchedule[];
}

export interface DeleteScheduleResponse {
  success: boolean;
  message: string;
  result: number;
}

export interface UpdateTrainerAdviceInput {
  title: string;
  content: string[];
}

export interface UpdateTrainerAdviceResponse {
  success: boolean;
  message: string;
  booking: {
    _id: string;
    userId: string;
    scheduleId: string;
    locationId: string;
    title: string;
    status: string;
    price: number;
    note: string;
    trainerAdvice: TrainerAdvice[];
  };
}

// Helper type to categorize schedules
export type ScheduleCategory = 'upcoming' | 'empty' | 'history';
