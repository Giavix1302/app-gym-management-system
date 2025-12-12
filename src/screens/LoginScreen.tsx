import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import PrimaryButton from '../components/PrimaryButton';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleLogin = async () => {
    // Validation
    if (!phone.trim()) {
      notification.warning('Vui lòng nhập số điện thoại');
      return;
    }

    if (!password.trim()) {
      notification.warning('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login(phone, password);

      notification.success('Đăng nhập thành công!');

      // Navigate based on role to Bottom Tab Navigators
      if (response.user.role === 'pt') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PTTabs' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserTabs' }],
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Xử lý hiển thị lỗi cho người dùng
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 401:
            notification.error(errorMessage || 'Số điện thoại hoặc mật khẩu không đúng');
            break;
          case 400:
            notification.error(errorMessage || 'Thông tin đăng nhập không hợp lệ');
            break;
          case 500:
            notification.error('Lỗi server, vui lòng thử lại sau');
            break;
          default:
            notification.error(errorMessage || 'Đăng nhập thất bại, vui lòng thử lại');
        }
      } else if (error.request) {
        // Lỗi network (không nhận được response từ server)
        notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        // Lỗi khác
        notification.error(error.message || 'Đã xảy ra lỗi, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-backgroundDefault">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          {/* Logo & Title */}
          <View className="mb-12 items-center">
            <Text className="mb-2 text-4xl font-bold text-primary">THE GYM</Text>
            <Text className="text-lg text-textSecondary">Chào mừng bạn trở lại</Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Phone Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-textPrimary">Số điện thoại</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-textPrimary">Mật khẩu</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              className="mb-6 self-end">
              <Text className="text-sm font-semibold text-primary">Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <PrimaryButton
              title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>

          {/* Signup Link */}
          <View className="mb-4 flex-row items-center justify-center">
            <Text className="text-sm text-textSecondary">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleSignup} disabled={loading}>
              <Text className="text-sm font-semibold text-primary">Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Test API Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('LocationsTest')}
            disabled={loading}
            className="rounded-lg bg-gray-200 px-6 py-3">
            <Text className="text-center font-semibold text-textPrimary">
              🧪 Test Locations API
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
