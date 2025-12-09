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
};

// Backward compatibility export
export const getListTrainerForUserAPI = trainerService.getListTrainersForUser;
