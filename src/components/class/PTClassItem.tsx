import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PTClass } from '../../types/class';

interface PTClassItemProps {
  class: PTClass;
  onPress: () => void;
  isCompleted?: boolean;
}

export default function PTClassItem({
  class: classData,
  onPress,
  isCompleted = false,
}: PTClassItemProps) {
  const startDate = new Date(classData.startDate);
  const endDate = new Date(classData.endDate);

  const getStatusColor = () => {
    return isCompleted ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-200';
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <View className="rounded-full bg-gray-200 px-3 py-1">
          <Text className="text-xs font-semibold text-gray-700">Đã hoàn thành</Text>
        </View>
      );
    }
    return (
      <View className="rounded-full bg-blue-100 px-3 py-1">
        <Text className="text-xs font-semibold text-blue-700">Đang dạy</Text>
      </View>
    );
  };

  const getClassTypeIcon = () => {
    switch (classData.classType.toLowerCase()) {
      case 'yoga':
        return 'fitness';
      case 'dance':
        return 'musical-notes';
      case 'boxing':
        return 'barbell';
      default:
        return 'barbell';
    }
  };

  return (
    <TouchableOpacity
      className={`mb-3 rounded-2xl border p-4 ${getStatusColor()}`}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Image and Status */}
      <View className="mb-3 flex-row">
        {classData.image && (
          <Image
            source={{ uri: classData.image }}
            className="h-20 w-20 rounded-xl"
            resizeMode="cover"
          />
        )}
        <View className="ml-3 flex-1 justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
              {classData.name}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Ionicons name={getClassTypeIcon()} size={14} color="#6B7280" />
              <Text className="ml-1 text-xs capitalize text-gray-600">{classData.classType}</Text>
            </View>
          </View>
          {getStatusBadge()}
        </View>
      </View>

      {/* Duration */}
      <View className="mb-2 flex-row items-center">
        <Ionicons name="calendar" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-700">
          {format(startDate, 'dd/MM/yyyy', { locale: vi })} -{' '}
          {format(endDate, 'dd/MM/yyyy', { locale: vi })}
        </Text>
      </View>

      {/* Location */}
      <View className="mb-2 flex-row items-center">
        <Ionicons name="location" size={16} color="#6B7280" />
        <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
          {classData.locationInfo.name}
        </Text>
      </View>

      {/* Enrollment */}
      <View className="mb-2 flex-row items-center">
        <Ionicons name="people" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-700">
          {classData.classEnrolled.length}/{classData.capacity} học viên
        </Text>
      </View>

      {/* Price */}
      <View className="flex-row items-center">
        <Ionicons name="cash" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm font-semibold text-primary">
          {classData.price.toLocaleString('vi-VN')} VNĐ
        </Text>
      </View>
    </TouchableOpacity>
  );
}
