import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/context/NotificationContext';

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
  const notification = useNotification();
  const VNPAY_TEST_CARD = '9704198526191432198';

  const handleSelectMethod = async (method: PaymentMethod) => {
    if (method.available) {
      if (method.id === 'vnpay') {
        // Copy số thẻ test vào clipboard
        await Clipboard.setStringAsync(VNPAY_TEST_CARD);
        notification.success('Đã copy số thẻ test vào clipboard');
        onSelectVNPay();
      }
    } else {
      notification.warning(`Phương thức thanh toán ${method.name} đang được phát triển.`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-gray-800">Chọn phương thức thanh toán</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Warning Notice */}
          <View className="mx-6 mb-2 mt-4 flex-row items-start rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <View className="ml-2 flex-1">
              <Text className="mb-1 text-sm font-semibold text-amber-800">
                Vui lòng thanh toán trong 10 phút
              </Text>
              <Text className="text-xs text-amber-700">
                Booking sẽ tự động hủy nếu không thanh toán trong thời gian quy định
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View className="px-6 py-4">
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`mb-3 flex-row items-center rounded-2xl border-2 p-4 ${
                  method.available ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'
                }`}
                onPress={() => handleSelectMethod(method)}
                activeOpacity={0.7}>
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${method.color}15` }}>
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-base font-semibold text-gray-800">{method.name}</Text>
                  {!method.available && (
                    <Text className="mt-1 text-xs text-gray-500">Đang phát triển</Text>
                  )}
                </View>

                {method.available ? (
                  <Ionicons name="checkmark-circle" size={24} color="#16697A" />
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
