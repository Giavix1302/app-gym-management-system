import axiosInstance from '../config/axios';

// ==================== Types ====================
export type PaymentType = 'membership' | 'booking' | 'class';
export type PaymentMethod = 'vnpay' | 'cash' | 'transfer';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export interface Payment {
  _id: string;
  userId: string;
  referenceId: string;
  paymentType: PaymentType;
  amount: number;
  paymentDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: number;
  updatedAt: number | null;
  _destroy: boolean;
  paymentStatus: PaymentStatus;
  refundAmount: number;
  refundDate: string;
}

export interface PaymentPagination {
  currentPage: number;
  totalPages: number;
  totalPayments: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
  pagination: PaymentPagination;
}

// ==================== Payment Service ====================
export const paymentService = {
  /**
   * Get payments by user ID with pagination
   * @param userId - User ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Payments response with pagination
   */
  getPaymentsByUserId: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaymentsResponse> => {
    const response = await axiosInstance.get<PaymentsResponse>(
      `/payments/user/${userId}?page=${page}&limit=${limit}`
    );
    console.log('🚀 ~ getPaymentsByUserIdAPI ~ response:', response);
    return response.data;
  },
};

// ==================== Export Individual APIs (for backward compatibility) ====================
export const getPaymentsByUserIdAPI = paymentService.getPaymentsByUserId;
