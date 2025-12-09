import axiosInstance from '../config/axios';
import {
  Class,
  EnrolledClass,
  ClassEnrollmentPaymentInput,
  ClassEnrollmentPaymentResponse,
  CancelEnrollmentResponse,
} from '../types/class';

export const classService = {
  /**
   * Get list of all available classes for user
   * Returns: { success, message, classes[] }
   */
  getListClassForUser: async (): Promise<{ success: boolean; message: string; classes: Class[] }> => {
    try {
      const response = await axiosInstance.get('/classes/user');
      console.log('🚀 ~ getListClassForUser ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting class list:', error);
      throw error;
    }
  },

  /**
   * Get enrolled classes for a specific user
   * Returns: { success, message, classes[], total }
   */
  getMemberEnrolledClasses: async (
    userId: string
  ): Promise<{ success: boolean; message: string; classes: EnrolledClass[]; total: number }> => {
    try {
      const response = await axiosInstance.get(`/classes/user/${userId}`);
      console.log('🚀 ~ getMemberEnrolledClasses ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting enrolled classes:', error);
      throw error;
    }
  },

  /**
   * Create VNPay payment link for class enrollment
   * Input: { userId, classId, title, price }
   * Returns: { success, paymentUrl }
   */
  createLinkVnpayClassPayment: async (
    data: ClassEnrollmentPaymentInput
  ): Promise<ClassEnrollmentPaymentResponse> => {
    try {
      console.log('🚀 ~ createLinkVnpayClassPayment ~ data:', data);
      const response = await axiosInstance.post('/payments/vnpay/class', data);
      console.log('🚀 ~ createLinkVnpayClassPayment ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating class payment:', error);
      throw error;
    }
  },

  /**
   * Cancel a class enrollment
   * Returns: { success, message }
   */
  cancelClassEnrollment: async (enrollmentId: string): Promise<CancelEnrollmentResponse> => {
    try {
      const response = await axiosInstance.patch(`/class-enrollments/${enrollmentId}/cancel`);
      console.log('🚀 ~ cancelClassEnrollment ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      throw error;
    }
  },
};
