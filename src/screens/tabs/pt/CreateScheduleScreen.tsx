import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../../navigation/types';
import { ptScheduleService } from '../../../services/ptScheduleService';
import { PTSchedule } from '../../../types/ptSchedule';
import { formatFullDate, formatTime } from '../../../utils/dateTime';
import { useNotification } from '../../../context/NotificationContext';

type CreateScheduleRouteProp = RouteProp<RootStackParamList, 'CreateSchedule'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateScheduleRouteProp>();
  const { trainerId } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  // Current date/time
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now);
  const [startTime, setStartTime] = useState(new Date(now.getTime() + 60 * 60 * 1000)); // +1 hour
  const [endTime, setEndTime] = useState(new Date(now.getTime() + 2 * 60 * 60 * 1000)); // +2 hours

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      // Update start and end time with new date
      const newStartTime = new Date(date);
      newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      setStartTime(newStartTime);

      const newEndTime = new Date(date);
      newEndTime.setHours(endTime.getHours(), endTime.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const handleStartTimeChange = (event: any, time?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (time) {
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(time.getHours(), time.getMinutes());
      setStartTime(newStartTime);

      // Auto-adjust end time to be at least 1 hour after start
      const minEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
      if (endTime <= newStartTime || endTime < minEndTime) {
        setEndTime(minEndTime);
      }
    }
  };

  const handleEndTimeChange = (event: any, time?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (time) {
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(time.getHours(), time.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const validateSchedule = (): string | null => {
    // Check if start time is in the past
    if (startTime < now) {
      return 'Không thể tạo lịch trong quá khứ';
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      return 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    // Check duration (min 1 hour, max 4 hours)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      return 'Thời gian tối thiểu là 1 giờ';
    }
    if (durationHours > 4) {
      return 'Thời gian tối đa là 4 giờ';
    }

    return null;
  };

  const handleCreateSchedule = async () => {
    const validationError = validateSchedule();
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await ptScheduleService.createScheduleForPT({
        trainerId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      showSuccess('Tạo lịch trống thành công');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể tạo lịch. Vui lòng thử lại';

      // Check for overlap/conflict error
      if (errorMessage.includes('trùng') || errorMessage.includes('conflict')) {
        showError('Lịch bị trùng với lịch đã có. Vui lòng chọn thời gian khác');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">
          Thêm lịch trống
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Info Card */}
          <View className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <View className="mb-2 flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#2563EB" />
              <Text className="ml-2 text-sm font-semibold text-blue-900">Lưu ý</Text>
            </View>
            <Text className="text-sm text-blue-800">
              • Chỉ được tạo lịch từ hiện tại đến tương lai{'\n'}
              • Thời gian tối thiểu: 1 giờ{'\n'}
              • Thời gian tối đa: 4 giờ{'\n'}
              • Không được trùng với lịch đã có
            </Text>
          </View>

          {/* Date Selection */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-base font-bold text-gray-800">Chọn ngày</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#16697A" />
                <Text className="ml-2 text-base text-gray-800">
                  {formatFullDate(selectedDate)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Start Time Selection */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-base font-bold text-gray-800">Thời gian bắt đầu</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
              onPress={() => setShowStartTimePicker(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#16697A" />
                <Text className="ml-2 text-base text-gray-800">{formatTime(startTime)}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* End Time Selection */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 text-base font-bold text-gray-800">Thời gian kết thúc</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
              onPress={() => setShowEndTimePicker(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#16697A" />
                <Text className="ml-2 text-base text-gray-800">{formatTime(endTime)}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Duration Display */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700">Thời lượng:</Text>
              <Text
                className={`text-base font-bold ${
                  durationHours >= 1 && durationHours <= 4 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {durationHours.toFixed(1)} giờ
              </Text>
            </View>
            {(durationHours < 1 || durationHours > 4) && (
              <Text className="mt-2 text-xs text-red-600">
                {durationHours < 1
                  ? 'Thời gian tối thiểu là 1 giờ'
                  : 'Thời gian tối đa là 4 giờ'}
              </Text>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleCreateSchedule}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-base font-bold text-white">Tạo lịch trống</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={now}
        />
      )}

      {/* Start Time Picker */}
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartTimeChange}
          is24Hour={true}
        />
      )}

      {/* End Time Picker */}
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndTimeChange}
          is24Hour={true}
        />
      )}
    </SafeAreaView>
  );
}
