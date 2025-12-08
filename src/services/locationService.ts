import { axiosPublic } from '../config/axios';
import { LocationsResponse } from '../types/api';

export const locationService = {
  /**
   * Get all locations
   * @returns LocationsResponse data
   */
  getLocations: async (): Promise<LocationsResponse> => {
    console.log('📍 Fetching locations...');

    const response = await axiosPublic.get<LocationsResponse>('/locations');

    console.log('✅ Locations fetched:', response.data.locations.length, 'items');

    return response.data;
  },
};
