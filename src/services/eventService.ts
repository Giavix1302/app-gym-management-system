import axiosInstance from '../config/axios';
import { EventsResponse, EventQueryParams } from '../types/api';

export const eventService = {
  /**
   * Get user events for three months with filtering
   * @param userId - User ID
   * @param params - Query parameters (viewType, date, week, month, year)
   * @returns EventsResponse
   */
  getUserEvents: async (
    userId: string,
    params: EventQueryParams
  ): Promise<EventsResponse> => {
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('viewType', params.viewType);

    if (params.date) queryParams.append('date', params.date);
    if (params.week) queryParams.append('week', String(params.week));
    if (params.year) queryParams.append('year', String(params.year));
    if (params.month) queryParams.append('month', String(params.month));

    const response = await axiosInstance.get<EventsResponse>(
      `/users/${userId}/events/three-months?${queryParams.toString()}`
    );

    return response.data;
  },
};
