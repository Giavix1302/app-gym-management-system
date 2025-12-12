import axiosInstance from '../config/axios';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetInSeconds: number;
  type: 'authenticated';
}

export interface SendMessageResponse {
  success: boolean;
  response: {
    content: string;
    type: 'ai_response' | 'system_error';
  };
  conversationId: string;
  timestamp: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  conversation: {
    _id: string;
    userId: string;
    userType: 'authenticated';
    sessionId: string;
    messages: ChatMessage[];
    status: 'active';
    lastActiveAt: string;
    createdAt: string;
  } | null;
  messageCount: number;
}

export interface RateLimitError {
  success: false;
  message: string;
  error: {
    code: 'CHATBOT_RATE_LIMIT_EXCEEDED';
    limit: number;
    current: number;
    remaining: number;
    resetInSeconds: number;
    resetAt: string;
    requiresLogin: boolean;
  };
  suggestion: string;
}

export const chatbotService = {
  /**
   * Send message to chatbot (authenticated user)
   */
  sendMessage: async (
    userId: string,
    message: string
  ): Promise<{
    data: SendMessageResponse;
    rateLimitInfo: RateLimitInfo;
  }> => {
    const response = await axiosInstance.post<SendMessageResponse>(
      `/chatbot/message/${userId}`,
      { message }
    );

    // Extract rate limit info from headers
    const rateLimitInfo: RateLimitInfo = {
      limit: parseInt(response.headers['x-ratelimit-limit'] || '100'),
      remaining: parseInt(response.headers['x-ratelimit-remaining'] || '100'),
      resetInSeconds: parseInt(response.headers['x-ratelimit-reset'] || '0'),
      type: 'authenticated',
    };

    return {
      data: response.data,
      rateLimitInfo,
    };
  },

  /**
   * Get conversation history for user
   */
  getConversationHistory: async (userId: string): Promise<ConversationHistoryResponse> => {
    const response = await axiosInstance.get<ConversationHistoryResponse>(
      `/chatbot/conversation/${userId}`
    );
    return response.data;
  },

  /**
   * Get all conversations for user (for history view)
   */
  getAllConversations: async (userId: string): Promise<any> => {
    const response = await axiosInstance.get(`/chatbot/my/conversations/${userId}`);
    return response.data;
  },
};
