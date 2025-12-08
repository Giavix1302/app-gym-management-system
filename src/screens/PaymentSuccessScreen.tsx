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
        showError('Không thể tải thông tin gói tập. Vui lòng thử lại sau.');
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="text-gray-600 mt-4">Đang xử lý thông tin gói tập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Success Icon */}
        <View className="w-32 h-32 rounded-full bg-green-100 justify-center items-center mb-6">
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
          Thanh toán thành công!
        </Text>

        <Text className="text-base text-gray-600 text-center mb-8 leading-6">
          Gói tập của bạn đã được kích hoạt thành công.{'\n'}
          Bạn có thể bắt đầu sử dụng ngay bây giờ.
        </Text>

        {/* Success Details */}
        <View className="bg-green-50 rounded-2xl p-4 mb-8 w-full border border-green-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#10B981" />
            <Text className="text-sm font-semibold text-green-800 ml-2">
              Thông tin giao dịch
            </Text>
          </View>
          <Text className="text-sm text-green-700 leading-5">
            Giao dịch đã được xử lý thành công. Vui lòng kiểm tra gói tập của bạn trong mục "Gói tập của tôi".
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center"
            onPress={handleBackToMembership}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="fitness" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">
                Xem gói tập của tôi
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
