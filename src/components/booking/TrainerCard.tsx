import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerWithSlots } from '../../types/booking';
import SlotButton from './SlotButton';
import { formatPrice } from '../../utils/bookingHelpers';

interface TrainerCardProps {
  trainer: TrainerWithSlots;
  onPress: (trainer: TrainerWithSlots) => void;
  onSlotPress?: (trainerId: string, slot: any) => void;
}

export default function TrainerCard({ trainer, onPress, onSlotPress }: TrainerCardProps) {
  const { userInfo, trainerInfo, review, availableSlots } = trainer;
  const pricePerHour =
    typeof trainerInfo.pricePerHour === 'string'
      ? parseInt(trainerInfo.pricePerHour, 10)
      : trainerInfo.pricePerHour;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
      onPress={() => onPress(trainer)}
      activeOpacity={0.8}
    >
      {/* Header with Trainer Info */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        {/* Avatar */}
        <View className="mr-3">
          {userInfo.avatar ? (
            <Image
              source={{ uri: userInfo.avatar }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="person" size={32} color="#16697A" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {userInfo.fullName}
          </Text>

          {/* Specialization */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="barbell" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1 capitalize">
              {trainerInfo.specialization}
            </Text>
          </View>

          {/* Rating & Price */}
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-3">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-1">
                {review.rating > 0 ? review.rating.toFixed(1) : 'Chưa có'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="cash" size={14} color="#6B7280" />
              <Text className="text-sm font-semibold text-primary ml-1">
                {formatPrice(pricePerHour)}/giờ
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
      </View>

      {/* Available Slots */}
      <View className="p-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Lịch trống ({availableSlots.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {availableSlots.map((slot) => (
              <SlotButton
                key={slot._id}
                slot={slot}
                onPress={(s) => onSlotPress?.(trainer._id, s) || onPress(trainer)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}
