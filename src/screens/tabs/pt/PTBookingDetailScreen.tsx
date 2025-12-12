import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { PTSchedule } from '../../../types/ptSchedule';
import { ptScheduleService } from '../../../services/ptScheduleService';
import { formatFullDate, formatTime, convertUTCToVietnam } from '../../../utils/dateTime';
import { useNotification } from '../../../context/NotificationContext';

type PTBookingDetailRouteProp = RouteProp<RootStackParamList, 'PTBookingDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PTBookingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PTBookingDetailRouteProp>();
  const { schedule } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  const [adviceTitle, setAdviceTitle] = useState('');
  const [adviceContent, setAdviceContent] = useState('');
  const [contentItems, setContentItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isBooked = !!schedule.booking.bookingId;
  const isCompleted = schedule.booking.status === 'completed';
  const canAddAdvice = isBooked && isCompleted;

  const startTime = convertUTCToVietnam(schedule.startTime);
  const endTime = convertUTCToVietnam(schedule.endTime);

  const handleAddContentItem = () => {
    if (adviceContent.trim()) {
      setContentItems([...contentItems, adviceContent.trim()]);
      setAdviceContent('');
    }
  };

  const handleRemoveContentItem = (index: number) => {
    setContentItems(contentItems.filter((_, i) => i !== index));
  };

  const handleSubmitAdvice = async () => {
    if (!adviceTitle.trim()) {
      showError('Vui lòng nhập tiêu đề lời khuyên');
      return;
    }

    if (contentItems.length === 0) {
      showError('Vui lòng thêm ít nhất một nội dung');
      return;
    }

    if (!schedule.booking.bookingId) {
      showError('Không tìm thấy booking ID');
      return;
    }

    try {
      setLoading(true);
      await ptScheduleService.updateTrainerAdvice(schedule.booking.bookingId, {
        title: adviceTitle.trim(),
        content: contentItems,
      });

      showSuccess('Thêm lời khuyên thành công');
      setAdviceTitle('');
      setContentItems([]);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting advice:', error);
      showError('Không thể thêm lời khuyên. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">
          Chi tiết lịch dạy
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View className="m-4 rounded-2xl border border-gray-200 bg-white p-4">
          {/* Time */}
          <View className="mb-3 flex-row items-center">
            <Ionicons name="calendar" size={20} color="#16697A" />
            <Text className="ml-2 text-base font-semibold text-gray-800">
              {formatFullDate(startTime)}
            </Text>
          </View>

          <View className="mb-3 flex-row items-center">
            <Ionicons name="time" size={20} color="#16697A" />
            <Text className="ml-2 text-base font-semibold text-gray-800">
              {formatTime(startTime)} - {formatTime(endTime)}
            </Text>
          </View>

          {/* Title */}
          {schedule.title && (
            <View className="mb-3">
              <Text className="text-sm text-gray-600">Tiêu đề:</Text>
              <Text className="mt-1 text-base font-medium text-gray-800">{schedule.title}</Text>
            </View>
          )}

          {/* Status Badge */}
          {schedule.booking.status && (
            <View className="mb-3">
              <View
                className={`self-start rounded-full px-3 py-1 ${
                  schedule.booking.status === 'completed'
                    ? 'bg-green-100'
                    : schedule.booking.status === 'cancelled'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                }`}>
                <Text
                  className={`text-xs font-semibold ${
                    schedule.booking.status === 'completed'
                      ? 'text-green-700'
                      : schedule.booking.status === 'cancelled'
                        ? 'text-red-700'
                        : 'text-blue-700'
                  }`}>
                  {schedule.booking.status === 'completed'
                    ? 'Đã hoàn thành'
                    : schedule.booking.status === 'cancelled'
                      ? 'Đã hủy'
                      : schedule.booking.status === 'booking'
                        ? 'Đã đặt'
                        : 'Chưa thanh toán'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* User Info (if booked) */}
        {isBooked && schedule.booking.userInfo.fullName && (
          <View className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">Thông tin học viên</Text>

            <View className="flex-row items-center">
              {schedule.booking.userInfo.avatar ? (
                <Image
                  source={{ uri: schedule.booking.userInfo.avatar }}
                  className="mr-3 h-16 w-16 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="mr-3 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons name="person" size={32} color="#16697A" />
                </View>
              )}

              <View className="flex-1">
                <Text className="mb-1 text-base font-bold text-gray-800">
                  {schedule.booking.userInfo.fullName}
                </Text>
                {schedule.booking.userInfo.phone && (
                  <View className="flex-row items-center">
                    <Ionicons name="call" size={14} color="#6B7280" />
                    <Text className="ml-1 text-sm text-gray-600">
                      {schedule.booking.userInfo.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location */}
            {schedule.booking.locationName && (
              <View className="mt-3 border-t border-gray-100 pt-3">
                <View className="flex-row items-start">
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-medium text-gray-700">
                      {schedule.booking.locationName}
                    </Text>
                    {schedule.booking.address.street && (
                      <Text className="text-sm text-gray-600">
                        {schedule.booking.address.street}, {schedule.booking.address.ward}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Price */}
            {schedule.booking.price && (
              <View className="mt-3 flex-row items-center border-t border-gray-100 pt-3">
                <Ionicons name="cash" size={16} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-600">
                  Giá:{' '}
                  <Text className="font-semibold text-primary">
                    {schedule.booking.price.toLocaleString('vi-VN')} đ
                  </Text>
                </Text>
              </View>
            )}

            {/* Note */}
            {schedule.booking.note && (
              <View className="mt-3 border-t border-gray-100 pt-3">
                <Text className="mb-1 text-sm font-medium text-gray-700">Ghi chú:</Text>
                <Text className="text-sm text-gray-600">{schedule.booking.note}</Text>
              </View>
            )}
          </View>
        )}

        {/* Existing Trainer Advice */}
        {schedule.booking.trainerAdvice && schedule.booking.trainerAdvice.length > 0 && (
          <View className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">Lời khuyên đã gửi</Text>

            {schedule.booking.trainerAdvice.map((advice, index) => (
              <View key={index} className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Text className="mb-2 text-sm font-semibold text-blue-900">{advice.title}</Text>
                {advice.content.map((item, idx) => (
                  <View key={idx} className="mb-1 flex-row items-start">
                    <Text className="mr-2 text-blue-700">•</Text>
                    <Text className="flex-1 text-sm text-blue-800">{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Review */}
        {schedule.booking.review?.rating && (
          <View className="mx-4 mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="mb-2 text-base font-bold text-amber-900">Đánh giá</Text>
            <View className="mb-2 flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={18}
                  color={star <= schedule.booking.review.rating! ? '#F59E0B' : '#D1D5DB'}
                />
              ))}
            </View>
            {schedule.booking.review.comment && (
              <Text className="text-sm text-amber-800">{schedule.booking.review.comment}</Text>
            )}
          </View>
        )}

        {/* Add Advice Form (only for completed bookings) */}
        {canAddAdvice && (
          <View className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">Thêm lời khuyên</Text>

            {/* Title Input */}
            <View className="mb-3">
              <Text className="mb-2 text-sm font-medium text-gray-700">Tiêu đề</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-800"
                placeholder="VD: Lời khuyên về dinh dưỡng"
                value={adviceTitle}
                onChangeText={setAdviceTitle}
                editable={!loading}
              />
            </View>

            {/* Content Input */}
            <View className="mb-3">
              <Text className="mb-2 text-sm font-medium text-gray-700">Nội dung</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-800"
                  placeholder="Nhập một mục lời khuyên"
                  value={adviceContent}
                  onChangeText={setAdviceContent}
                  editable={!loading}
                  onSubmitEditing={handleAddContentItem}
                />
                <TouchableOpacity
                  className="ml-2 rounded-xl bg-primary p-3"
                  onPress={handleAddContentItem}
                  disabled={loading || !adviceContent.trim()}>
                  <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Items List */}
            {contentItems.length > 0 && (
              <View className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                {contentItems.map((item, index) => (
                  <View key={index} className="mb-2 flex-row items-start justify-between">
                    <View className="flex-1 flex-row items-start">
                      <Text className="mr-2 text-gray-700">•</Text>
                      <Text className="flex-1 text-sm text-gray-800">{item}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveContentItem(index)}
                      disabled={loading}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              className={`items-center rounded-xl py-3 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
              onPress={handleSubmitAdvice}
              disabled={loading || !adviceTitle.trim() || contentItems.length === 0}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-base font-bold text-white">Gửi lời khuyên</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
