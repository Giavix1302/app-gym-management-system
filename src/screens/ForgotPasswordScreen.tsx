import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNotification } from '../context/NotificationContext';
import PrimaryButton from '../components/PrimaryButton';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleResetPassword = async () => {
    // Validation
    if (!phone.trim()) {
      notification.warning('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement forgot password API call
      // await axiosPublic.post('/auth/forgot-password', { phone });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      notification.success(
        'Đã gửi hướng dẫn đặt lại mật khẩu đến số điện thoại của bạn'
      );

      // Navigate back to login after 2 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      notification.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-backgroundDefault"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo & Title */}
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-primary mb-2">
              THE GYM
            </Text>
            <Text className="text-lg text-textSecondary">Quên mật khẩu</Text>
            <Text className="text-sm text-textSecondary text-center mt-2">
              Nhập số điện thoại của bạn để nhận hướng dẫn đặt lại mật khẩu
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Phone Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Số điện thoại
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Reset Password Button */}
            <PrimaryButton
              title={loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              onPress={handleResetPassword}
              disabled={loading}
            />
          </View>

          {/* Back to Login Link */}
          <View className="flex-row justify-center items-center">
            <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
              <Text className="text-primary font-semibold text-sm">
                ← Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
