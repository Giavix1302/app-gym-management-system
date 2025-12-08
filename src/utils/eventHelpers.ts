import { ScheduleEvent } from '../types/api';
import { convertUTCToVietnam, formatTime, isSameDayCheck } from './dateTime';

/**
 * Group events by date
 * @param events - Array of schedule events
 * @returns Object with date strings as keys and arrays of events as values
 */
export const groupEventsByDate = (
  events: ScheduleEvent[]
): Record<string, ScheduleEvent[]> => {
  const grouped: Record<string, ScheduleEvent[]> = {};

  events.forEach((event) => {
    const eventDate = convertUTCToVietnam(event.startTime);
    const dateKey = eventDate.toDateString();

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  // Sort events within each date by start time
  Object.keys(grouped).forEach((dateKey) => {
    grouped[dateKey].sort((a, b) => {
      const timeA = convertUTCToVietnam(a.startTime).getTime();
      const timeB = convertUTCToVietnam(b.startTime).getTime();
      return timeA - timeB;
    });
  });

  return grouped;
};

/**
 * Format event time range
 * @param event - Schedule event
 * @returns Time range string like "14:00 - 15:30"
 */
export const formatEventTimeRange = (event: ScheduleEvent): string => {
  const startTime = convertUTCToVietnam(event.startTime);
  const endTime = convertUTCToVietnam(event.endTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Get trainer names as string
 * @param event - Schedule event
 * @returns Trainer name(s)
 */
export const getTrainerNames = (event: ScheduleEvent): string => {
  if (Array.isArray(event.trainerName)) {
    return event.trainerName.join(', ');
  }
  return event.trainerName;
};

/**
 * Get location info (room + location)
 * @param event - Schedule event
 * @returns Location string
 */
export const getEventLocation = (event: ScheduleEvent): string => {
  if (event.roomName) {
    return `${event.roomName} - ${event.locationName}`;
  }
  return event.locationName;
};

/**
 * Check if date has events
 * @param date - Date to check
 * @param events - Array of schedule events
 * @returns True if date has events
 */
export const dateHasEvents = (date: Date, events: ScheduleEvent[]): boolean => {
  return events.some((event) => {
    const eventDate = convertUTCToVietnam(event.startTime);
    return isSameDayCheck(date, eventDate);
  });
};

/**
 * Get event color based on event type
 * @param eventType - Event type
 * @returns Color hex code
 */
export const getEventColor = (eventType: 'booking' | 'classSession'): string => {
  return eventType === 'booking' ? '#3B82F6' : '#EAB308'; // Blue for booking, Yellow for class
};
