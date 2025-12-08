import React from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVNPay: () => void;
}

type PaymentMethod = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  available: boolean;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: 'card-outline',
    color: '#0066B2',
    available: true,
  },
  {
    id: 'momo',
    name: 'Momo',
    icon: 'wallet-outline',
    color: '#A50064',
    available: false,
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business-outline',
    color: '#16697A',
    available: false,
  },
];

export default function PaymentMethodModal({
  visible,
  onClose,
  onSelectVNPay,
}: PaymentMethodModalProps) {
  const handleSelectMethod = (method: PaymentMethod) => {
    if (method.available) {
      if (method.id === 'vnpay') {
        onSelectVNPay();
      }
    } else {
      Alert.alert(
        'Thông báo',
        `Phương thức thanh toán ${method.name} đang được phát triển.`,
        [{ text: 'Đóng' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              Chọn phương thức thanh toán
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Payment Methods */}
          <View className="px-6 py-4">
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
                  method.available
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onPress={() => handleSelectMethod(method)}
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${method.color}15` }}
                >
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={method.color}
                  />
                </View>

                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-gray-800">
                    {method.name}
                  </Text>
                  {!method.available && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Đang phát triển
                    </Text>
                  )}
                </View>

                {method.available ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#16697A"
                  />
                ) : (
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom padding for safe area */}
          <View className="h-6" />
        </View>
      </View>
    </Modal>
  );
}
