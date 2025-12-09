import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { membershipService } from '../services/membershipService';
import { getUser, getTrainer, saveMyMembership } from '../utils/storage';
import { useNotification } from '../context/NotificationContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();
  const [loading, setLoading] = useState(true);

  // Gọi API để lấy subscription mới và lưu vào AsyncStorage
  useEffect(() => {
    const fetchAndSaveSubscription = async () => {
      try {
        // Lấy thông tin user
        const user = await getUser();
        const trainer = await getTrainer();
        const userInfo = user || trainer;

        if (!userInfo || !userInfo._id) {
          showError('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        // Gọi API để lấy subscription mới
        const membership = await membershipService.getSubscriptionByUserId(userInfo._id);

        // Lưu vào AsyncStorage
        await saveMyMembership(membership);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        showError('Không thể tải thông tin . Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchAndSaveSubscription();
  }, [showError]);

  const handleBackToMembership = () => {
    // Reset về tab chính
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserTabs' }], // hoặc PTTabs tùy role
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="mt-4 text-gray-600">Đang xử lý thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="mb-6 h-32 w-32 items-center justify-center rounded-full bg-green-100">
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text className="mb-3 text-center text-3xl font-bold text-gray-800">
          Thanh toán thành công!
        </Text>

        <Text className="mb-8 text-center text-base leading-6 text-gray-600">
          Dịch vụ của bạn đã được kích hoạt thành công.{'\n'}
          Bạn có thể bắt đầu sử dụng ngay bây giờ.
        </Text>

        {/* Success Details */}
        <View className="mb-8 w-full rounded-2xl border border-green-200 bg-green-50 p-4">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#10B981" />
            <Text className="ml-2 text-sm font-semibold text-green-800">Thông tin giao dịch</Text>
          </View>
          <Text className="text-sm leading-5 text-green-700">
            Giao dịch đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            className="items-center rounded-xl bg-primary py-4"
            onPress={handleBackToMembership}
            activeOpacity={0.8}>
            <View className="flex-row items-center">
              <Ionicons name="fitness" size={20} color="#FFFFFF" />
              <Text className="ml-2 text-base font-bold text-white">Quay về trang chủ</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
