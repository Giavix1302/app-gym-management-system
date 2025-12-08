import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInYears, parseISO, isFuture } from 'date-fns';

import { AvatarPicker } from '../../components/AvatarPicker';
import { getUser, saveUser } from '../../utils/storage';
import {
  getUserDetailAPI,
  updateInfoUserAPI,
  updateAvatarAPI,
  UserDetail,
  UpdateUserInfoPayload,
} from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const notification = useNotification();

  // ==================== State Management ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // User data
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [age, setAge] = useState<number | null>(null);

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ==================== Load User Data ====================
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getUser();

      if (!user || !user._id) {
        notification.error('Không tìm thấy thông tin người dùng');
        navigation.goBack();
        return;
      }

      // Fetch latest user detail from API
      const detail = await getUserDetailAPI(user._id);
      setUserDetail(detail);

      // Populate form fields
      setFullName(detail.fullName || '');
      setEmail(detail.email || '');
      setAddress(detail.address || '');
      setGender(detail.gender);
      setAge(detail.age);
      setAvatarUri(detail.avatar || null);

      if (detail.dateOfBirth) {
        setDateOfBirth(parseISO(detail.dateOfBirth));
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      notification.error(error?.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Avatar Upload ====================
  const handleAvatarChange = async (uri: string) => {
    if (!userDetail) return;

    try {
      setUploadingAvatar(true);
      setAvatarUri(uri); // Optimistic update

      const response = await updateAvatarAPI(userDetail._id, uri);
      console.log("🚀 ~ handleAvatarChange ~ response:", response)

      if (response.success) {
        // Update local user data in storage
        const user = await getUser();
        if (user) {
          user.avatar = response.user.avatar;
          await saveUser(user);
        }

        notification.success('Cập nhật ảnh đại diện thành công');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      notification.error(error?.message || 'Không thể cập nhật ảnh đại diện');
      // Revert on error
      setAvatarUri(userDetail.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ==================== Date of Birth Handler ====================
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    // On Android, always hide picker after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      // Validate: không cho chọn ngày trong tương lai
      if (isFuture(selectedDate)) {
        notification.error('Ngày sinh không thể ở trong tương lai');
        return;
      }

      setDateOfBirth(selectedDate);

      // Tự động tính age dựa trên dateOfBirth
      const calculatedAge = differenceInYears(new Date(), selectedDate);
      setAge(calculatedAge);

      // Clear error if any
      if (errors.dateOfBirth) {
        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      }
    }
  };

  // ==================== Validation ====================
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate dateOfBirth
    if (dateOfBirth && isFuture(dateOfBirth)) {
      newErrors.dateOfBirth = 'Ngày sinh không thể ở trong tương lai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== Save Handler ====================
  const handleSave = async () => {
    if (!userDetail) return;

    if (!validateForm()) {
      notification.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSaving(true);

      const payload: UpdateUserInfoPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        address: address.trim(),
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        age: age || undefined,
      };

      const response = await updateInfoUserAPI(userDetail._id, payload);

      if (response.success) {
        // Update local user data in storage
        const user = await getUser();
        if (user) {
          user.fullName = response.user.fullName;
          user.email = response.user.email;
          user.address = response.user.address;
          user.gender = response.user.gender || '';
          user.avatar = response.user.avatar;
          await saveUser(user);
        }

        notification.success('Cập nhật thông tin thành công');
        // Navigate back after a short delay to show notification
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error updating user info:', error);
      notification.error(error?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Loading State ====================
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== Main UI ====================
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1 text-center">
          Hồ sơ cá nhân
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar Section */}
        <View className="bg-white dark:bg-gray-800 py-8 items-center border-b border-gray-200 dark:border-gray-700">
          {uploadingAvatar ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#16697A" />
              <Text className="text-gray-500 dark:text-gray-400 mt-3">
                Đang tải ảnh lên...
              </Text>
            </View>
          ) : (
            <AvatarPicker imageUri={avatarUri} onImageChange={handleAvatarChange} />
          )}
        </View>

        {/* Form Section */}
        <View className="px-4 py-6 space-y-5">
          {/* Phone Number (Read-only) */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Số điện thoại
            </Text>
            <View className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600">
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                {userDetail?.phone || 'Chưa có'}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Số điện thoại không thể thay đổi
            </Text>
          </View>

          {/* Full Name */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Họ và tên <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              placeholder="Nhập email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Address */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Địa chỉ
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* Gender */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Giới tính
            </Text>
            <View className="flex-row gap-3">
              {[
                { value: 'male', label: 'Nam', icon: 'male' },
                { value: 'female', label: 'Nữ', icon: 'female' },
                { value: 'other', label: 'Khác', icon: 'transgender' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setGender(option.value as any)}
                  className={`flex-1 rounded-xl py-3.5 border-2 flex-row items-center justify-center ${
                    gender === option.value
                      ? 'bg-primary/10 border-primary'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={gender === option.value ? '#16697A' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      gender === option.value
                        ? 'text-primary'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Ngày sinh
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600 flex-row items-center justify-between"
            >
              <Text
                className={`text-base ${
                  dateOfBirth
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Chọn ngày sinh'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.dateOfBirth && (
              <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</Text>
            )}
          </View>

          {/* Age (Read-only, auto-calculated) */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Tuổi
            </Text>
            <View className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 border border-gray-300 dark:border-gray-600">
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                {age !== null ? `${age} tuổi` : 'Chưa có'}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tuổi được tính tự động từ ngày sinh
            </Text>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // Không cho chọn ngày trong tương lai
            minimumDate={new Date(1900, 0, 1)}
          />
        )}

        {/* Save Button */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`rounded-xl py-4 items-center ${
              saving ? 'bg-primary/50' : 'bg-primary'
            }`}
            style={{
              shadowColor: '#16697A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
