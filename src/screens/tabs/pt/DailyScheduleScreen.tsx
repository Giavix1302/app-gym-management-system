import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { RootStackParamList } from '../../../navigation/types';
import { PTSchedule } from '../../../types/ptSchedule';
import { ptScheduleService } from '../../../services/ptScheduleService';
import { getTrainer } from '../../../utils/storage';
import PTScheduleItem from '../../../components/schedule/PTScheduleItem';
import { convertUTCToVietnam } from '../../../utils/dateTime';

type DailyScheduleScreenRouteProp = RouteProp<RootStackParamList, 'DailySchedule'>;
type DailyScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DailySchedule'
>;

export default function DailyScheduleScreen() {
  const navigation = useNavigation<DailyScheduleScreenNavigationProp>();
  const route = useRoute<DailyScheduleScreenRouteProp>();
  const { selectedDate } = route.params;

  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<PTSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Format header date
  const dateObj = parseISO(selectedDate);
  const headerTitle = `Lịch ngày ${format(dateObj, 'dd/MM/yyyy', { locale: vi })}`;

  // Fetch schedules for the selected date
  const fetchSchedules = async (tId: string) => {
    try {
      setLoading(true);
      const response = await ptScheduleService.getListScheduleByTrainerId(tId);

      if (response.success && response.listSchedule) {
        // Filter schedules for the selected date
        const filteredSchedules = response.listSchedule.filter((schedule) => {
          const scheduleDate = convertUTCToVietnam(schedule.startTime);
          return isSameDay(scheduleDate, dateObj);
        });

        // Sort by time
        const sortedSchedules = filteredSchedules.sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        setSchedules(sortedSchedules);
      }
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lịch');
    } finally {
      setLoading(false);
    }
  };

  // Initialize screen
  useEffect(() => {
    const initializeScreen = async () => {
      const trainer = await getTrainer();
      if (trainer && trainer._id) {
        setTrainerId(trainer._id);
        await fetchSchedules(trainer._id);
      } else {
        setTrainerId(null);
        setLoading(false);
        Alert.alert('Lỗi', 'Không tìm thấy thông tin huấn luyện viên');
      }
    };
    initializeScreen();
  }, [selectedDate]);

  // Refresh handler
  const handleRefresh = async () => {
    if (trainerId) {
      setRefreshing(true);
      await fetchSchedules(trainerId);
      setRefreshing(false);
    }
  };

  // Navigate to booking detail
  const handlePressSchedule = (schedule: PTSchedule) => {
    if (schedule.booking.bookingId) {
      navigation.navigate('PTBookingDetail', { schedule });
    }
  };

  // Delete empty slot
  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa lịch trống này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await ptScheduleService.deleteScheduleForPT(scheduleId);
            if (response.success) {
              Alert.alert('Thành công', 'Đã xóa lịch trống');
              if (trainerId) {
                await fetchSchedules(trainerId);
              }
            }
          } catch (error: any) {
            console.error('Error deleting schedule:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa lịch');
          }
        },
      },
    ]);
  };

  // Check if schedule can be deleted (empty slot only)
  const canDelete = (schedule: PTSchedule) => {
    return !schedule.booking.bookingId;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="mt-4 text-gray-600">Đang tải lịch...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-lg font-bold text-gray-800">{headerTitle}</Text>
        </View>
        <View className="z-10">
          <Ionicons
            name="arrow-back"
            size={24}
            color="#16697A"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>

      {/* Schedules List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#16697A']} />
        }
      >
        {schedules.length === 0 ? (
          <View className="mt-20 items-center">
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-center text-gray-500">
              Không có lịch nào trong ngày này
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <PTScheduleItem
              key={schedule._id}
              schedule={schedule}
              onPress={() => handlePressSchedule(schedule)}
              onDelete={() => handleDeleteSchedule(schedule._id)}
              canDelete={canDelete(schedule)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
