import React, { useState, useRef, useEffect } from 'react';
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
import { authService } from '../services/authService';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

type Step = 1 | 2 | 3;

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const notification = useNotification();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for OTP
  useEffect(() => {
    if (currentStep !== 2) return;

    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      notification.warning('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPasswordSendOtp(phone);

      if (response.success) {
        notification.success(response.message || 'Mã OTP đã được gửi đến số điện thoại của bạn');
        setCurrentStep(2);
        setTimeLeft(300); // Reset timer
        setCanResend(false);
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 404:
            notification.error(errorMessage || 'Số điện thoại không tồn tại trong hệ thống');
            break;
          case 400:
            notification.error(errorMessage || 'Số điện thoại không hợp lệ');
            break;
          case 500:
            notification.error('Lỗi server, vui lòng thử lại sau');
            break;
          default:
            notification.error(errorMessage || 'Gửi mã OTP thất bại, vui lòng thử lại');
        }
      } else if (error.request) {
        notification.error('Không thể kết nối đến server');
      } else {
        notification.error(error.message || 'Đã xảy ra lỗi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits are filled
    if (value && index === 5 && newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      notification.warning('Vui lòng nhập đủ 6 số mã OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPasswordVerifyOtp(phone, otpCode);

      if (response.success) {
        notification.success(response.message || 'Xác thực thành công');
        setCurrentStep(3);
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);

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

      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const response = await authService.forgotPasswordSendOtp(phone);

      if (response.success) {
        notification.success('Mã OTP mới đã được gửi');
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(300);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message;
        notification.error(errorMessage || 'Gửi lại mã OTP thất bại');
      } else {
        notification.error('Không thể gửi lại mã OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      notification.warning('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      notification.warning('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      notification.warning('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPassword(phone, newPassword);

      if (response.success) {
        notification.success(response.message || 'Đặt lại mật khẩu thành công!');

        // Navigate to login after 1.5 seconds
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 400:
            notification.error(errorMessage || 'Thông tin không hợp lệ');
            break;
          case 500:
            notification.error('Lỗi server, vui lòng thử lại sau');
            break;
          default:
            notification.error(errorMessage || 'Đặt lại mật khẩu thất bại');
        }
      } else if (error.request) {
        notification.error('Không thể kết nối đến server');
      } else {
        notification.error(error.message || 'Đã xảy ra lỗi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-8">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentStep >= step ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <Text
              className={`font-bold ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}
            >
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View
              className={`w-16 h-1 ${currentStep > step ? 'bg-primary' : 'bg-gray-300'}`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-bold text-textPrimary text-center mb-2">
        Quên mật khẩu
      </Text>
      <Text className="text-sm text-textSecondary text-center mb-8">
        Nhập số điện thoại của bạn để nhận mã OTP
      </Text>

      <View className="mb-6">
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
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <PrimaryButton
        title={loading ? 'Đang xử lý...' : 'Gửi mã OTP'}
        onPress={handleSendOtp}
        disabled={loading}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-2xl font-bold text-textPrimary text-center mb-2">
        Xác thực OTP
      </Text>
      <Text className="text-sm text-textSecondary text-center mb-1">
        Vui lòng nhập mã OTP đã được gửi đến
      </Text>
      <Text className="text-sm font-semibold text-primary text-center mb-8">{phone}</Text>

      {/* OTP Inputs */}
      <View className="flex-row justify-between mb-6">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold text-textPrimary bg-white"
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!loading}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Timer */}
      <View className="mb-6">
        <Text
          className={`text-center text-sm font-semibold ${
            timeLeft > 0 ? 'text-primary' : 'text-error'
          }`}
        >
          {timeLeft > 0
            ? `Mã OTP sẽ hết hạn sau ${formatTime(timeLeft)}`
            : 'Mã OTP đã hết hạn'}
        </Text>
      </View>

      <PrimaryButton
        title={loading ? 'Đang xác thực...' : 'Xác nhận'}
        onPress={() => handleVerifyOtp()}
        disabled={loading || otp.some((d) => !d)}
      />

      {/* Resend OTP */}
      <TouchableOpacity className="py-4 mt-4" onPress={handleResendOtp} disabled={!canResend || loading}>
        <Text
          className={`text-center font-semibold ${
            canResend && !loading ? 'text-primary' : 'text-gray-400'
          }`}
        >
          Gửi lại mã OTP
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-2xl font-bold text-textPrimary text-center mb-2">
        Đặt lại mật khẩu
      </Text>
      <Text className="text-sm text-textSecondary text-center mb-8">
        Vui lòng nhập mật khẩu mới của bạn
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-textPrimary mb-2">
          Mật khẩu mới <Text className="text-error">*</Text>
        </Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
          placeholderTextColor="#9CA3AF"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-semibold text-textPrimary mb-2">
          Xác nhận mật khẩu <Text className="text-error">*</Text>
        </Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
          placeholder="Nhập lại mật khẩu mới"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <PrimaryButton
        title={loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        onPress={handleResetPassword}
        disabled={loading}
      />
    </View>
  );

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
          {/* Logo */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-primary mb-4">THE GYM</Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Back to Login Link */}
          {currentStep === 1 && (
            <View className="flex-row justify-center items-center mt-6">
              <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
                <Text className="text-primary font-semibold text-sm">← Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
