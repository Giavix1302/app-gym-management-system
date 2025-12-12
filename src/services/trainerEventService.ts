import axiosInstance from '../config/axios';
import { PTEventsResponse, EventQueryParams } from '../types/api';

export const trainerEventService = {
  /**
   * Get trainer events (bookings and classes) with filtering
   * @param trainerId - Trainer ID (userId of trainer)
   * @param params - Query parameters (viewType, date, week, month, year)
   * @returns PTEventsResponse
   */
  getTrainerEvents: async (
    trainerId: string,
    params: EventQueryParams
  ): Promise<PTEventsResponse> => {
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('viewType', params.viewType);

    if (params.date) queryParams.append('date', params.date);
    if (params.week) queryParams.append('week', String(params.week));
    if (params.year) queryParams.append('year', String(params.year));
    if (params.month) queryParams.append('month', String(params.month));

    const response = await axiosInstance.get<PTEventsResponse>(
      `/trainers/${trainerId}/events?${queryParams.toString()}`
    );

    return response.data;
  },
};
