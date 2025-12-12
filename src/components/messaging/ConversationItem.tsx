// ConversationItem Component - Display conversation in list
// Similar pattern to booking cards

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../../types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarSource, getInitials } from '../../utils/avatar';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserRole: 'user' | 'trainer';
  onPress: () => void;
}

export default function ConversationItem({
  conversation,
  currentUserId,
  currentUserRole,
  onPress,
}: ConversationItemProps) {
  // Determine the other participant (not the current user)
  const otherParticipant =
    currentUserRole === 'user'
      ? {
          fullName: conversation.trainerInfo.fullName,
          avatar: conversation.trainerInfo.avatar,
        }
      : {
          fullName: conversation.userInfo.fullName,
          avatar: conversation.userInfo.avatar,
        };

  const avatarSource = getAvatarSource(otherParticipant.avatar);
  const initials = getInitials(otherParticipant.fullName);

  // Format last message timestamp
  const lastMessageTime = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
        addSuffix: true,
        locale: vi,
      })
    : '';

  // Check if last message is from current user (assuming we'll get this from API later)
  const isLastMessageFromMe = false; // Will be determined from actual message data

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-gray-100 bg-white p-4">
      {/* Avatar */}
      <View className="relative">
        {avatarSource ? (
          <Image
            source={avatarSource}
            className="h-14 w-14 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Text className="text-lg font-bold text-white">{initials}</Text>
          </View>
        )}

        {/* Role badge */}
        <View
          className={`absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
            currentUserRole === 'user' ? 'bg-primary' : 'bg-green-500'
          }`}>
          <Ionicons
            name={currentUserRole === 'user' ? 'barbell' : 'person'}
            size={12}
            color="#fff"
          />
        </View>
      </View>

      {/* Conversation Info */}
      <View className="ml-3 flex-1">
        {/* Name */}
        <Text className="text-base font-semibold text-gray-900">
          {otherParticipant.fullName}
        </Text>

        {/* Last Message */}
        <View className="mt-1 flex-row items-center">
          {isLastMessageFromMe && (
            <Text className="mr-1 text-xs text-gray-500">Bạn: </Text>
          )}
          <Text
            className={`flex-1 text-sm ${
              conversation.unreadCount > 0 && !isLastMessageFromMe
                ? 'font-semibold text-gray-900'
                : 'text-gray-600'
            }`}
            numberOfLines={1}>
            {conversation.lastMessage || 'Chưa có tin nhắn'}
          </Text>
        </View>

        {/* Timestamp */}
        <Text className="mt-1 text-xs text-gray-400">{lastMessageTime}</Text>
      </View>

      {/* Right Side - Unread Badge */}
      <View className="ml-2 items-center">
        {conversation.unreadCount > 0 && !isLastMessageFromMe && (
          <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2">
            <Text className="text-xs font-bold text-white">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Text>
          </View>
        )}

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9ca3af"
          style={{ marginTop: conversation.unreadCount > 0 ? 8 : 0 }}
        />
      </View>
    </TouchableOpacity>
  );
}
