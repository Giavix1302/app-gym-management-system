import axiosInstance from '../config/axios';
import { BookingPaymentInput, BookingPaymentResponse } from '../types/booking';

export const bookingService = {
  /**
   * Create VNPay payment link for booking
   * Input: Array of booking data
   * Returns: { paymentUrl, bookingIds }
   */
  createBookingPayment: async (bookings: BookingPaymentInput[]): Promise<BookingPaymentResponse> => {
    try {
      console.log('🚀 ~ createBookingPayment ~ bookings:', bookings);
      const response = await axiosInstance.post('/payments/vnpay/booking', bookings);
      console.log('🚀 ~ createBookingPayment ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating booking payment:', error);
      throw error;
    }
  },

  /**
   * Get upcoming bookings grouped by trainer
   */
  getUpcomingBookings: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/bookings/user/${userId}/upcoming`);
      console.log('🚀 ~ getUpcomingBookings ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  },

  /**
   * Get history bookings (completed/cancelled)
   */
  getHistoryBookings: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/bookings/user/${userId}/history`);
      console.log('🚀 ~ getHistoryBookings ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching history bookings:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: string) => {
    try {
      const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
      console.log('🚀 ~ cancelBooking ~ response:', response);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },
};

// Backward compatibility exports
export const createLinkVnpayBookingPaymentAPI = bookingService.createBookingPayment;
export const getUpcomingBookingsByUserIdAPI = bookingService.getUpcomingBookings;
export const getHistoryBookingsByUserIdAPI = bookingService.getHistoryBookings;
export const cancelBookingAPI = bookingService.cancelBooking;
