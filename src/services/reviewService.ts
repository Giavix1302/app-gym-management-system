import axiosInstance from '../config/axios';
import { ReviewInput, ReviewResponse } from '../types/booking';

export const reviewService = {
  /**
   * Create review for a booking session
   */
  createReview: async (reviewData: ReviewInput): Promise<ReviewResponse> => {
    try {
      console.log('🚀 ~ createReview ~ reviewData:', reviewData);
      const response = await axiosInstance.post('/reviews', reviewData);
      console.log('🚀 ~ createReview ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
};

// Backward compatibility export
export const createReviewAPI = reviewService.createReview;
