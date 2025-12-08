import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, NotificationType } from '../types/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'USER_UPCOMING_BOOKING':
    case 'USER_BOOKING_CONFIRMED':
      return 'calendar';
    case 'USER_BOOKING_CANCELLED':
    case 'PT_BOOKING_CANCELLED':
      return 'close-circle';
    case 'USER_CLASS_REMINDER':
      return 'school';
    case 'PT_NEW_BOOKING':
      return 'person-add';
    case 'MEMBERSHIP_EXPIRING':
    case 'MEMBERSHIP_EXPIRED':
      return 'alert-circle';
    default:
      return 'notifications';
  }
};

const getNotificationIconColor = (type: NotificationType): string => {
  switch (type) {
    case 'USER_UPCOMING_BOOKING':
    case 'USER_BOOKING_CONFIRMED':
    case 'PT_NEW_BOOKING':
      return '#16697A';
    case 'USER_BOOKING_CANCELLED':
    case 'PT_BOOKING_CANCELLED':
      return '#EF4444';
    case 'USER_CLASS_REMINDER':
      return '#8B5CF6';
    case 'MEMBERSHIP_EXPIRING':
      return '#F59E0B';
    case 'MEMBERSHIP_EXPIRED':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationIconColor(notification.type);

  const timeAgo = notification.sentAt
    ? formatDistanceToNow(new Date(notification.sentAt), {
        addSuffix: true,
        locale: vi,
      })
    : '';

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer,
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text
            style={[styles.title, !notification.isRead && styles.unreadTitle]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadContainer: {
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16697A',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
