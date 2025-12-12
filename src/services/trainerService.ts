import axiosInstance from '../config/axios';

export const trainerService = {
  /**
   * Get list of trainers with their schedules for user booking
   * Returns trainers with schedule array containing all slots
   */
  getListTrainersForUser: async () => {
    try {
      const response = await axiosInstance.get('/trainers/user');
      console.log('🚀 ~ getListTrainersForUser ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error;
    }
  },

  /**
   * Get revenue data for trainer (bookings and class sessions)
   * @param userId - Trainer ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  getTrainerRevenue: async (userId: string, page = 1, limit = 10) => {
    console.log('🚀 ~ userId:', userId);
    try {
      const response = await axiosInstance.get(`/trainers/${userId}/bookings`, {
        params: { page, limit },
      });
      console.log('🚀 ~ getTrainerRevenue ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainer revenue:', error);
      throw error;
    }
  },

  /**
   * Get trainer detail by userId
   * @param userId - User ID of the trainer
   * @returns Trainer detail data
   */
  getTrainerByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/trainers/user/${userId}`);
      console.log('🚀 ~ getTrainerByUserId ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainer by userId:', error);
      throw error;
    }
  },

  /**
   * Update trainer information
   * @param userId - User ID of the trainer
   * @param formData - FormData containing trainer fields and images
   * @returns Updated trainer data
   */
  updateTrainerInfo: async (userId: string, formData: FormData) => {
    console.log('🚀 ~ updateTrainerInfo ~ userId:', userId);

    // Log FormData for debugging
    console.log('🚀 ~ FormData entries:');
    // @ts-ignore - FormData might not have entries in React Native
    if (formData._parts) {
      // @ts-ignore
      const parts = formData._parts;
      console.log('FormData parts count:', parts.length);
      parts.forEach((part: any, index: number) => {
        console.log(`Part ${index}:`, {
          key: part[0],
          value: typeof part[1] === 'object' ? `[File: ${part[1].name}]` : part[1],
        });
      });
    }

    try {
      const response = await axiosInstance.put(`/trainers/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file upload
      });
      console.log('🚀 ~ updateTrainerInfo ~ response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error updating trainer info:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request error - no response received');
      }
      throw error;
    }
  },
};

// Backward compatibility export
export const getListTrainerForUserAPI = trainerService.getListTrainersForUser;
