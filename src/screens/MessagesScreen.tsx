// MessagesScreen - List of conversations
// Stack screen accessible from home screen "Tin nhắn" button

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { getUser } from '../utils/storage';
import { User } from '../types/api';
import { Conversation } from '../types/messaging';
import { messagingService } from '../services/messagingService';
import socketService from '../services/socketService';
import ConversationItem from '../components/messaging/ConversationItem';
import { useNotification } from '../context/NotificationContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();

  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      if (!user?._id) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        // Determine user role
        const role = user.role === 'pt' ? 'trainer' : 'user';

        const response = await messagingService.getConversations(
          user._id,
          pageNum,
          20,
          role
        );

        if (response.success) {
          const conversationsData = response.data || [];

          if (isRefresh || pageNum === 1) {
            setConversations(conversationsData);
          } else {
            setConversations((prev) => [...prev, ...conversationsData]);
          }

          // Check pagination safely
          const pagination = response.pagination;
          if (pagination) {
            setHasMore(
              pagination.page < pagination.totalPages
            );
          } else {
            setHasMore(false);
          }
          setPage(pageNum);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        showError('Không thể tải danh sách tin nhắn');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user, showError]
  );

  // Initial load and refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        fetchConversations(1, false);
      }
    }, [user, fetchConversations])
  );

  // Listen for new messages via Socket.IO to update conversation list
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleNewMessage = () => {
      // Refresh conversation list when new message arrives
      fetchConversations(1, false);
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage();
    };
  }, [fetchConversations]);

  // Pull to refresh
  const onRefresh = () => {
    fetchConversations(1, true);
  };

  // Load more on scroll
  const onLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchConversations(page + 1, false);
    }
  };

  // Navigate to chat screen
  const handleConversationPress = (conversation: Conversation) => {
    const role = user?.role === 'pt' ? 'trainer' : 'user';
    const otherUser =
      role === 'user'
        ? {
            _id: conversation.trainerInfo.trainerId,
            fullName: conversation.trainerInfo.fullName,
            avatar: conversation.trainerInfo.avatar,
          }
        : {
            _id: conversation.userInfo.userId,
            fullName: conversation.userInfo.fullName,
            avatar: conversation.userInfo.avatar,
          };

    navigation.navigate('Chat', {
      conversationId: conversation._id,
      otherUser: {
        _id: otherUser._id,
        fullName: otherUser.fullName,
        avatar: otherUser.avatar,
        role: role === 'user' ? 'trainer' : 'user',
      },
    });
  };

  // Render conversation item
  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      currentUserId={user?._id || ''}
      currentUserRole={user?.role === 'pt' ? 'trainer' : 'user'}
      onPress={() => handleConversationPress(item)}
    />
  );

  // Empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View className="flex-1 items-center justify-center px-8 py-20">
        <Ionicons name="chatbubbles-outline" size={80} color="#cbd5e1" />
        <Text className="mt-4 text-center text-lg font-semibold text-gray-700">
          Chưa có tin nhắn
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {user?.role === 'pt'
            ? 'Tin nhắn từ học viên của bạn sẽ xuất hiện ở đây'
            : 'Tin nhắn với huấn luyện viên sẽ xuất hiện ở đây'}
        </Text>
      </View>
    );
  };

  // Footer for loading more
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#16697A" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-backgroundDefault">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Tin nhắn</Text>
          </View>
        </View>
      </View>

      {/* Conversation List */}
      {loading && (!conversations || conversations.length === 0) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#16697A"
              colors={['#16697A']}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaView>
  );
}
