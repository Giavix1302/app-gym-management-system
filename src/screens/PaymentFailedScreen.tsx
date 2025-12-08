import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type PaymentFailedRouteProp = RouteProp<RootStackParamList, 'PaymentFailed'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentFailedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentFailedRouteProp>();
  const { errorMessage } = route.params || {};

  const handleBackToMembership = () => {
    // Reset về tab chính
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserTabs' }], // hoặc PTTabs tùy role
    });
  };

  const handleTryAgain = () => {
    // Quay lại màn hình trước (detail screen để thử lại)
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Error Icon */}
        <View className="w-32 h-32 rounded-full bg-red-100 justify-center items-center mb-6">
          <Ionicons name="close-circle" size={80} color="#EF4444" />
        </View>

        {/* Error Message */}
        <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
          Thanh toán thất bại
        </Text>

        <Text className="text-base text-gray-600 text-center mb-8 leading-6">
          Giao dịch của bạn không thể hoàn tất.{'\n'}
          Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </Text>

        {/* Error Details */}
        {errorMessage && (
          <View className="bg-red-50 rounded-2xl p-4 mb-8 w-full border border-red-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-sm font-semibold text-red-800 ml-2">
                Lý do
              </Text>
            </View>
            <Text className="text-sm text-red-700 leading-5">
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center mb-3"
            onPress={handleTryAgain}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">
                Thử lại
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 py-4 rounded-xl items-center"
            onPress={handleBackToMembership}
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-base font-semibold">
              Quay lại trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
