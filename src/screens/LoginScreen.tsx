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

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

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
      // Error already handled by axios interceptor
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
            <Text className="text-lg text-textSecondary">
              Chào mừng bạn trở lại
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Phone Input */}
            <View className="mb-4">
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

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Mật khẩu
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
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
              className="self-end mb-6"
            >
              <Text className="text-primary font-semibold text-sm">
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <PrimaryButton
              title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>

          {/* Signup Link */}
          <View className="flex-row justify-center items-center mb-4">
            <Text className="text-textSecondary text-sm">
              Chưa có tài khoản?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignup} disabled={loading}>
              <Text className="text-primary font-semibold text-sm">
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test API Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('LocationsTest')}
            disabled={loading}
            className="py-3 px-6 bg-gray-200 rounded-lg"
          >
            <Text className="text-center text-textPrimary font-semibold">
              🧪 Test Locations API
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
