import axiosInstance from '../config/axios';
import { PTClassListResponse } from '../types/class';

export const ptClassService = {
  /**
   * Get list of classes for a trainer
   * @param trainerId - ID of the trainer
   */
  getListClassForTrainer: async (trainerId: string): Promise<PTClassListResponse> => {
    try {
      const response = await axiosInstance.get(`/classes/trainer/${trainerId}`);
      console.log('=€ ~ getListClassForTrainer ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting class list:', error);
      throw error;
    }
  },
};
