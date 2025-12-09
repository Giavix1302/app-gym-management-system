import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ClassRecurrence, ClassSession, ClassType } from '../types/class';
import { getShortDayName, formatTime, convertUTCToVietnam } from './dateTime';

/**
 * Get icon name for class type
 */
export const getClassTypeIcon = (classType: ClassType): string => {
  switch (classType) {
    case 'yoga':
      return 'fitness';
    case 'dance':
      return 'musical-notes';
    case 'boxing':
      return 'hand-left';
    case 'gym':
      return 'barbell';
    default:
      return 'school';
  }
};

/**
 * Get display label for class type
 */
export const getClassTypeLabel = (classType: ClassType): string => {
  switch (classType) {
    case 'yoga':
      return 'Yoga';
    case 'dance':
      return 'Dance';
    case 'boxing':
      return 'Boxing';
    case 'gym':
      return 'Gym';
    default:
      return classType;
  }
};

/**
 * Format recurrence schedule to readable string
 * Example: "T5 9:00-10:00, T7 13:00-14:00"
 */
export const formatRecurrenceSchedule = (recurrence: ClassRecurrence[]): string => {
  if (!recurrence || recurrence.length === 0) return '';

  return recurrence
    .map((rec) => {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = dayNames[rec.dayOfWeek];
      const startTime = `${rec.startTime.hour.toString().padStart(2, '0')}:${rec.startTime.minute.toString().padStart(2, '0')}`;
      const endTime = `${rec.endTime.hour.toString().padStart(2, '0')}:${rec.endTime.minute.toString().padStart(2, '0')}`;
      return `${dayName} ${startTime}-${endTime}`;
    })
    .join(', ');
};

/**
 * Format class duration
 * Example: "01/12/2025 - 31/12/2025"
 */
export const formatClassDuration = (startDate: string, endDate: string): string => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
};

/**
 * Sort class sessions by start time (ascending)
 */
export const sortClassSessions = (sessions: ClassSession[]): ClassSession[] => {
  return [...sessions].sort((a, b) => {
    const dateA = parseISO(a.startTime);
    const dateB = parseISO(b.startTime);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Check if class has started
 */
export const isClassStarted = (startDate: string): boolean => {
  const now = new Date();
  const start = parseISO(startDate);
  return isBefore(start, now);
};

/**
 * Check if class has ended
 */
export const isClassEnded = (endDate: string): boolean => {
  const now = new Date();
  const end = parseISO(endDate);
  return isBefore(end, now);
};

/**
 * Check if enrollment can be cancelled (before class starts)
 */
export const canCancelEnrollment = (startDate: string): boolean => {
  const now = new Date();
  const start = parseISO(startDate);
  return isAfter(start, now);
};

/**
 * Calculate refund amount
 * Returns 100% if cancelled before start date, 0% otherwise
 */
export const calculateRefundAmount = (startDate: string, price: number): number => {
  if (canCancelEnrollment(startDate)) {
    return price;
  }
  return 0;
};

/**
 * Get cancel info with refund details
 */
export const getCancelInfo = (
  startDate: string,
  price: number
): {
  canCancel: boolean;
  refundAmount: number;
  message: string;
} => {
  const canCancel = canCancelEnrollment(startDate);
  const refundAmount = calculateRefundAmount(startDate, price);

  let message = '';
  if (canCancel) {
    message = `Bạn sẽ được hoàn 100% học phí (${formatPrice(refundAmount)})`;
  } else {
    message = 'Lớp học đã bắt đầu, bạn sẽ không được hoàn tiền';
  }

  return {
    canCancel,
    refundAmount,
    message,
  };
};

/**
 * Format price in VND
 */
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
  return numPrice.toLocaleString('vi-VN') + ' đ';
};

/**
 * Format session time range
 * Example: "14:00 - 15:30"
 */
export const formatSessionTime = (startTime: string, endTime: string): string => {
  const startVN = convertUTCToVietnam(startTime);
  const endVN = convertUTCToVietnam(endTime);
  return `${formatTime(startVN)} - ${formatTime(endVN)}`;
};

/**
 * Format session date
 * Example: "Thứ 5, 12/12/2025"
 */
export const formatSessionDate = (startTime: string): string => {
  const date = convertUTCToVietnam(startTime);
  return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
};

/**
 * Check if session is in the past
 */
export const isSessionPast = (endTime: string): boolean => {
  const now = new Date();
  const end = parseISO(endTime);
  return isBefore(end, now);
};

/**
 * Separate enrolled classes into active and history
 */
export const separateEnrolledClasses = <T extends { endDate: string }>(
  classes: T[]
): { active: T[]; history: T[] } => {
  const now = new Date();

  const active = classes.filter((cls) => {
    const end = parseISO(cls.endDate);
    return isAfter(end, now) || format(end, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  });

  const history = classes.filter((cls) => {
    const end = parseISO(cls.endDate);
    return isBefore(end, now) && format(end, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
  });

  return { active, history };
};
