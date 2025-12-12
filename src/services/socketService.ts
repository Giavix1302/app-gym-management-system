// Socket Service - Socket.IO Client for Real-time Messaging
// Singleton pattern for managing Socket.IO connection

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/storage';
import {
  Message,
  SOCKET_EVENTS,
  SocketJoinConversationData,
  SocketSendMessageData,
  SocketTypingData,
  SocketMarkReadData,
  SocketMessagesReadData,
  SocketUserTypingData,
} from '../types/messaging';

class SocketService {
  private socket: Socket | null = null;
  private readonly API_URL = 'https://gym.sitedemo.io.vn';
  private isConnecting = false;

  /**
   * Connect to Socket.IO server with JWT authentication
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('[Socket] Already connected or connecting');
      return;
    }

    try {
      this.isConnecting = true;
      const token = await getAccessToken();

      if (!token) {
        console.warn('[Socket] No access token available');
        this.isConnecting = false;
        return;
      }

      this.socket = io(this.API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupConnectionListeners();
      this.isConnecting = false;
    } catch (error) {
      console.error('[Socket] Connection error:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Setup connection event listeners
   */
  private setupConnectionListeners(): void {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('[Socket] Error:', error);
    });

    // Debug: Listen to all events
    if (this.socket.onAny) {
      this.socket.onAny((eventName, ...args) => {
        console.log('[Socket] Event received:', eventName, args);
      });
    }
  }

  // ==================== Event Emitters (Client → Server) ====================

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string, role: 'user' | 'trainer'): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot join conversation - not connected');
      return;
    }

    // Backend only needs conversationId as string, not an object
    console.log('[Socket] Emitting join_conversation event:', conversationId);
    this.socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversationId);
    console.log('[Socket] ✅ join_conversation event emitted for:', conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot leave conversation - not connected');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, conversationId);
    console.log('[Socket] Left conversation:', conversationId);
  }

  /**
   * Send a message via Socket.IO
   */
  sendMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'trainer'
  ): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot send message - not connected');
      return;
    }

    const data: SocketSendMessageData = { conversationId, content, role };
    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, data);
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    const data: SocketTypingData = { conversationId, isTyping };
    const event = isTyping
      ? SOCKET_EVENTS.TYPING
      : SOCKET_EVENTS.STOP_TYPING;
    this.socket.emit(event, data);
  }

  /**
   * Mark messages as read via Socket.IO
   */
  markMessagesRead(
    conversationId: string,
    messageIds: string[],
    role: 'user' | 'trainer'
  ): void {
    if (!this.socket?.connected) return;

    const data: SocketMarkReadData = { conversationId, messageIds, role };
    this.socket.emit(SOCKET_EVENTS.MARK_READ, data);
  }

  // ==================== Event Listeners (Server → Client) ====================

  /**
   * Listen for new messages
   * Note: Backend may emit Message object or array of Messages
   */
  onNewMessage(callback: (data: Message | Message[]) => void): void {
    if (!this.socket) return;
    console.log('[Socket] 🎯 Registering NEW_MESSAGE listener');
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, callback);
  }

  /**
   * Remove new message listener
   */
  offNewMessage(callback?: (data: Message | Message[]) => void): void {
    if (!this.socket) return;
    console.log('[Socket] 🔴 Removing NEW_MESSAGE listener');
    if (callback) {
      this.socket.off(SOCKET_EVENTS.NEW_MESSAGE, callback);
    } else {
      this.socket.off(SOCKET_EVENTS.NEW_MESSAGE);
    }
  }

  /**
   * Listen for messages read event
   */
  onMessagesRead(callback: (data: SocketMessagesReadData) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.MESSAGES_READ, callback);
  }

  /**
   * Remove messages read listener
   */
  offMessagesRead(callback?: (data: SocketMessagesReadData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(SOCKET_EVENTS.MESSAGES_READ, callback);
    } else {
      this.socket.off(SOCKET_EVENTS.MESSAGES_READ);
    }
  }

  /**
   * Listen for user typing event
   */
  onUserTyping(callback: (data: SocketUserTypingData) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.USER_TYPING, callback);
  }

  /**
   * Remove user typing listener
   */
  offUserTyping(callback?: (data: SocketUserTypingData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(SOCKET_EVENTS.USER_TYPING, callback);
    } else {
      this.socket.off(SOCKET_EVENTS.USER_TYPING);
    }
  }

  /**
   * Listen for user stop typing event
   */
  onUserStopTyping(callback: (data: SocketUserTypingData) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.USER_STOP_TYPING, callback);
  }

  /**
   * Remove user stop typing listener
   */
  offUserStopTyping(callback?: (data: SocketUserTypingData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(SOCKET_EVENTS.USER_STOP_TYPING, callback);
    } else {
      this.socket.off(SOCKET_EVENTS.USER_STOP_TYPING);
    }
  }

  /**
   * Listen for connection event
   */
  onConnect(callback: () => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.CONNECT, callback);
  }

  /**
   * Remove connection listener
   */
  offConnect(): void {
    if (!this.socket) return;
    this.socket.off(SOCKET_EVENTS.CONNECT);
  }

  /**
   * Listen for disconnection event
   */
  onDisconnect(callback: (reason: string) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.DISCONNECT, callback);
  }

  /**
   * Remove disconnection listener
   */
  offDisconnect(): void {
    if (!this.socket) return;
    this.socket.off(SOCKET_EVENTS.DISCONNECT);
  }

  /**
   * Listen for connection error
   */
  onConnectError(callback: (error: Error) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, callback);
  }

  /**
   * Remove connection error listener
   */
  offConnectError(): void {
    if (!this.socket) return;
    this.socket.off(SOCKET_EVENTS.CONNECT_ERROR);
  }

  /**
   * Listen for joined conversation confirmation
   */
  onJoinedConversation(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on(SOCKET_EVENTS.JOINED_CONVERSATION, callback);
  }

  /**
   * Remove joined conversation listener
   */
  offJoinedConversation(callback?: (data: any) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(SOCKET_EVENTS.JOINED_CONVERSATION, callback);
    } else {
      this.socket.off(SOCKET_EVENTS.JOINED_CONVERSATION);
    }
  }
}

// Export singleton instance
export default new SocketService();
