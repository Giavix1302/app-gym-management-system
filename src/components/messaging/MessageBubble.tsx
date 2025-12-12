// MessageBubble Component - For User-PT messaging
// Different from chatbot MessageBubble - shows real avatars

import React from 'react';
import { View, Text, Image } from 'react-native';
import { getAvatarSource, getInitials } from '../../utils/avatar';

interface MessageBubbleProps {
  content: string;
  timestamp: number;
  isOwnMessage: boolean;
  isRead?: boolean;
  otherUserAvatar?: string;
  otherUserName?: string;
}

export default function MessageBubble({
  content,
  timestamp,
  isOwnMessage,
  isRead = false,
  otherUserAvatar,
  otherUserName = '',
}: MessageBubbleProps) {
  const avatarSource = getAvatarSource(otherUserAvatar);
  const initials = getInitials(otherUserName);

  const formatTime = (ts: number) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  return (
    <View
      className={`mb-3 flex-row ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}>
      {/* Avatar - Only for other user's messages */}
      {!isOwnMessage && (
        <View className="mr-2">
          {avatarSource ? (
            <Image
              source={avatarSource}
              className="h-8 w-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Text className="text-xs font-bold text-white">{initials}</Text>
            </View>
          )}
        </View>
      )}

      {/* Message Bubble */}
      <View
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage ? 'bg-primary' : 'bg-gray-100'
        }`}>
        <Text
          className={`text-base ${
            isOwnMessage ? 'text-white' : 'text-gray-900'
          }`}>
          {content}
        </Text>

        {/* Timestamp and Read Status */}
        <Text
          className={`mt-1 text-xs ${
            isOwnMessage ? 'text-white/70' : 'text-gray-500'
          }`}>
          {formatTime(timestamp)}
          {isOwnMessage && (isRead ? ' • ✓✓' : ' • ✓')}
        </Text>
      </View>
    </View>
  );
}
