import React from 'react';
import { View, Text } from 'react-native';
import { RateLimitInfo } from '../../services/chatbotService';

interface RateLimitBadgeProps {
  rateLimitInfo: RateLimitInfo | null;
}

export default function RateLimitBadge({ rateLimitInfo }: RateLimitBadgeProps) {
  if (!rateLimitInfo) return null;

  const { remaining, limit } = rateLimitInfo;
  const percentRemaining = (remaining / limit) * 100;

  // Determine color based on remaining percentage
  const getColorClass = () => {
    if (percentRemaining <= 20) return 'bg-error/10 border-error/30';
    if (percentRemaining <= 50) return 'bg-warning/10 border-warning/30';
    return 'bg-success/10 border-success/30';
  };

  const getTextColor = () => {
    if (percentRemaining <= 20) return 'text-error';
    if (percentRemaining <= 50) return 'text-warning';
    return 'text-success';
  };

  return (
    <View className={`border ${getColorClass()} rounded-full px-3 py-1.5`}>
      <Text className={`text-xs font-medium ${getTextColor()}`}>
        Còn {remaining}/{limit} lượt hỏi
      </Text>
    </View>
  );
}
