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
        <Image
          source={{ uri: membership.bannerURL }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-primary justify-center items-center">
          <Ionicons name="barbell" size={60} color="#FFFFFF" />
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        {/* Badge Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            className={`px-3 py-1 rounded-full ${
              isActive ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {isActive ? 'Đang hoạt động' : membership.status || 'Không hoạt động'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {membership.durationMonth} tháng
            </Text>
          </View>
        </View>

        {/* Package Name */}
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {membership.name || 'Gói tập của tôi'}
        </Text>

        {/* Info Grid */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#16697A" />
            <Text className="text-sm text-gray-600 ml-2">
              Hết hạn: <Text className="font-semibold text-gray-800">{formattedEndDate}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={18} color="#16697A" />
            <Text className="text-sm text-gray-600 ml-2">
              Số lần checkin: <Text className="font-semibold text-gray-800">{membership.totalCheckin || 0}</Text>
            </Text>
          </View>

          {membership.remainingSessions > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="fitness-outline" size={18} color="#16697A" />
              <Text className="text-sm text-gray-600 ml-2">
                Buổi tập còn lại: <Text className="font-semibold text-gray-800">{membership.remainingSessions}</Text>
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
        className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4">
      {cardContent}
    </View>
  );
}
