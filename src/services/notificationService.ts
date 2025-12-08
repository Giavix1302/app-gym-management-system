import axiosInstance from '../config/axios';
import {
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  NotificationParams,
} from '../types/api';

export const notificationService = {
  /**
   * Lấy danh sách notifications của user với pagination và filtering
   * @param userId - ID của user
   * @param params - Các tham số phân trang và lọc
   * @returns NotificationsResponse
   */
  getUserNotifications: async (
    userId: string,
    params: NotificationParams = {}
  ): Promise<NotificationsResponse> => {
    const queryParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 20),
      ...(params.isRead !== undefined && { isRead: String(params.isRead) }),
    }).toString();

    const response = await axiosInstance.get<NotificationsResponse>(
      `/notifications/user/${userId}?${queryParams}`
    );

    return response.data;
  },

  /**
   * Lấy số lượng notifications chưa đọc
   * @param userId - ID của user
   * @returns UnreadCountResponse
   */
  getUnreadNotificationCount: async (
    userId: string
  ): Promise<UnreadCountResponse> => {
    const response = await axiosInstance.get<UnreadCountResponse>(
      `/notifications/user/${userId}/unread-count`
    );

    return response.data;
  },

  /**
   * Đánh dấu notification là đã đọc
   * @param notificationId - ID của notification
   * @returns MarkAsReadResponse
   */
  markNotificationAsRead: async (
    notificationId: string
  ): Promise<MarkAsReadResponse> => {
    const response = await axiosInstance.patch<MarkAsReadResponse>(
      `/notifications/${notificationId}/read`
    );

    return response.data;
  },

  /**
   * Đánh dấu tất cả notifications là đã đọc
   * @param userId - ID của user
   * @returns MarkAllAsReadResponse
   */
  markAllNotificationsAsRead: async (
    userId: string
  ): Promise<MarkAllAsReadResponse> => {
    const response = await axiosInstance.patch<MarkAllAsReadResponse>(
      `/notifications/user/${userId}/mark-all-read`
    );

    return response.data;
  },
};
