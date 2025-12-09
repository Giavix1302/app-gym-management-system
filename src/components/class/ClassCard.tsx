import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Class, EnrolledClass } from '../../types/class';
import {
  getClassTypeIcon,
  getClassTypeLabel,
  formatRecurrenceSchedule,
  formatPrice,
} from '../../utils/classHelpers';

interface ClassCardProps {
  classData: Class | EnrolledClass;
  enrolled?: boolean;
  onPress: (classData: Class | EnrolledClass) => void;
}

export default function ClassCard({ classData, enrolled = false, onPress }: ClassCardProps) {
  const {
    name,
    description,
    classType,
    price,
    trainers,
    enrolled: enrolledCount,
    capacity,
    locationName,
    recurrence,
    image,
  } = classData;

  const classTypeIcon = getClassTypeIcon(classType);
  const classTypeLabel = getClassTypeLabel(classType);
  const scheduleText = formatRecurrenceSchedule(recurrence);

  // Get first trainer info
  const trainer = trainers && trainers.length > 0 ? trainers[0] : null;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
      onPress={() => onPress(classData)}
      activeOpacity={0.8}>
      {/* Class Image */}
      {image ? (
        <Image source={{ uri: image }} className="w-full h-40" resizeMode="cover" />
      ) : (
        <View className="w-full h-40 bg-primary/10 items-center justify-center">
          <Ionicons name={classTypeIcon as any} size={48} color="#16697A" />
        </View>
      )}

      {/* Enrolled Badge */}
      {enrolled && (
        <View className="absolute top-3 right-3 bg-success rounded-full px-3 py-1">
          <Text className="text-xs font-bold text-white">Đã đăng ký</Text>
        </View>
      )}

      {/* Class Type Badge */}
      <View className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 flex-row items-center">
        <Ionicons name={classTypeIcon as any} size={12} color="#16697A" />
        <Text className="text-xs font-semibold text-primary ml-1">{classTypeLabel}</Text>
      </View>

      {/* Class Info */}
      <View className="p-4">
        {/* Class Name */}
        <Text className="text-lg font-bold text-gray-800 mb-2">{name}</Text>

        {/* Description */}
        {description && (
          <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Trainer Info */}
        {trainer && (
          <View className="flex-row items-center mb-2">
            {trainer.avatar ? (
              <Image
                source={{ uri: trainer.avatar }}
                className="w-8 h-8 rounded-full mr-2"
                resizeMode="cover"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                <Ionicons name="person" size={16} color="#16697A" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700">{trainer.name}</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-xs text-gray-600 ml-1">
                  {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'Chưa có'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Schedule Info */}
        {scheduleText && (
          <View className="flex-row items-start mb-2">
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 flex-1" numberOfLines={2}>
              {scheduleText}
            </Text>
          </View>
        )}

        {/* Location */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="location" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2 flex-1" numberOfLines={1}>
            {locationName}
          </Text>
        </View>

        {/* Footer: Price & Capacity */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {enrolledCount}/{capacity} người
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary">{formatPrice(price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
