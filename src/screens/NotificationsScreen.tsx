import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Notification } from '../types/api';
import { RootStackParamList } from '../navigation/types';
import { notificationService } from '../services/notificationService';
import { getUser } from '../utils/storage';
import NotificationItem from '../components/NotificationItem';
import { useNotification } from '../context/NotificationContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'unread';

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const initializeUser = useCallback(async () => {
    try {
      const user = await getUser();
      if (user?._id) {
        setUserId(user._id);
      }
    } catch {
      showError('Không thể tải thông tin người dùng');
    }
  }, [showError]);

  const loadNotifications = useCallback(async (page = 1, isLoadMore = false) => {
    if (!userId) return;

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = {
        page,
        limit: 20,
        ...(activeTab === 'unread' && { isRead: false }),
      };

      const response = await notificationService.getUserNotifications(userId, params);

      if (response.success) {
        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...response.notifications]);
        } else {
          setNotifications(response.notifications);
        }

        setUnreadCount(response.unreadCount);
        setCurrentPage(page);
        setHasMore(response.notifications.length === params.limit);
      }
    } catch {
      showError('Không thể tải thông báo');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [userId, activeTab, showError]);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, activeTab, loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(1);
  }, [userId, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadNotifications(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, loading, currentPage, userId, activeTab]);

  const handleNotificationPress = async (notification: Notification) => {
    // Đánh dấu là đã đọc nếu chưa đọc
    if (!notification.isRead) {
      try {
        await notificationService.markNotificationAsRead(notification._id);

        // Cập nhật local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Điều hướng dựa trên referenceType
    handleNavigation(notification);
  };

  const handleNavigation = (notification: Notification) => {
    // TODO: Implement navigation based on referenceType
    // For now, we'll just log
    console.log('Navigate to:', notification.referenceType, notification.referenceId);

    // Example implementation:
    // switch (notification.referenceType) {
    //   case 'BOOKING':
    //     navigation.navigate('BookingDetail', { id: notification.referenceId });
    //     break;
    //   case 'CLASS':
    //     navigation.navigate('ClassDetail', { id: notification.referenceId });
    //     break;
    //   case 'MEMBERSHIP':
    //     navigation.navigate('MembershipTab');
    //     break;
    // }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const response = await notificationService.markAllNotificationsAsRead(userId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      showError('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done" size={20} color="#16697A" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
            Chưa đọc
            {unreadCount > 0 && (
              <Text style={styles.badgeText}> ({unreadCount})</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#16697A" />
      </View>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16697A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handleNotificationPress} />
        )}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#16697A']}
            tintColor="#16697A"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#16697A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#16697A',
    fontWeight: '700',
  },
  badgeText: {
    fontSize: 14,
    color: '#16697A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
