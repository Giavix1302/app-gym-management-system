// MessageInputBar Component - Input field for sending messages
// Similar to ChatbotScreen input area

import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function MessageInputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Nhập tin nhắn...',
  disabled = false,
  isLoading = false,
}: MessageInputBarProps) {
  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <View className="border-t border-gray-200 bg-white px-4 py-3">
      <View className="flex-row items-center gap-2">
        {/* Text Input */}
        <View className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
            editable={!disabled && !isLoading}
            className="max-h-24 text-base text-gray-900"
            style={{ minHeight: 20 }}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          activeOpacity={0.7}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            canSend ? 'bg-primary' : 'bg-gray-300'
          }`}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
