import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  iconColor?: string;
  showArrow?: boolean;
  isLogout?: boolean;
}

export default function ProfileMenuItem({
  icon,
  title,
  onPress,
  iconColor = '#16697A',
  showArrow = true,
  isLogout = false,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between py-4 px-4 border-b border-gray-100 ${
        isLogout ? 'bg-red-50' : 'bg-white'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
            isLogout ? 'bg-red-100' : 'bg-blue-50'
          }`}
        >
          <Ionicons
            name={icon}
            size={22}
            color={isLogout ? '#EF4444' : iconColor}
          />
        </View>
        <Text
          className={`text-base font-medium ${
            isLogout ? 'text-red-500 font-semibold' : 'text-gray-800'
          }`}
        >
          {title}
        </Text>
      </View>
      {showArrow && !isLogout && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}
