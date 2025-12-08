import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MembershipPackage } from '../types/api';

interface MembershipPackageCardProps {
  package: MembershipPackage;
  onPress?: () => void;
}

export default function MembershipPackageCard({ package: pkg, onPress }: MembershipPackageCardProps) {
  const discountedPrice = pkg.price - (pkg.price * pkg.discount / 100);
  const hasDiscount = pkg.discount > 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 mx-4"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Banner Image */}
      <View className="relative">
        {pkg.bannerURL ? (
          <Image
            source={{ uri: pkg.bannerURL }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-primary justify-center items-center">
            <Ionicons name="barbell" size={60} color="#FFFFFF" />
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-3 right-3 bg-red-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              Giảm {pkg.discount}%
            </Text>
          </View>
        )}

        {/* Duration Badge */}
        <View className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold ml-1">
            {pkg.durationMonth} tháng
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Package Name */}
        <Text className="text-lg font-bold text-gray-800 mb-2">
          {pkg.name}
        </Text>

        {/* Description */}
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {pkg.description}
        </Text>

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <View className="mb-3 space-y-1">
            {pkg.features.slice(0, 3).map((feature, index) => (
              <View key={index} className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#16697A" className="mt-0.5" />
                <Text className="text-xs text-gray-600 ml-2 flex-1">
                  {feature}
                </Text>
              </View>
            ))}
            {pkg.features.length > 3 && (
              <Text className="text-xs text-primary ml-5">
                +{pkg.features.length - 3} tiện ích khác
              </Text>
            )}
          </View>
        )}

        {/* Price Section */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View>
            {hasDiscount && (
              <Text className="text-sm text-gray-400 line-through mb-1">
                {pkg.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
            <Text className="text-2xl font-bold text-primary">
              {discountedPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {/* Members count */}
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {pkg.totalUsers} thành viên
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
