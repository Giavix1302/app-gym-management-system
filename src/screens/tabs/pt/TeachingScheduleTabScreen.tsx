import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import CalendarView from '../../../components/schedule/CalendarView';
import PTScheduleItem from '../../../components/schedule/PTScheduleItem';
import { ptScheduleService } from '../../../services/ptScheduleService';
import { PTSchedule } from '../../../types/ptSchedule';
import { ScheduleEvent, ViewType } from '../../../types/api';
import { useNotification } from '../../../context/NotificationContext';
import { getTrainer } from '../../../utils/storage';
import {
  getCurrentWeek,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from '../../../utils/dateTime';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'upcoming' | 'empty' | 'history';

export default function TeachingScheduleTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { success: showSuccess, error: showError } = useNotification();

  // Calendar state
  const viewType: ViewType = 'month'; // Always use month view
  const [selectedDate] = useState(new Date());
  const selectedWeek = getCurrentWeek();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  // Data state
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [allSchedules, setAllSchedules] = useState<PTSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const fetchSchedules = async (id: string) => {
    try {
      const response = await ptScheduleService.getListScheduleByTrainerId(id);
      setAllSchedules(response.listSchedule);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showError('Không thể tải danh sách lịch');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        const trainer = await getTrainer();
        if (trainer && trainer._id) {
          setTrainerId(trainer._id);
          await fetchSchedules(trainer._id);
        } else {
          // Not a PT user
          setTrainerId(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing screen:', error);
        setTrainerId(null);
        setLoading(false);
      }
    };

    initializeScreen();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Only refresh if already initialized and is a PT
      if (trainerId) {
        fetchSchedules(trainerId);
      }
    }, [trainerId])
  );

  const handleRefresh = () => {
    if (trainerId) {
      setRefreshing(true);
      fetchSchedules(trainerId);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await ptScheduleService.deleteScheduleForPT(scheduleId);
      showSuccess('Xóa lịch thành công');
      if (trainerId) {
        fetchSchedules(trainerId);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showError('Không thể xóa lịch. Vui lòng thử lại');
    }
  };

  const handleSchedulePress = (schedule: PTSchedule) => {
    if (schedule.booking.bookingId) {
      // Navigate to detail screen for booked schedules
      navigation.navigate('PTBookingDetail', { schedule });
    }
  };

  const handleAddSchedule = () => {
    if (trainerId) {
      navigation.navigate('CreateSchedule', { trainerId });
    }
  };

  const handleDateSelect = (date: Date) => {
    // Navigate to DailyScheduleScreen with selected date
    navigation.navigate('DailySchedule', { selectedDate: date.toISOString() });
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (selectedMonth > 1) {
      setSelectedMonth(selectedMonth - 1);
    } else {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth < 12) {
      setSelectedMonth(selectedMonth + 1);
    } else {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    }
  };

  // Categorize schedules into tabs
  const categorizeSchedules = (): {
    upcoming: PTSchedule[];
    empty: PTSchedule[];
    history: PTSchedule[];
  } => {
    const now = new Date();

    const upcoming: PTSchedule[] = [];
    const empty: PTSchedule[] = [];
    const history: PTSchedule[] = [];

    allSchedules.forEach((schedule) => {
      const startTime = new Date(schedule.startTime);
      const isBooked = !!schedule.booking.bookingId;
      const isPast = startTime < now;

      if (isBooked) {
        // Booked schedules
        if (isPast) {
          history.push(schedule);
        } else {
          upcoming.push(schedule);
        }
      } else {
        // Empty slots - all go to 'Lịch trống' tab (both past and future)
        empty.push(schedule);
      }
    });

    // Sort by startTime
    upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    empty.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    history.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Descending for history

    return { upcoming, empty, history };
  };

  const { upcoming, empty, history } = categorizeSchedules();

  // Check if a schedule is a past empty slot
  const isPastEmptySlot = (schedule: PTSchedule): boolean => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const isBooked = !!schedule.booking.bookingId;
    const isPast = startTime < now;

    return !isBooked && isPast;
  };

  // Get current tab schedules (all schedules in the tab, not filtered by date)
  const currentSchedules =
    activeTab === 'upcoming' ? upcoming : activeTab === 'empty' ? empty : history;

  // Convert schedules to events for calendar
  const calendarEvents: ScheduleEvent[] = allSchedules
    .filter((schedule) => {
      const startTime = new Date(schedule.startTime);
      const now = new Date();
      const isBooked = !!schedule.booking.bookingId;

      // Only show future schedules or booked schedules
      return startTime >= now || isBooked;
    })
    .map((schedule) => ({
      _id: schedule._id,
      title: schedule.title || 'Lịch dạy',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      locationName: schedule.booking.locationName || '',
      locationId: '',
      trainerName: '',
      eventType: 'booking' as const,
      status: schedule.booking.status,
    }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if not a PT user
  if (trainerId === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
          <Text className="mt-4 text-center text-lg font-semibold text-gray-700">
            Tài khoản không phải PT
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Bạn cần đăng nhập bằng tài khoản PT để xem lịch dạy
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className=" flex-1 bg-gray-50 ">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        {/* Title and Add Button Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">Lịch dạy</Text>

          <TouchableOpacity
            className="flex-row items-center rounded-xl bg-primary px-4 py-2"
            onPress={handleAddSchedule}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text className="ml-1 text-sm font-bold text-white">Thêm lịch</Text>
          </TouchableOpacity>
        </View>

        {/* Current Month Display with Navigation */}
        <View className="mt-3 flex-row items-center justify-center">
          <TouchableOpacity className="rounded-lg bg-gray-100 p-2" onPress={handlePreviousMonth}>
            <Ionicons name="chevron-back" size={20} color="#16697A" />
          </TouchableOpacity>

          <View className="mx-4 min-w-[150px] items-center">
            <Text className="text-base font-bold text-gray-800">
              {`${getMonthName(selectedMonth)} ${selectedYear}`}
            </Text>
          </View>

          <TouchableOpacity className="rounded-lg bg-gray-100 p-2" onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#16697A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar */}
      <CalendarView
        viewType={viewType}
        selectedDate={selectedDate}
        selectedWeek={selectedWeek}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        events={calendarEvents}
        onDateSelect={handleDateSelect}
      />

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 bg-white px-4">
        <TouchableOpacity
          className={`flex-1 items-center border-b-2 py-3 ${
            activeTab === 'upcoming' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('upcoming')}>
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'upcoming' ? 'text-primary' : 'text-gray-600'
            }`}>
            Lịch sắp tới ({upcoming.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center border-b-2 py-3 ${
            activeTab === 'empty' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('empty')}>
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'empty' ? 'text-primary' : 'text-gray-600'
            }`}>
            Lịch trống ({empty.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center border-b-2 py-3 ${
            activeTab === 'history' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('history')}>
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'history' ? 'text-primary' : 'text-gray-600'
            }`}>
            Lịch sử ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Schedule List for Current Tab */}
      <ScrollView
        className=" flex-1 bg-gray-50"
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View className="p-4">
          {currentSchedules.length === 0 ? (
            <View className="mt-8 items-center">
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-center text-gray-500">
                {activeTab === 'upcoming' && 'Chưa có lịch sắp tới'}
                {activeTab === 'empty' && 'Chưa có lịch trống'}
                {activeTab === 'history' && 'Chưa có lịch sử'}
              </Text>
            </View>
          ) : (
            currentSchedules.map((schedule) => {
              const isPast = isPastEmptySlot(schedule);
              return (
                <View key={schedule._id}>
                  <PTScheduleItem
                    schedule={schedule}
                    onPress={() => handleSchedulePress(schedule)}
                    onDelete={
                      !schedule.booking.bookingId
                        ? () => handleDeleteSchedule(schedule._id)
                        : undefined
                    }
                    canDelete={!schedule.booking.bookingId}
                  />
                  {/* Recommendation badge for past empty slots */}
                  {isPast && (
                    <View className="-mt-2 mb-3 flex-row items-center justify-center rounded-lg bg-orange-100 px-3 py-2">
                      <Ionicons name="alert-circle" size={16} color="#EA580C" />
                      <Text className="ml-2 text-xs font-medium text-orange-700">
                        Lịch trống đã qua - Nên xóa để giữ lịch gọn gàng
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* <View className="h-6" /> */}
      </ScrollView>
    </SafeAreaView>
  );
}
