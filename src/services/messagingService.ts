// Messaging Service - REST API for User-PT Messaging System
// Follows existing service pattern from userService.ts and chatbotService.ts

import axiosInstance from '../config/axios';
import {
  ConversationsResponse,
  MessagesResponse,
  Message,
  SendMessageRequest,
  MarkReadRequest,
  MarkReadResponse,
  UnreadCountResponse,
} from '../types/messaging';

export const messagingService = {
  /**
   * Get list of conversations for a user
   * @param userId - User ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param role - User role ('user' | 'trainer')
   */
  getConversations: async (
    userId: string,
    page: number = 1,
    limit: number = 20,
    role: 'user' | 'trainer'
  ): Promise<ConversationsResponse> => {
    const response = await axiosInstance.get<ConversationsResponse>(
      `/conversations/${userId}?page=${page}&limit=${limit}&role=${role}`
    );
    return response.data;
  },

  /**
   * Get messages in a conversation
   * @param conversationId - Conversation ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @param role - User role ('user' | 'trainer')
   */
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50,
    role: 'user' | 'trainer'
  ): Promise<MessagesResponse> => {
    const response = await axiosInstance.get<MessagesResponse>(
      `/conversations/${conversationId}/messages`,
      {
        params: { page, limit, role },
      }
    );
    return response.data;
  },

  /**
   * Send a message in a conversation
   * @param conversationId - Conversation ID
   * @param content - Message content
   * @param role - User role ('user' | 'trainer')
   */
  sendMessage: async (
    conversationId: string,
    content: string,
    role: 'user' | 'trainer'
  ): Promise<{ success: boolean; message: string; data: Message }> => {
    const requestBody: SendMessageRequest = { content };
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: Message;
    }>(`/conversations/${conversationId}/messages?role=${role}`, requestBody);
    return response.data;
  },

  /**
   * Mark messages as read
   * @param conversationId - Conversation ID
   * @param messageIds - Array of message IDs to mark as read
   * @param role - User role ('user' | 'trainer')
   */
  markAsRead: async (
    conversationId: string,
    messageIds: string[],
    role: 'user' | 'trainer'
  ): Promise<MarkReadResponse> => {
    const requestBody: MarkReadRequest = { messageIds };
    const response = await axiosInstance.put<MarkReadResponse>(
      `/conversations/${conversationId}/messages/read`,
      requestBody,
      {
        params: { role },
      }
    );
    return response.data;
  },

  /**
   * Get unread message count for current user
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await axiosInstance.get<UnreadCountResponse>(
      '/conversations/unread-count'
    );
    return response.data;
  },
};

// Export individual functions for backward compatibility
export const getConversationsAPI = messagingService.getConversations;
export const getMessagesAPI = messagingService.getMessages;
export const sendMessageAPI = messagingService.sendMessage;
export const markAsReadAPI = messagingService.markAsRead;
export const getUnreadCountAPI = messagingService.getUnreadCount;
