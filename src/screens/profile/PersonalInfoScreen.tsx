import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInYears, parseISO, isFuture } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';

import { AvatarPicker } from '../../components/AvatarPicker';
import { getUser, saveUser, getTrainer, saveTrainer } from '../../utils/storage';
import {
  updateInfoUserAPI,
  updateAvatarAPI,
  UserDetail,
  UpdateUserInfoPayload,
} from '../../services/userService';
import { trainerService } from '../../services/trainerService';
import { Trainer } from '../../types/api';
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

  // Trainer data
  const [trainerDetail, setTrainerDetail] = useState<Trainer | null>(null);
  const [pricePerHour, setPricePerHour] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [specialization, setSpecialization] = useState<string>('');
  const [physiqueImages, setPhysiqueImages] = useState<string[]>([]);
  const [newPhysiqueImages, setNewPhysiqueImages] = useState<any[]>([]);

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

      // Get user data from AsyncStorage
      const user = await getUser();

      if (!user || !user._id) {
        notification.error('Không tìm thấy thông tin người dùng');
        navigation.goBack();
        return;
      }

      // Use data from AsyncStorage directly
      setUserDetail(user as any);

      // Populate user form fields
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setGender(user.gender as 'male' | 'female' | 'other' | null);
      setAvatarUri(user.avatar || null);

      // Calculate age from dateOfBirth if exists
      if (user.createdAt) {
        const userCreatedDate = parseISO(user.createdAt);
        if (!isNaN(userCreatedDate.getTime())) {
          const calculatedAge = differenceInYears(new Date(), userCreatedDate);
          setAge(calculatedAge);
        }
      }

      // Load trainer data from AsyncStorage if role is PT
      if (user.role === 'pt') {
        const trainer = await getTrainer();
        console.log('🚀 ~ loadUserData ~ trainer from storage:', trainer);

        if (trainer) {
          setTrainerDetail(trainer);

          // Populate trainer form fields
          setPricePerHour(trainer.pricePerHour?.toString() || '');
          setBio(trainer.bio || '');
          setExperience(trainer.experience || '');
          setEducation(trainer.education || '');
          setSpecialization(trainer.specialization || '');
          setPhysiqueImages(trainer.physiqueImages || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      notification.error('Không thể tải thông tin người dùng');
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
      console.log('🚀 ~ handleAvatarChange ~ response:', response);

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

    // Validate trainer fields if user is PT
    if (userDetail?.role === 'pt') {
      // Price validation
      const price = parseInt(pricePerHour);
      if (!pricePerHour || isNaN(price)) {
        newErrors.pricePerHour = 'Vui lòng nhập giá mỗi giờ';
      } else if (price < 50000) {
        newErrors.pricePerHour = 'Giá tối thiểu là 50,000 VNĐ';
      } else if (price > 5000000) {
        newErrors.pricePerHour = 'Giá tối đa là 5,000,000 VNĐ';
      }

      // Required fields
      if (!specialization) {
        newErrors.specialization = 'Vui lòng chọn chuyên môn';
      }
      if (!experience?.trim()) {
        newErrors.experience = 'Vui lòng nhập kinh nghiệm';
      }
      if (!education?.trim()) {
        newErrors.education = 'Vui lòng nhập học vấn';
      }
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

    // Check if user tried to add new images
    if (newPhysiqueImages.length > 0) {
      notification.warning('Chức năng thêm hình ảnh đang phát triển');
      return;
    }

    try {
      setSaving(true);

      // Update User Data
      const userPayload: UpdateUserInfoPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        address: address.trim(),
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        age: age || undefined,
      };

      const userResponse = await updateInfoUserAPI(userDetail._id, userPayload);

      if (userResponse.success) {
        // Update local user data in storage
        const user = await getUser();
        if (user) {
          user.fullName = userResponse.user.fullName;
          user.email = userResponse.user.email;
          user.address = userResponse.user.address;
          user.gender = userResponse.user.gender || '';
          user.avatar = userResponse.user.avatar;
          await saveUser(user);
        }
      }

      // Update Trainer Data if PT (without image upload)
      if (userDetail.role === 'pt' && trainerDetail) {
        const formData = new FormData();

        // Append trainer fields
        formData.append('pricePerHour', pricePerHour);
        formData.append('bio', bio.trim());
        formData.append('experience', experience.trim());
        formData.append('education', education.trim());
        formData.append('specialization', specialization);

        // Only keep old images (don't upload new ones)
        const oldImages = physiqueImages.filter(
          (img) => !img.startsWith('blob:') && !img.startsWith('file:')
        );

        // Append old image URLs to keep (backend expects array with key 'physiqueImages')
        if (oldImages.length > 0) {
          oldImages.forEach((imageUrl) => {
            formData.append('physiqueImages', imageUrl);
          });
        }

        console.log('🚀 ~ handleSave ~ Trainer update data:');
        console.log('  - pricePerHour:', pricePerHour);
        console.log('  - specialization:', specialization);
        console.log('  - Old images to keep:', oldImages.length);

        try {
          const trainerResponse = await trainerService.updateTrainerInfo(
            userDetail._id,
            formData
          );

          if (trainerResponse.success && trainerResponse.trainer) {
            // Update local trainer data in storage
            await saveTrainer(trainerResponse.trainer);
            console.log('✅ Trainer info updated and saved to storage');
          }
        } catch (trainerError: any) {
          console.error('❌ Trainer update failed:', trainerError.message);
          // Don't throw error here - user info already updated successfully
          notification.warning(
            'Cập nhật thông tin cá nhân thành công, nhưng thông tin huấn luyện viên có lỗi'
          );
          throw trainerError; // Re-throw to prevent navigation
        }
      }

      notification.success('Cập nhật thông tin thành công');
      // Navigate back after a short delay to show notification
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating info:', error);
      notification.error(error?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Utility Functions ====================
  const formatPriceDisplay = (value: string): string => {
    if (!value) return '';
    const numValue = parseInt(value.replace(/\D/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('vi-VN');
  };

  const handleAddPhysiqueImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        notification.error('Cần quyền truy cập thư viện ảnh');
        return;
      }

      const maxNewImages = 6 - physiqueImages.length;
      if (maxNewImages <= 0) {
        notification.warning('Đã đạt giới hạn tối đa 6 hình ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Add to preview
        setPhysiqueImages((prev) => [...prev, asset.uri]);

        // Store actual file
        setNewPhysiqueImages((prev) => [
          ...prev,
          {
            uri: asset.uri,
            name: asset.fileName || `physique_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
          },
        ]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      notification.error('Không thể chọn ảnh');
    }
  };

  const handleDeletePhysiqueImage = (index: number) => {
    const imageToDelete = physiqueImages[index];

    // If blob URL, also remove from newPhysiqueImages
    if (imageToDelete.startsWith('blob:') || imageToDelete.startsWith('file:')) {
      const oldImagesCount = physiqueImages.filter(
        (img) => !img.startsWith('blob:') && !img.startsWith('file:')
      ).length;
      const newImageIndex = index - oldImagesCount;

      if (newImageIndex >= 0 && newImageIndex < newPhysiqueImages.length) {
        setNewPhysiqueImages((prev) => prev.filter((_, i) => i !== newImageIndex));
      }
    }

    // Remove from physiqueImages array
    setPhysiqueImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ==================== Loading State ====================
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== Main UI ====================
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-gray-100">
          Hồ sơ cá nhân
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar Section */}
        <View className="items-center border-b border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
          {uploadingAvatar ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#16697A" />
              <Text className="mt-3 text-gray-500 dark:text-gray-400">Đang tải ảnh lên...</Text>
            </View>
          ) : (
            <AvatarPicker imageUri={avatarUri} onImageChange={handleAvatarChange} />
          )}
        </View>

        {/* Form Section */}
        <View className="space-y-5 px-4 py-6">
          {/* Phone Number (Read-only) */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Số điện thoại
            </Text>
            <View className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-3.5 dark:border-gray-600 dark:bg-gray-700">
              <Text className="text-base text-gray-500 dark:text-gray-400">
                {userDetail?.phone || 'Chưa có'}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Số điện thoại không thể thay đổi
            </Text>
          </View>

          {/* Full Name */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Họ và tên <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#9CA3AF"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Email</Text>
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
              className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            {errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>}
          </View>

          {/* Address */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Địa chỉ</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* Gender */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Giới tính</Text>
            <View className="flex-row gap-3">
              {[
                { value: 'male', label: 'Nam', icon: 'male' },
                { value: 'female', label: 'Nữ', icon: 'female' },
                { value: 'other', label: 'Khác', icon: 'transgender' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setGender(option.value as any)}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border-2 py-3.5 ${
                    gender === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                  }`}>
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={gender === option.value ? '#16697A' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      gender === option.value ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Ngày sinh</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3.5 dark:border-gray-600 dark:bg-gray-800">
              <Text
                className={`text-base ${
                  dateOfBirth
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Chọn ngày sinh'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.dateOfBirth && (
              <Text className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</Text>
            )}
          </View>

          {/* Age (Read-only, auto-calculated) */}
          <View>
            <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Tuổi</Text>
            <View className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-3.5 dark:border-gray-600 dark:bg-gray-700">
              <Text className="text-base text-gray-500 dark:text-gray-400">
                {age !== null ? `${age} tuổi` : 'Chưa có'}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tuổi được tính tự động từ ngày sinh
            </Text>
          </View>

          {/* === TRAINER SECTION === */}
          {userDetail?.role === 'pt' && (
            <>
              {/* Divider */}
              <View className="my-6 border-t-8 border-gray-200 dark:border-gray-700" />

              <Text className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
                Thông tin Huấn luyện viên
              </Text>

              {/* Price Per Hour */}
              <View>
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Giá mỗi giờ (VNĐ) <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formatPriceDisplay(pricePerHour)}
                  onChangeText={(text) => {
                    const cleanValue = text.replace(/\D/g, '');
                    setPricePerHour(cleanValue);
                    if (errors.pricePerHour) {
                      setErrors((prev) => ({ ...prev, pricePerHour: '' }));
                    }
                  }}
                  placeholder="Nhập giá mỗi giờ"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                {errors.pricePerHour && (
                  <Text className="mt-1 text-sm text-red-500">{errors.pricePerHour}</Text>
                )}
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Giá trị từ 50,000 đến 5,000,000 VNĐ
                </Text>
              </View>

              {/* Specialization */}
              <View className="mt-5">
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Chuyên môn <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { value: 'yoga', label: 'Yoga', icon: 'body' },
                    { value: 'gym', label: 'Gym', icon: 'barbell' },
                    { value: 'dance', label: 'Dance', icon: 'musical-notes' },
                    { value: 'boxing', label: 'Boxing', icon: 'hand-left' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setSpecialization(option.value);
                        if (errors.specialization) {
                          setErrors((prev) => ({ ...prev, specialization: '' }));
                        }
                      }}
                      className={`flex-row items-center rounded-full border-2 px-4 py-2 ${
                        specialization === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                      }`}>
                      <Ionicons
                        name={option.icon as any}
                        size={18}
                        color={specialization === option.value ? '#16697A' : '#9CA3AF'}
                      />
                      <Text
                        className={`ml-2 font-semibold ${
                          specialization === option.value
                            ? 'text-primary'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.specialization && (
                  <Text className="mt-1 text-sm text-red-500">{errors.specialization}</Text>
                )}
              </View>

              {/* Experience */}
              <View className="mt-5">
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Kinh nghiệm <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={experience}
                  onChangeText={(text) => {
                    setExperience(text);
                    if (errors.experience) {
                      setErrors((prev) => ({ ...prev, experience: '' }));
                    }
                  }}
                  placeholder="VD: 2 năm kinh nghiệm"
                  placeholderTextColor="#9CA3AF"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                {errors.experience && (
                  <Text className="mt-1 text-sm text-red-500">{errors.experience}</Text>
                )}
              </View>

              {/* Education */}
              <View className="mt-5">
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Học vấn <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={education}
                  onChangeText={(text) => {
                    setEducation(text);
                    if (errors.education) {
                      setErrors((prev) => ({ ...prev, education: '' }));
                    }
                  }}
                  placeholder="VD: Cử nhân TDTT"
                  placeholderTextColor="#9CA3AF"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                {errors.education && (
                  <Text className="mt-1 text-sm text-red-500">{errors.education}</Text>
                )}
              </View>

              {/* Bio */}
              <View className="mt-5">
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Giới thiệu
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Giới thiệu về bản thân"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              </View>

              {/* Physique Images */}
              <View className="mt-5">
                <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                  Hình ảnh thân hình (Tối đa 6 ảnh)
                </Text>

                {/* Development Notice */}
                <View className="mb-3 flex-row items-start rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <Ionicons name="information-circle" size={20} color="#F59E0B" />
                  <Text className="ml-2 flex-1 text-sm text-yellow-700 dark:text-yellow-400">
                    Chức năng thêm hình ảnh đang phát triển
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {physiqueImages.map((imageUri, index) => (
                    <View key={index} className="relative">
                      <Image
                        source={{ uri: imageUri }}
                        style={{ width: 100, height: 100 }}
                        className="rounded-lg"
                      />
                      <TouchableOpacity
                        onPress={() => handleDeletePhysiqueImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}>
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {physiqueImages.length < 6 && (
                    <TouchableOpacity
                      onPress={handleAddPhysiqueImages}
                      className="items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                      style={{ width: 100, height: 100 }}>
                      <Ionicons name="add" size={32} color="#9CA3AF" />
                      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Thêm ảnh
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Hình ảnh thể hình giúp thu hút học viên
                </Text>
              </View>
            </>
          )}
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
        <View className="mt-4 px-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`items-center rounded-xl py-4 ${saving ? 'bg-primary/50' : 'bg-primary'}`}
            style={{
              shadowColor: '#16697A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
