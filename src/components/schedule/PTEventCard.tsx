import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PTEvent, PTBookingEvent, PTClassEvent } from '../../types/api';
import { convertUTCToVietnam, formatTime } from '../../utils/dateTime';

interface PTEventCardProps {
  event: PTEvent;
}

// Helper to check if event is booking
const isBookingEvent = (event: PTEvent): event is PTBookingEvent => {
  return event.eventType === 'booking';
};

// Helper to check if event is class
const isClassEvent = (event: PTEvent): event is PTClassEvent => {
  return event.eventType === 'class';
};

// Get event color based on type
const getEventColor = (eventType: 'booking' | 'class'): string => {
  return eventType === 'booking' ? '#3B82F6' : '#EAB308'; // Blue for booking, Yellow for class
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#F59E0B'; // Orange
    case 'confirmed':
      return '#3B82F6'; // Blue
    case 'completed':
      return '#10B981'; // Green
    case 'cancelled':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
};

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Format time range
const formatEventTimeRange = (event: PTEvent): string => {
  const startTime = convertUTCToVietnam(event.startTime);
  const endTime = convertUTCToVietnam(event.endTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export default function PTEventCard({ event }: PTEventCardProps) {
  const borderColor = getEventColor(event.eventType);
  const isBooking = isBookingEvent(event);
  const isClass = isClassEvent(event);

  return (
    <View style={styles.container} className="bg-white rounded-lg p-4 mb-3">
      {/* Left border for visual indicator - color based on event type */}
      <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />

      {/* Event Type Badge */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="rounded-full px-3 py-1 flex-row items-center"
            style={{ backgroundColor: `${borderColor}15` }}>
            <Ionicons
              name={isBooking ? 'person' : 'school'}
              size={14}
              color={borderColor}
            />
            <Text
              className="ml-1 text-xs font-semibold"
              style={{ color: borderColor }}>
              {isBooking ? 'Booking PT' : 'Lớp học'}
            </Text>
          </View>
        </View>

        {/* Status badge for booking */}
        {isBooking && event.status && (
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: `${getStatusColor(event.status)}15` }}>
            <Text
              className="text-xs font-semibold"
              style={{ color: getStatusColor(event.status) }}>
              {getStatusLabel(event.status)}
            </Text>
          </View>
        )}
      </View>

      {/* Event Title */}
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {event.title}
      </Text>

      {/* Time */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="time-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          {formatEventTimeRange(event)}
        </Text>
      </View>

      {/* Location */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          {isClass && event.roomName
            ? `${event.roomName} - ${event.locationName}`
            : event.locationName}
        </Text>
      </View>

      {/* Booking specific info */}
      {isBooking && (
        <>
          {/* Client name */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Khách hàng: {event.userName}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              {formatPrice(event.price)}
            </Text>
          </View>

          {/* Note */}
          {event.note && event.note.trim() !== '' && (
            <View className="flex-row items-start">
              <Ionicons name="document-text-outline" size={16} color="#6B7280" />
              <Text className="ml-2 flex-1 text-sm text-gray-600">
                Ghi chú: {event.note}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Class specific info */}
      {isClass && (
        <>
          {/* Session progress */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Buổi {event.sessionNumber}/{event.totalSessions}
            </Text>
          </View>

          {/* Enrolled count */}
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Đã đăng ký: {event.enrolledCount}/{event.capacity} học viên
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
});
