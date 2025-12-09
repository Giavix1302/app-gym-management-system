import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const confirmBgColor = confirmStyle === 'danger' ? 'bg-red-500' : 'bg-primary';
  const iconName = confirmStyle === 'danger' ? 'warning' : 'information-circle';
  const iconColor = confirmStyle === 'danger' ? '#EF4444' : '#16697A';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-md">
          {/* Icon */}
          <View className="items-center pt-6 pb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Ionicons name={iconName} size={32} color={iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 text-center px-6 mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center px-6 mb-6 leading-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 py-4 border-r border-gray-200"
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4"
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={iconColor} />
              ) : (
                <Text
                  className="text-center text-base font-bold"
                  style={{ color: iconColor }}
                >
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
