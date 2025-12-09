import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupedBooking } from '../../types/booking';

interface BookingCardProps {
  groupedBooking: GroupedBooking;
  bookingType: 'upcoming' | 'history';
  onPress: (trainerId: string) => void;
}

export default function BookingCard({ groupedBooking, bookingType, onPress }: BookingCardProps) {
  const { trainer, allSessions } = groupedBooking;
  console.log('🚀 ~ BookingCard ~ allSessions:', allSessions);
  const sessionCount = allSessions?.length ?? 0;

  return (
    <TouchableOpacity
      className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      onPress={() => onPress(trainer.trainerId)}
      activeOpacity={0.8}>
      <View className="flex-row items-center p-4">
        {/* Avatar */}
        <View className="mr-3">
          {trainer.userInfo.avatar ? (
            <Image
              source={{ uri: trainer.userInfo.avatar }}
              className="h-16 w-16 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="person" size={32} color="#16697A" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="mb-1 text-lg font-bold text-gray-800">{trainer.userInfo.fullName}</Text>

          {/* Specialization */}
          <View className="mb-1 flex-row items-center">
            <Ionicons name="barbell" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm capitalize text-gray-600">{trainer.specialization}</Text>
          </View>

          {/* Session Count & Rating */}
          <View className="flex-row items-center">
            <View className="mr-3 flex-row items-center">
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-600">{sessionCount} buổi tập</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-sm text-gray-600">
                {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'Chưa có'}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}
