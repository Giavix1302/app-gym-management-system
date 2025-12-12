import axiosInstance from '../config/axios';
import {
  PTScheduleListResponse,
  CreateScheduleInput,
  CreateScheduleResponse,
  DeleteScheduleResponse,
  UpdateTrainerAdviceInput,
  UpdateTrainerAdviceResponse,
} from '../types/ptSchedule';

export const ptScheduleService = {
  /**
   * Get list of schedules for a trainer
   * @param trainerId - ID of the trainer
   */
  getListScheduleByTrainerId: async (trainerId: string): Promise<PTScheduleListResponse> => {
    try {
      const response = await axiosInstance.get(`/schedules/${trainerId}`);
      console.log('🚀 ~ getListScheduleByTrainerId ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting schedule list:', error);
      throw error;
    }
  },

  /**
   * Create a new schedule slot for PT (empty slot for users to book)
   * @param data - Schedule data with trainerId, startTime, endTime
   */
  createScheduleForPT: async (data: CreateScheduleInput): Promise<CreateScheduleResponse> => {
    try {
      const response = await axiosInstance.post('/schedules', data);
      console.log('🚀 ~ createScheduleForPT ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Delete an empty schedule slot (only for empty slots)
   * @param scheduleId - ID of the schedule to delete
   */
  deleteScheduleForPT: async (scheduleId: string): Promise<DeleteScheduleResponse> => {
    try {
      const response = await axiosInstance.delete(`/schedules/${scheduleId}`);
      console.log('🚀 ~ deleteScheduleForPT ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  /**
   * Update trainer advice for a completed booking
   * @param bookingId - ID of the booking
   * @param advice - Trainer advice object with title and content
   */
  updateTrainerAdvice: async (
    bookingId: string,
    advice: UpdateTrainerAdviceInput
  ): Promise<UpdateTrainerAdviceResponse> => {
    try {
      console.log('🚀 ~ updateTrainerAdvice ~ bookingId, advice:', bookingId, advice);
      const response = await axiosInstance.patch(`/bookings/${bookingId}/trainer-advice`, advice);
      console.log('🚀 ~ updateTrainerAdvice ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating trainer advice:', error);
      throw error;
    }
  },
};
