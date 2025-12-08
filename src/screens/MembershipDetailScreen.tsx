import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMyMembership, getUser, getTrainer, removeMyMembership } from '../utils/storage';
import { membershipService } from '../services/membershipService';
import { useNotification } from '../context/NotificationContext';
import PaymentMethodModal from '../components/PaymentMethodModal';

type MembershipDetailRouteProp = RouteProp<RootStackParamList, 'MembershipDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MembershipDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MembershipDetailRouteProp>();
  const { membership, package: pkg, isMyMembership } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const data = isMyMembership ? membership : pkg;

  const handleRegister = async () => {
    try {
      setLoading(true);

      // Kiểm tra xem người dùng đã có gói tập chưa
      const currentMembership = await getMyMembership();
      console.log("🚀 ~ handleRegister ~ currentMembership:", currentMembership)
      const hasActiveMembership = currentMembership && currentMembership.name && currentMembership.name !== '';

      if (hasActiveMembership) {
        // Người dùng đã có gói tập, hiện confirm xóa
        Alert.alert(
          'Xác nhận đổi gói tập',
          'Bạn đang có gói tập hiện tại. Bạn có muốn hủy gói hiện tại và đăng ký gói mới?',
          [
            { text: 'Không', style: 'cancel', onPress: () => setLoading(false) },
            {
              text: 'Đồng ý',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Xóa gói tập hiện tại
                  console.log("🚀 ~ handleRegister ~ currentMembership._id:", currentMembership._id)
                  await membershipService.deleteSubscription(currentMembership._id);

                  // Xóa myMembership khỏi AsyncStorage
                  await removeMyMembership();

                  // Hiện modal chọn phương thức thanh toán
                  setShowPaymentModal(true);
                  setLoading(false);
                } catch (error) {
                  console.error('Error deleting subscription:', error);
                  showError('Không thể hủy gói tập hiện tại. Vui lòng thử lại.');
                  setLoading(false);
                }
              },
            },
          ]
        );
      } else {
        // Người dùng chưa có gói tập, hiện modal thanh toán luôn
        setShowPaymentModal(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      showError('Có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleSelectVNPay = async () => {
    try {
      setShowPaymentModal(false);
      setLoading(true);

      // Lấy thông tin user hoặc trainer
      const user = await getUser();
      const trainer = await getTrainer();
      const userInfo = user || trainer;

      if (!userInfo || !userInfo._id) {
        showError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      // Gọi API tạo link thanh toán VNPay
      const response = await membershipService.createVnpayLink({
        userId: userInfo._id,
        membershipId: pkg._id,
      });

      if (response.success && response.paymentUrl) {
        // Navigate đến WebView để thanh toán
        navigation.navigate('VNPayWebView', {
          paymentUrl: response.paymentUrl,
        });
      } else {
        showError('Không thể tạo link thanh toán. Vui lòng thử lại.');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error creating VNPay link:', error);
      showError('Có lỗi xảy ra khi tạo link thanh toán. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Hủy gói tập',
      'Bạn có chắc chắn muốn hủy gói tập hiện tại?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy gói',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const membership = await getMyMembership();
              console.log("🚀 ~ handleCancel ~ membership:", membership)
              // Gọi API xóa subscription
              console.log("🚀 ~ handleCancel ~ membership._id:", membership._id)
              const response = await membershipService.deleteSubscription(membership._id);

              if (response.success) {
                // Xóa myMembership trong AsyncStorage
                await removeMyMembership();

                showSuccess('Hủy gói tập thành công!');

                // Navigate về MembershipTab
                setTimeout(() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'UserTabs' }], // hoặc PTTabs
                  });
                }, 1000);
              } else {
                showError('Không thể hủy gói tập. Vui lòng thử lại.');
              }

              setLoading(false);
            } catch (error) {
              console.error('Error canceling membership:', error);
              showError('Có lỗi xảy ra khi hủy gói tập. Vui lòng thử lại.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const discountedPrice = pkg ? pkg.price - (pkg.price * pkg.discount / 100) : 0;
  const hasDiscount = pkg && pkg.discount > 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Chi tiết gói tập
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <View className="relative">
          {data.bannerURL ? (
            <Image
              source={{ uri: data.bannerURL }}
              className="w-full h-64"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 bg-primary justify-center items-center">
              <Ionicons name="barbell" size={80} color="#FFFFFF" />
            </View>
          )}

          {/* Badges */}
          {isMyMembership ? (
            <View className="absolute top-4 right-4 bg-green-500 px-4 py-2 rounded-full">
              <Text className="text-white text-sm font-bold">Gói của tôi</Text>
            </View>
          ) : hasDiscount ? (
            <View className="absolute top-4 right-4 bg-red-500 px-4 py-2 rounded-full">
              <Text className="text-white text-sm font-bold">Giảm {pkg.discount}%</Text>
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Package Name */}
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {data.name}
          </Text>

          {/* Duration */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="time-outline" size={20} color="#16697A" />
            <Text className="text-base text-gray-600 ml-2 font-medium">
              Thời hạn: {data.durationMonth} tháng
            </Text>
          </View>

          {/* Price Section (for packages) */}
          {!isMyMembership && pkg && (
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
              <Text className="text-sm text-gray-600 mb-2">Giá gói tập</Text>
              {hasDiscount && (
                <Text className="text-base text-gray-400 line-through mb-1">
                  {pkg.price.toLocaleString('vi-VN')}đ
                </Text>
              )}
              <Text className="text-3xl font-bold text-primary">
                {discountedPrice.toLocaleString('vi-VN')}đ
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {pkg.totalUsers} người đã đăng ký
                </Text>
              </View>
            </View>
          )}

          {/* My Membership Info */}
          {isMyMembership && membership && (
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
              <Text className="text-sm text-gray-600 mb-3">Thông tin gói tập</Text>

              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={18} color="#16697A" />
                    <Text className="text-sm text-gray-600 ml-2">Hết hạn</Text>
                  </View>
                  <Text className="text-sm font-semibold text-gray-800">
                    {membership.endDate ? format(new Date(membership.endDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle-outline" size={18} color="#16697A" />
                    <Text className="text-sm text-gray-600 ml-2">Số lần checkin</Text>
                  </View>
                  <Text className="text-sm font-semibold text-gray-800">
                    {membership.totalCheckin || 0} lần
                  </Text>
                </View>

                {membership.remainingSessions > 0 && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="fitness-outline" size={18} color="#16697A" />
                      <Text className="text-sm text-gray-600 ml-2">Buổi tập còn lại</Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-800">
                      {membership.remainingSessions} buổi
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="pulse-outline" size={18} color="#16697A" />
                    <Text className="text-sm text-gray-600 ml-2">Trạng thái</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    membership.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      membership.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {membership.status === 'active' ? 'Đang hoạt động' : membership.status || 'Không hoạt động'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Description */}
          {pkg && pkg.description && (
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-2">Mô tả</Text>
              <Text className="text-base text-gray-600 leading-6">
                {pkg.description}
              </Text>
            </View>
          )}

          {/* Features */}
          {pkg && pkg.features && pkg.features.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-3">Tiện ích</Text>
              <View className="bg-white rounded-2xl p-4 border border-gray-200">
                {pkg.features.map((feature, index) => (
                  <View key={index} className="flex-row items-start mb-3 last:mb-0">
                    <Ionicons name="checkmark-circle" size={20} color="#16697A" className="mt-0.5" />
                    <Text className="text-base text-gray-700 ml-3 flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="bg-white border-t border-gray-200 p-4">
        {isMyMembership ? (
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-xl items-center"
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Hủy gói tập</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center"
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-base font-bold ml-2">Đăng ký gói tập</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectVNPay={handleSelectVNPay}
      />
    </SafeAreaView>
  );
}
