// ChatScreen - Individual conversation with real-time messaging
// Similar pattern to ChatbotScreen with Socket.IO integration

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { getUser } from '../utils/storage';
import { User } from '../types/api';
import { Message } from '../types/messaging';
import { messagingService } from '../services/messagingService';
import socketService from '../services/socketService';
import MessageBubble from '../components/messaging/MessageBubble';
import TypingIndicator from '../components/chatbot/TypingIndicator';
import MessageInputBar from '../components/messaging/MessageInputBar';
import { useNotification } from '../context/NotificationContext';
import { getAvatarSource, getInitials } from '../utils/avatar';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();

  const { conversationId, otherUser } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Keyboard event listeners for auto-scroll
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Determine current user role
  const currentUserRole = user?.role === 'pt' ? 'trainer' : 'user';

  // Fetch messages
  const fetchMessages = useCallback(
    async (pageNum: number = 1) => {
      if (!user?._id) return;

      try {
        if (pageNum === 1) {
          setIsLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await messagingService.getMessages(
          conversationId,
          pageNum,
          50,
          currentUserRole
        );

        if (response.success) {
          const messagesData = response.data?.messages || [];

          if (pageNum === 1) {
            setMessages(messagesData);
          } else {
            // Prepend older messages
            setMessages((prev) => [...messagesData, ...prev]);
          }

          // Check pagination safely
          const pagination = response.pagination;
          if (pagination) {
            setHasMore(pagination.page < pagination.totalPages);
          } else {
            setHasMore(false);
          }
          setPage(pageNum);

          // Mark messages as read
          if (user?._id) {
            const unreadMessageIds = messagesData
              .filter((msg) => !msg.isRead && msg.senderId !== user._id)
              .map((msg) => msg._id);

            if (unreadMessageIds.length > 0) {
              await messagingService.markAsRead(
                conversationId,
                unreadMessageIds,
                currentUserRole
              );
            }
          }
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        showError('Không thể tải tin nhắn');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [user, conversationId, currentUserRole, showError]
  );

  // Initial load
  useEffect(() => {
    if (user?._id) {
      fetchMessages(1);
    }
  }, [user, fetchMessages]);

  // Join conversation room and setup Socket.IO listeners
  useEffect(() => {
    if (!user?._id || !socketService.isConnected()) {
      console.log('[ChatScreen] Socket setup skipped - user or socket not ready');
      return;
    }

    console.log('[ChatScreen] Setting up socket listeners for conversation:', conversationId);
    console.log('[ChatScreen] Current user:', user._id, 'Role:', currentUserRole);

    // Join conversation room
    socketService.joinConversation(conversationId, currentUserRole);

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      console.log('[ChatScreen] ✅ NEW MESSAGE EVENT RECEIVED:', message);

      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Check if real message already exists
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;

          // If message is from current user, remove optimistic message with same content
          if (message.senderId === user._id) {
            const withoutOptimistic = prev.filter(
              (msg) => !(
                (msg as any).isOptimistic &&
                msg.content === message.content &&
                msg.senderId === user._id
              )
            );
            return [...withoutOptimistic, message];
          }

          // Otherwise just add the message
          return [...prev, message];
        });

        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Mark as read if not from current user
        if (message.senderId !== user._id) {
          messagingService.markAsRead(
            conversationId,
            [message._id],
            currentUserRole
          );
        }
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data: any) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== user._id
      ) {
        setIsTyping(data.isTyping);
      }
    };

    // Listen for messages read
    const handleMessagesRead = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    // Listen for join confirmation
    const handleJoinedConversation = (data: any) => {
      console.log('[ChatScreen] ✅ Joined conversation confirmed:', data);
    };

    console.log('[ChatScreen] Registering socket event listeners...');
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserTyping);
    socketService.onMessagesRead(handleMessagesRead);
    socketService.onJoinedConversation(handleJoinedConversation);
    console.log('[ChatScreen] Socket listeners registered successfully');

    // Cleanup
    return () => {
      console.log('[ChatScreen] Cleaning up socket listeners for:', conversationId);
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
      socketService.offUserTyping();
      socketService.offUserStopTyping();
      socketService.offMessagesRead();
      socketService.offJoinedConversation();
    };
  }, [user, conversationId, currentUserRole]);

  // Send message
  const handleSend = async () => {
    if (!inputMessage.trim() || isSending || !user?._id) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // Optimistic UI update - add temporary message immediately
    const tempMessage: Message & { isOptimistic?: boolean } = {
      _id: `temp-${Date.now()}`,
      conversationId: conversationId,
      senderId: user._id,
      senderType: currentUserRole === 'trainer' ? 'trainer' : 'user',
      content: messageContent,
      isRead: false,
      timestamp: Date.now(),
      isOptimistic: true, // Flag to identify temporary message
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await messagingService.sendMessage(
        conversationId,
        messageContent,
        currentUserRole
      );

      if (response.success && response.data) {
        // Replace optimistic message with real message from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id
              ? { ...response.data, isOptimistic: false }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showError('Không thể gửi tin nhắn');

      // Remove failed optimistic message and restore input
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      setInputMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setInputMessage(text);

    // Send typing indicator
    if (socketService.isConnected()) {
      socketService.sendTyping(conversationId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(conversationId, false);
      }, 3000);
    }
  };

  // Load more messages on scroll
  const onLoadMore = () => {
    if (!loadingMore && hasMore && !isLoading) {
      fetchMessages(page + 1);
    }
  };

  // Render message item
  const renderItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?._id;

    return (
      <MessageBubble
        content={item.content}
        timestamp={item.timestamp}
        isOwnMessage={isOwnMessage}
        isRead={item.isRead}
        otherUserAvatar={otherUser.avatar}
        otherUserName={otherUser.fullName}
      />
    );
  };

  // Header with other user info
  const avatarSource = getAvatarSource(otherUser.avatar);
  const initials = getInitials(otherUser.fullName);

  return (
    <SafeAreaView className="flex-1 bg-backgroundDefault">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            {/* Other user avatar */}
            {avatarSource ? (
              <Image
                source={avatarSource}
                className="h-10 w-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Text className="text-sm font-bold text-white">{initials}</Text>
              </View>
            )}

            <Text className="flex-1 text-lg font-semibold text-gray-900">
              {otherUser.fullName}
            </Text>
          </View>
        </View>

        {/* Messages List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16697A" />
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 20,
              }}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.5}
              onContentSizeChange={() => {
                // Auto-scroll to bottom when content size changes (new messages)
                if (messages.length > 0) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
              onLayout={() => {
                // Auto-scroll on initial layout
                if (messages.length > 0) {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }
              }}
              ListHeaderComponent={
                loadingMore ? (
                  <View className="py-4">
                    <ActivityIndicator size="small" color="#16697A" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Ionicons name="chatbubbles-outline" size={60} color="#cbd5e1" />
                  <Text className="mt-4 text-center text-base text-gray-500">
                    Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                  </Text>
                </View>
              }
            />

            {/* Typing Indicator */}
            {isTyping && (
              <View className="px-4 pb-2">
                <TypingIndicator />
              </View>
            )}
          </View>
        )}

        {/* Message Input Bar */}
        <MessageInputBar
          value={inputMessage}
          onChangeText={handleTyping}
          onSend={handleSend}
          isLoading={isSending}
          placeholder="Nhập tin nhắn..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
