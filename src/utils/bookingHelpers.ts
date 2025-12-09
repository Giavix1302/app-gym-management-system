import { addHours, parseISO, isAfter, isSameDay, differenceInHours } from 'date-fns';
import { Slot, GroupedBooking, CancelInfo, HistoryBooking } from '../types/booking';
import { convertUTCToVietnam, formatTime } from './dateTime';

/**
 * Filter available slots for a selected date
 * Returns slots that:
 * - Start at least 5 hours from now
 * - Are on the selected date
 */
export const filterAvailableSlots = (slots: Slot[], selectedDate: Date): Slot[] => {
  const now = new Date();
  const minTime = addHours(now, 5); // Current time + 5 hours

  return slots.filter((slot) => {
    // Parse slot start time (UTC from API)
    const slotStartUTC = parseISO(slot.startTime);
    const slotStartVN = convertUTCToVietnam(slot.startTime);

    // Check if slot is on selected date (using Vietnam time)
    const isSameDateCheck = isSameDay(slotStartVN, selectedDate);

    // Check if slot is after minimum time
    const isAfterMinTime = isAfter(slotStartUTC, minTime);

    return isSameDateCheck && isAfterMinTime;
  });
};

/**
 * Group bookings by trainer
 */
export const groupBookingsByTrainer = (bookings: GroupedBooking[]): GroupedBooking[] => {
  // API already returns grouped bookings, just return as is
  return bookings;
};

/**
 * Group history bookings by trainer
 */
export const groupHistoryBookingsByTrainer = (
  bookings: HistoryBooking[]
): { trainer: any; bookings: HistoryBooking[] }[] => {
  const grouped = new Map<string, { trainer: any; bookings: HistoryBooking[] }>();

  bookings.forEach((booking) => {
    const trainerId = booking.trainer.trainerId;

    if (!grouped.has(trainerId)) {
      grouped.set(trainerId, {
        trainer: booking.trainer,
        bookings: [],
      });
    }

    grouped.get(trainerId)!.bookings.push(booking);
  });

  return Array.from(grouped.values());
};

/**
 * Calculate cancellation info (refund eligibility)
 */
export const calculateCancelInfo = (sessionStartTime: string): CancelInfo => {
  const now = new Date();
  const startTime = parseISO(sessionStartTime);
  const hoursUntil = differenceInHours(startTime, now);

  if (hoursUntil < 0) {
    // Session already passed
    return {
      canCancel: false,
      hasRefund: false,
      refundPercentage: 0,
      hoursUntilSession: hoursUntil,
      warningMessage: 'Buổi tập đã qua, không thể hủy',
    };
  }

  if (hoursUntil >= 24) {
    // >= 24 hours: 100% refund
    return {
      canCancel: true,
      hasRefund: true,
      refundPercentage: 100,
      hoursUntilSession: hoursUntil,
    };
  } else {
    // < 24 hours: No refund
    return {
      canCancel: true,
      hasRefund: false,
      refundPercentage: 0,
      hoursUntilSession: hoursUntil,
      warningMessage: 'Hủy lịch trong vòng 24 giờ sẽ không được hoàn tiền',
    };
  }
};

/**
 * Format slot time range
 * Example: "14:00 - 15:30"
 */
export const formatSlotTime = (startTime: string, endTime: string): string => {
  const startVN = convertUTCToVietnam(startTime);
  const endVN = convertUTCToVietnam(endTime);

  return `${formatTime(startVN)} - ${formatTime(endVN)}`;
};

/**
 * Format price in VND
 */
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
  return numPrice.toLocaleString('vi-VN') + ' đ';
};
