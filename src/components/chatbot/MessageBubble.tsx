import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage } from '../../services/chatbotService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const timestamp = new Date(message.timestamp);
  const timeString = timestamp.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Split content by newlines to preserve formatting
  const contentLines = message.content.split('\n');

  return (
    <View
      className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Icon */}
      {!isUser && (
        <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
          <FontAwesome5 name="robot" size={16} color="white" />
        </View>
      )}

      {/* Message Bubble */}
      <View className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary rounded-tr-sm'
              : 'bg-gray-100 rounded-tl-sm'
          }`}>
          {contentLines.map((line, index) => (
            <Text
              key={index}
              className={`text-sm leading-5 ${
                isUser ? 'text-white' : 'text-gray-800'
              }`}>
              {line}
            </Text>
          ))}
        </View>

        {/* Timestamp */}
        <Text className="mt-1 px-1 text-xs text-gray-400">{timeString}</Text>
      </View>

      {/* User Icon */}
      {isUser && (
        <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <FontAwesome5 name="user" size={16} color="#16697A" />
        </View>
      )}
    </View>
  );
}
