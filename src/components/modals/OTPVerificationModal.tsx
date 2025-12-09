import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';

interface OTPVerificationModalProps {
  visible: boolean;
  phone: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function OTPVerificationModal({
  visible,
  phone,
  onVerify,
  onResend,
  onClose,
  title = 'Xác thực OTP',
  description = 'Vui lòng nhập mã OTP đã được gửi đến số điện thoại',
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (!visible) {
      setTimeLeft(300);
      return;
    }

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, timeLeft]);

  // Reset OTP when modal opens
  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300);
    }
  }, [visible]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
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
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      return;
    }

    try {
      setLoading(true);
      await onVerify(otpCode);
    } catch (error) {
      // Error handling is done in parent component
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await onResend();
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300); // Reset timer
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend OTP failed:', error);
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    // Format: +84987654321 -> *******4321
    if (phoneNumber.length > 4) {
      return '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4);
    }
    return phoneNumber;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md">
          {/* Header */}
          <Text className="text-2xl font-bold text-textPrimary text-center mb-2">
            {title}
          </Text>
          <Text className="text-sm text-textSecondary text-center mb-1">
            {description}
          </Text>
          <Text className="text-sm font-semibold text-primary text-center mb-6">
            {formatPhoneDisplay(phone)}
          </Text>

          {/* OTP Inputs */}
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold text-textPrimary bg-white"
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading && !resending}
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

          {/* Verify Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${
              loading || otp.some((d) => !d)
                ? 'bg-gray-300'
                : 'bg-primary'
            }`}
            onPress={() => handleVerify()}
            disabled={loading || otp.some((d) => !d)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Xác nhận
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            className="py-3"
            onPress={handleResend}
            disabled={resending || timeLeft > 0}
          >
            {resending ? (
              <ActivityIndicator color="#FF6B6B" size="small" />
            ) : (
              <Text
                className={`text-center font-semibold ${
                  timeLeft > 0 ? 'text-gray-400' : 'text-primary'
                }`}
              >
                {timeLeft > 0 ? 'Gửi lại mã OTP' : 'Gửi lại mã OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            className="py-3 mt-2"
            onPress={onClose}
            disabled={loading || resending}
          >
            <Text className="text-center text-textSecondary font-semibold">
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
