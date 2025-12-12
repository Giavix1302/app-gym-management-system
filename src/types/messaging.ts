// Messaging Type Definitions
// Based on API documentation for User-PT messaging system

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'trainer';
  content: string;
  isRead: boolean;
  timestamp: number;
}

export interface ConversationParticipant {
  _id: string;
  fullName: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'trainer';
}

export interface Conversation {
  _id: string;
  userInfo: {
    userId: string;
    fullName: string;
    avatar?: string;
  };
  trainerInfo: {
    trainerId: string;
    fullName: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    messages: Message[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
    conversations: Array<{
      conversationId: string;
      unreadCount: number;
    }>;
  };
}

export interface SendMessageRequest {
  content: string;
}

export interface MarkReadRequest {
  messageIds: string[];
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    updatedCount: number;
    messageIds: string[];
    readAt: string;
  };
}

// Socket.IO Event Types
export interface SocketJoinConversationData {
  conversationId: string;
  role: 'user' | 'trainer';
}

export interface SocketSendMessageData {
  conversationId: string;
  content: string;
  role: 'user' | 'trainer';
}

export interface SocketTypingData {
  conversationId: string;
  isTyping: boolean;
}

export interface SocketMarkReadData {
  conversationId: string;
  messageIds: string[];
  role: 'user' | 'trainer';
}

export interface SocketMessagesReadData {
  conversationId: string;
  messageIds: string[];
  readBy: string;
}

export interface SocketUserTypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// Socket Event Names - MUST MATCH BACKEND (using underscore)
export const SOCKET_EVENTS = {
  // Emit (Client → Server)
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  MARK_READ: 'mark_read',

  // Listen (Server → Client)
  NEW_MESSAGE: 'new_message',
  MESSAGES_READ: 'messages_read',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  JOINED_CONVERSATION: 'joined_conversation',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  CONNECT_ERROR: 'connect_error',
} as const;
