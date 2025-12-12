import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PTSchedule } from '../../types/ptSchedule';
import { formatTime, convertUTCToVietnam } from '../../utils/dateTime';

interface PTScheduleItemProps {
  schedule: PTSchedule;
  onPress: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  showDate?: boolean; // Option to show date
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = 100;

export default function PTScheduleItem({
  schedule,
  onPress,
  onDelete,
  canDelete = false,
  showDate = true, // Show date by default
}: PTScheduleItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const isBooked = !!schedule.booking.bookingId;
  const status = schedule.booking.status;

  const startTime = convertUTCToVietnam(schedule.startTime);
  const endTime = convertUTCToVietnam(schedule.endTime);
  const dateString = format(startTime, 'EEE, dd/MM/yyyy', { locale: vi });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canDelete,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return canDelete && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          // Only allow swiping left
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const currentOffset = lastOffset.current + gestureState.dx;

        if (currentOffset < -DELETE_THRESHOLD) {
          // Swipe far enough, show delete button
          Animated.spring(translateX, {
            toValue: -DELETE_THRESHOLD,
            useNativeDriver: true,
          }).start();
          lastOffset.current = -DELETE_THRESHOLD;
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          lastOffset.current = 0;
        }
      },
    })
  ).current;

  const handleDelete = () => {
    if (onDelete) {
      // Reset position first
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        lastOffset.current = 0;
        onDelete();
      });
    }
  };

  const getStatusColor = () => {
    if (!isBooked) return 'bg-gray-100 border-gray-200';
    switch (status) {
      case 'booking':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusBadge = () => {
    if (!isBooked) {
      return (
        <View className="rounded-full bg-gray-200 px-2 py-1">
          <Text className="text-xs font-semibold text-gray-700">Lịch trống</Text>
        </View>
      );
    }

    let bgColor = 'bg-blue-100';
    let textColor = 'text-blue-700';
    let text = 'Đã đặt';

    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        text = 'Đã hoàn thành';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        text = 'Đã hủy';
        break;
    }

    return (
      <View className={`rounded-full px-2 py-1 ${bgColor}`}>
        <Text className={`text-xs font-semibold ${textColor}`}>{text}</Text>
      </View>
    );
  };

  return (
    <View className="mb-3">
      <View className="relative">
        {/* Delete Button (behind) */}
        {canDelete && (
          <View className="absolute right-0 top-0 bottom-0 flex-row items-center justify-end pr-4">
            <TouchableOpacity
              className="items-center justify-center rounded-xl bg-red-500 px-6 py-4"
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={24} color="#FFF" />
              <Text className="mt-1 text-xs font-semibold text-white">Xóa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content (swipeable) */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...(canDelete ? panResponder.panHandlers : {})}
        >
          <TouchableOpacity
            className={`rounded-2xl border p-4 ${getStatusColor()}`}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {/* Date with Status Badge */}
            <View className="mb-2 flex-row items-center justify-between">
              {showDate && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm font-medium text-gray-700">{dateString}</Text>
                </View>
              )}
              {!showDate && <View />}
              {getStatusBadge()}
            </View>

            {/* Time */}
            <View className="mb-2 flex-row items-center">
              <Ionicons name="time" size={18} color="#16697A" />
              <Text className="ml-2 text-base font-bold text-gray-800">
                {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
            </View>

            {/* User Info (if booked) */}
            {isBooked && schedule.booking.userInfo.fullName && (
              <View className="mb-2 flex-row items-center">
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text className="ml-2 flex-1 text-sm font-medium text-gray-700">
                  {schedule.booking.userInfo.fullName}
                </Text>
              </View>
            )}

            {/* Location (if booked) */}
            {isBooked && schedule.booking.locationName && (
              <View className="mb-2 flex-row items-center">
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text className="ml-2 flex-1 text-sm text-gray-600">
                  {schedule.booking.locationName}
                </Text>
              </View>
            )}

            {/* Price (if booked) */}
            {isBooked && schedule.booking.price && (
              <View className="flex-row items-center">
                <Ionicons name="cash" size={16} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-600">
                  <Text className="font-semibold text-primary">
                    {schedule.booking.price.toLocaleString('vi-VN')} đ
                  </Text>
                </Text>
              </View>
            )}

            {/* Empty slot indicator */}
            {!isBooked && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text className="ml-2 text-sm text-gray-500">Chờ khách hàng đặt lịch</Text>
              </View>
            )}

            {/* Swipe indicator */}
            {canDelete && (
              <View className="mt-2 flex-row items-center justify-end">
                <Ionicons name="chevron-back" size={12} color="#9CA3AF" />
                <Text className="ml-1 text-xs text-gray-400">Vuốt để xóa</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
