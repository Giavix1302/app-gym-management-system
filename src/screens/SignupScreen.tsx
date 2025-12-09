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
import OTPVerificationModal from '../components/modals/OTPVerificationModal';
import { authService } from '../services/authService';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

type UserRole = 'user' | 'pt';

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
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

    if (!password.trim()) {
      notification.warning('Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      notification.warning('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      notification.warning('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);

      // Call signup API
      const response = await authService.signup(phone, password, fullName, role);

      if (response.success) {
        notification.success(response.message || 'Mã OTP đã được gửi đến số điện thoại của bạn');
        setShowOtpModal(true);
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle error messages
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 400:
            notification.error(errorMessage || 'Thông tin đăng ký không hợp lệ');
            break;
          case 409:
            notification.error(errorMessage || 'Số điện thoại đã được đăng ký');
            break;
          case 500:
            notification.error('Lỗi server, vui lòng thử lại sau');
            break;
          default:
            notification.error(errorMessage || 'Đăng ký thất bại, vui lòng thử lại');
        }
      } else if (error.request) {
        notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        notification.error(error.message || 'Đã xảy ra lỗi, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    try {
      const response = await authService.verifyOtp(phone, code);

      if (response.success) {
        notification.success(response.message || 'Đăng ký thành công!');
        setShowOtpModal(false);

        // Auto login and navigate based on role
        setTimeout(() => {
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
        }, 500);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 400:
            notification.error(errorMessage || 'Mã OTP không hợp lệ');
            break;
          case 401:
            notification.error(errorMessage || 'Mã OTP không đúng hoặc đã hết hạn');
            break;
          case 500:
            notification.error('Lỗi server, vui lòng thử lại sau');
            break;
          default:
            notification.error(errorMessage || 'Xác thực thất bại, vui lòng thử lại');
        }
      } else if (error.request) {
        notification.error('Không thể kết nối đến server');
      } else {
        notification.error(error.message || 'Đã xảy ra lỗi');
      }

      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleResendOtp = async () => {
    try {
      // Resend OTP by calling signup API again
      const response = await authService.signup(phone, password, fullName, role);

      if (response.success) {
        notification.success('Mã OTP mới đã được gửi');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);

      if (error.response) {
        const errorMessage = error.response.data?.message;
        notification.error(errorMessage || 'Gửi lại mã OTP thất bại');
      } else {
        notification.error('Không thể gửi lại mã OTP');
      }

      throw error;
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
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
                Họ và tên <Text className="text-error">*</Text>
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
                Số điện thoại <Text className="text-error">*</Text>
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

            {/* Role Picker */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Loại tài khoản <Text className="text-error">*</Text>
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    role === 'user'
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setRole('user')}
                  disabled={loading}
                >
                  <Text
                    className={`text-center font-semibold ${
                      role === 'user' ? 'text-white' : 'text-textSecondary'
                    }`}
                  >
                    Thành viên
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    role === 'pt'
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setRole('pt')}
                  disabled={loading}
                >
                  <Text
                    className={`text-center font-semibold ${
                      role === 'pt' ? 'text-white' : 'text-textSecondary'
                    }`}
                  >
                    Huấn luyện viên
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-2">
                Mật khẩu <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
                Xác nhận mật khẩu <Text className="text-error">*</Text>
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
              title={loading ? 'Đang xử lý...' : 'Đăng ký'}
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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        visible={showOtpModal}
        phone={phone}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={handleCloseOtpModal}
        title="Xác thực tài khoản"
        description="Vui lòng nhập mã OTP đã được gửi đến số điện thoại"
      />
    </KeyboardAvoidingView>
  );
}
