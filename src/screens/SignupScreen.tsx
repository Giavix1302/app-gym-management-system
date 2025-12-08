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

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim()) {
      notification.warning('Vui lòng nhập họ tên');
      return;
    }

    if (!phone.trim()) {
      notification.warning('Vui lòng nhập số điện thoại');
      return;
    }

    if (!email.trim()) {
      notification.warning('Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      notification.warning('Vui lòng nhập mật khẩu');
      return;
    }

    if (password !== confirmPassword) {
      notification.warning('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      notification.warning('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement signup API call
      // const response = await axiosPublic.post('/auth/register', {
      //   fullName,
      //   phone,
      //   email,
      //   password,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      notification.success('Đăng ký thành công! Vui lòng đăng nhập');

      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      notification.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo & Title */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-primary mb-2">
              THE GYM
            </Text>
            <Text className="text-lg text-textSecondary">Đăng ký tài khoản</Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Full Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Họ và tên
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

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
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Email
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Xác nhận mật khẩu
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Signup Button */}
            <PrimaryButton
              title={loading ? 'Đang đăng ký...' : 'Đăng ký'}
              onPress={handleSignup}
              disabled={loading}
            />
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-textSecondary text-sm">
              Đã có tài khoản?{' '}
            </Text>
            <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
              <Text className="text-primary font-semibold text-sm">
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
