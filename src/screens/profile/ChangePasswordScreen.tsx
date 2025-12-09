import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../../utils/storage';
import { changePasswordAPI } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const notification = useNotification();

  // ==================== State Management ====================
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/hide password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ==================== Load User ====================
  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const user = await getUser();
      if (user && user._id) {
        setUserId(user._id);
      } else {
        notification.error('Không tìm thấy thông tin người dùng');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      notification.error('Không thể tải thông tin người dùng');
    }
  };

  // ==================== Validation ====================
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate old password
    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (newPassword === oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== Submit Handler ====================
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userId) {
      notification.error('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setLoading(true);

      const response = await changePasswordAPI(userId, oldPassword, newPassword);

      if (response.success) {
        notification.success('Đổi mật khẩu thành công');

        // Clear form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);

      // Handle specific error messages from API
      if (error?.response?.data?.message) {
        notification.error(error.response.data.message);
      } else {
        notification.error('Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== Main UI ====================
  return (
    <SafeAreaView className="flex-1 bg-backgroundDefault">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Đổi mật khẩu
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Info Banner */}
        <View className="bg-info/10 mx-4 mt-4 p-4 rounded-lg flex-row">
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View className="flex-1 ml-3">
            <Text className="text-sm text-gray-700 leading-5">
              Để bảo mật tài khoản, mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu cũ
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-4 py-6 space-y-5">
          {/* Old Password */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              Mật khẩu cũ <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                value={oldPassword}
                onChangeText={(text) => {
                  setOldPassword(text);
                  if (errors.oldPassword) {
                    setErrors((prev) => ({ ...prev, oldPassword: '' }));
                  }
                }}
                placeholder="Nhập mật khẩu cũ"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
                className={`bg-white rounded-xl px-4 py-3.5 pr-12 border text-gray-900 text-base ${
                  errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-3.5"
              >
                <Ionicons
                  name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.oldPassword && (
              <Text className="text-red-500 text-sm mt-1">{errors.oldPassword}</Text>
            )}
          </View>

          {/* New Password */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              Mật khẩu mới <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }
                }}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                className={`bg-white rounded-xl px-4 py-3.5 pr-12 border text-gray-900 text-base ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-3.5"
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text className="text-red-500 text-sm mt-1">{errors.newPassword}</Text>
            )}
            {newPassword.length > 0 && newPassword.length < 6 && !errors.newPassword && (
              <Text className="text-warning text-sm mt-1">
                Mật khẩu cần ít nhất 6 ký tự
              </Text>
            )}
          </View>

          {/* Confirm New Password */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              Xác nhận mật khẩu mới <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className={`bg-white rounded-xl px-4 py-3.5 pr-12 border text-gray-900 text-base ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
            )}
            {confirmPassword.length > 0 &&
              newPassword.length > 0 &&
              confirmPassword === newPassword &&
              !errors.confirmPassword && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-success text-sm ml-1">Mật khẩu khớp</Text>
                </View>
              )}
          </View>
        </View>

        {/* Submit Button */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${
              loading ? 'bg-primary/50' : 'bg-primary'
            }`}
            style={{
              shadowColor: '#16697A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View className="mx-4 mt-6 p-4 bg-white rounded-lg">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark" size={20} color="#16697A" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Mẹo bảo mật
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Ionicons name="checkmark" size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Sử dụng mật khẩu mạnh với ít nhất 8 ký tự
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark" size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark" size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Không sử dụng thông tin cá nhân dễ đoán
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark" size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Thay đổi mật khẩu định kỳ để bảo mật tài khoản
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
