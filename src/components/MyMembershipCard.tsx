import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Membership } from '../types/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MyMembershipCardProps {
  membership: Membership;
  onPress?: () => void;
}

export default function MyMembershipCard({ membership, onPress }: MyMembershipCardProps) {
  const isActive = membership.status === 'active';
  const endDate = membership.endDate ? new Date(membership.endDate) : null;
  const formattedEndDate = endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : '';

  const cardContent = (
    <>
      {/* Banner Image */}
      {membership.bannerURL ? (
        <Image source={{ uri: membership.bannerURL }} className="h-40 w-full" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full items-center justify-center bg-primary">
          <Ionicons name="barbell" size={60} color="#FFFFFF" />
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        {/* Badge Status */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className={`rounded-full px-3 py-1 ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {isActive ? 'Đang hoạt động' : membership.status || 'Không hoạt động'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{membership.durationMonth} tháng</Text>
          </View>
        </View>

        {/* Package Name */}
        <Text className="mb-2 text-xl font-bold text-gray-800">
          {membership.name || 'Gói tập của tôi'}
        </Text>

        {/* Info Grid */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#16697A" />
            <Text className="ml-2 text-sm text-gray-600">
              Hết hạn: <Text className="font-semibold text-gray-800">{formattedEndDate}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={18} color="#16697A" />
            <Text className="ml-2 text-sm text-gray-600">
              Số lần checkin:{' '}
              <Text className="font-semibold text-gray-800">{membership.totalCheckin || 0}</Text>
            </Text>
          </View>

          {membership.remainingSessions > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="fitness-outline" size={18} color="#16697A" />
              <Text className="ml-2 text-sm text-gray-600">
                Buổi tập còn lại:{' '}
                <Text className="font-semibold text-gray-800">{membership.remainingSessions}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
        onPress={onPress}
        activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">{cardContent}</View>
  );
}
