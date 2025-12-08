import axiosInstance from '../config/axios';
import { MembershipPackagesResponse, Membership } from '../types/api';

interface DeleteSubscriptionResponse {
  success: boolean;
  message: string;
  result: number;
}

interface CreateVnpayLinkRequest {
  userId: string;
  membershipId: string;
}

interface CreateVnpayLinkResponse {
  success: boolean;
  paymentUrl: string;
}

interface SubscriptionData {
  _id: string;
  userId: string;
  membershipId: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  remainingSessions: number;
  createdAt: number;
  updatedAt: number | null;
  _destroy: boolean;
  name: string;
  durationMonth: number;
  bannerURL: string;
  totalCheckin: number;
}

interface GetSubscriptionResponse {
  success: boolean;
  message: string;
  subscription: SubscriptionData;
}

export const membershipService = {
  /**
   * Lấy danh sách tất cả các gói tập
   * @returns MembershipPackagesResponse
   */
  getListMembership: async (): Promise<MembershipPackagesResponse> => {
    const response = await axiosInstance.get<MembershipPackagesResponse>('/memberships');
    return response.data;
  },

  /**
   * Xóa gói tập hiện tại của người dùng
   * @param subId - ID của subscription cần xóa
   * @returns DeleteSubscriptionResponse
   */
  deleteSubscription: async (subId: string): Promise<DeleteSubscriptionResponse> => {
    console.log('🚀 ~ deleteSubscriptionAPI ~ subId:', subId);
    const response = await axiosInstance.delete<DeleteSubscriptionResponse>(`/subscriptions/${subId}`);
    console.log('🚀 ~ deleteSubscriptionAPI ~ rep:', response);
    return response.data;
  },

  /**
   * Tạo link thanh toán VNPay cho gói tập
   * @param data - userId và membershipId
   * @returns CreateVnpayLinkResponse
   */
  createVnpayLink: async (data: CreateVnpayLinkRequest): Promise<CreateVnpayLinkResponse> => {
    const response = await axiosInstance.post<CreateVnpayLinkResponse>(
      '/payments/vnpay/subscription',
      data
    );
    return response.data;
  },

  /**
   * Lấy thông tin subscription của user
   * @param userId - ID của user
   * @returns Membership data
   */
  getSubscriptionByUserId: async (userId: string): Promise<Membership> => {
    console.log('🚀 ~ getSubscriptionByUserId ~ userId:', userId);
    const response = await axiosInstance.get<GetSubscriptionResponse>(`/subscriptions/${userId}`);
    console.log('🚀 ~ getSubscriptionByUserId ~ response:', response);

    // Chỉ lấy các field cần thiết theo interface Membership
    const subscription = response.data.subscription;
    const membership: Membership = {
      _id: subscription._id,
      remainingSessions: subscription.remainingSessions,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      name: subscription.name,
      durationMonth: subscription.durationMonth,
      bannerURL: subscription.bannerURL,
      totalCheckin: subscription.totalCheckin,
    };

    return membership;
  },
};
