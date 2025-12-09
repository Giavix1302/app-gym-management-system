import {
  format,
  parseISO,
  addHours,
  getWeek,
  getYear,
  getMonth,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday as dateFnsIsToday,
  isSameMonth,
  addWeeks,
  addMonths,
  setWeek,
  setYear,
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Vietnam timezone offset (UTC+7)
const VIETNAM_OFFSET_HOURS = 7;

/**
 * Convert UTC date string to Vietnam timezone
 * @param utcDateString - ISO 8601 UTC date string
 * @returns Date object in Vietnam timezone
 */
export const convertUTCToVietnam = (utcDateString: string): Date => {
  // const utcDate = parseISO(utcDateString);
  // return addHours(utcDate, VIETNAM_OFFSET_HOURS);
  return new Date(utcDateString);
};

/**
 * Format time to HH:mm
 * @param date - Date object
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

/**
 * Format date to DD/MM
 * @param date - Date object
 * @returns Formatted date string
 */
export const formatShortDate = (date: Date): string => {
  return format(date, 'dd/MM');
};

/**
 * Format full date with day name
 * @param date - Date object
 * @returns Formatted string like "Thứ 2, 08/12"
 */
export const formatFullDate = (date: Date): string => {
  const dayOfWeek = date.getDay();
  let dayName = '';

  switch (dayOfWeek) {
    case 0:
      dayName = 'CN';
      break;
    case 1:
      dayName = 'Th 2';
      break;
    case 2:
      dayName = 'Th 3';
      break;
    case 3:
      dayName = 'Th 4';
      break;
    case 4:
      dayName = 'Th 5';
      break;
    case 5:
      dayName = 'Th 6';
      break;
    case 6:
      dayName = 'Th 7';
      break;
  }

  return `${dayName}, ${formatShortDate(date)}`;
};

/**
 * Get short day name (T2, T3, T4, T5, T6, T7, CN)
 * @param date - Date object
 * @returns Short day name
 */
export const getShortDayName = (date: Date): string => {
  const dayOfWeek = date.getDay();

  switch (dayOfWeek) {
    case 0:
      return 'CN';
    case 1:
      return 'T2';
    case 2:
      return 'T3';
    case 3:
      return 'T4';
    case 4:
      return 'T5';
    case 5:
      return 'T6';
    case 6:
      return 'T7';
    default:
      return '';
  }
};

/**
 * Get ISO week number
 * @param date - Date object
 * @returns Week number
 */
export const getISOWeek = (date: Date): number => {
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
};

/**
 * Get current week number
 */
export const getCurrentWeek = (): number => {
  return getISOWeek(new Date());
};

/**
 * Get current month (1-12)
 */
export const getCurrentMonth = (): number => {
  return getMonth(new Date()) + 1;
};

/**
 * Get current year
 */
export const getCurrentYear = (): number => {
  return getYear(new Date());
};

/**
 * Get days in a week for calendar view
 * @param year - Year
 * @param week - ISO week number
 * @returns Array of 7 dates
 */
export const getDaysInWeek = (year: number, week: number): Date[] => {
  // Create a date at the start of the year
  const yearStart = new Date(year, 0, 1);

  // Set the week number
  const targetDate = setWeek(setYear(yearStart, year), week, {
    weekStartsOn: 1,
    firstWeekContainsDate: 4,
  });

  const start = startOfWeek(targetDate, { weekStartsOn: 1 });
  const end = endOfWeek(targetDate, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
};

/**
 * Get days in a month for calendar grid
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of dates (includes padding days from prev/next month)
 */
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(new Date(year, month - 1));

  // Get start of week for first day (to include padding)
  const calendarStart = startOfWeek(firstDay, { weekStartsOn: 1 });

  // Get end of week for last day (to include padding)
  const calendarEnd = endOfWeek(lastDay, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

/**
 * Format date to YYYY-MM-DD for API
 */
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Check if date is weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return dateFnsIsToday(date);
};

/**
 * Check if two dates are the same day
 */
export const isSameDayCheck = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

/**
 * Check if date is in the same month as the target month
 */
export const isInSameMonth = (date: Date, targetYear: number, targetMonth: number): boolean => {
  const targetDate = new Date(targetYear, targetMonth - 1);
  return isSameMonth(date, targetDate);
};

/**
 * Get week options for dropdown (1-52)
 */
export const getWeekOptions = (): number[] => {
  return Array.from({ length: 52 }, (_, i) => i + 1);
};

/**
 * Get year options for dropdown (current year ± 1)
 */
export const getYearOptions = (): number[] => {
  const currentYear = getYear(new Date());
  return [currentYear - 1, currentYear, currentYear + 1];
};

/**
 * Get month options for dropdown (1-12)
 */
export const getMonthOptions = (): Array<{ value: number; label: string }> => {
  return [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];
};

/**
 * Get month name from number
 */
export const getMonthName = (month: number): string => {
  const options = getMonthOptions();
  const option = options.find((opt) => opt.value === month);
  return option ? option.label : '';
};
