import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewType, PTEvent, User } from '../../../types/api';
import {
  getCurrentWeek,
  getCurrentMonth,
  getCurrentYear,
  getWeekOptions,
  getYearOptions,
  getMonthOptions,
  formatDateForAPI,
  formatFullDate,
  convertUTCToVietnam,
  isSameDayCheck,
} from '../../../utils/dateTime';
import { addDays, subDays } from 'date-fns';
import { getUser } from '../../../utils/storage';
import { trainerEventService } from '../../../services/trainerEventService';
import PTCalendarView from '../../../components/schedule/PTCalendarView';
import PTEventList from '../../../components/schedule/PTEventList';
import { Colors } from '../../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PTMyScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<PTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Modal states for pickers
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Load userId on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUserId(userData._id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUserData();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(
    async (isRefreshing = false) => {
      if (!userId) return;

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        let params: any = { viewType };

        if (viewType === 'day') {
          params.date = formatDateForAPI(selectedDate);
        } else if (viewType === 'week') {
          params.week = selectedWeek;
          params.year = selectedYear;
        } else if (viewType === 'month') {
          params.month = selectedMonth;
          params.year = selectedYear;
        }

        const response = await trainerEventService.getTrainerEvents(userId, params);

        // Add eventType to each event based on presence of fields
        const eventsWithType = response.events.map((event: any) => ({
          ...event,
          eventType: event.userName ? 'booking' : 'class',
        }));

        setEvents(eventsWithType);
      } catch (error) {
        console.error('Error fetching trainer events:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, viewType, selectedYear, selectedWeek, selectedMonth, selectedDate]
  );

  // Fetch events when dependencies change
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, viewType, selectedYear, selectedWeek, selectedMonth, selectedDate]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewType('day');
  };

  // Handle next day
  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  // Handle previous day
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchEvents(true);
  };

  // Filter events for display (client-side filtering for day view as backup)
  const displayEvents = React.useMemo(() => {
    if (viewType === 'day') {
      // Filter events to only show events on selected date
      return events.filter((event) => {
        const eventDate = convertUTCToVietnam(event.startTime);
        return isSameDayCheck(eventDate, selectedDate);
      });
    }
    return events;
  }, [events, selectedDate, viewType]);

  // Render view toggle buttons
  const renderViewToggle = () => (
    <View className="flex-row rounded-lg bg-gray-100 p-1">
      {(['day', 'week', 'month'] as ViewType[]).map((view) => {
        const labels = { day: 'Ngày', week: 'Tuần', month: 'Tháng' };
        const isActive = viewType === view;

        return (
          <TouchableOpacity
            key={view}
            onPress={() => setViewType(view)}
            className={`flex-1 rounded-md py-2 ${isActive ? 'bg-primary' : 'bg-transparent'}`}>
            <Text
              className={`text-center text-sm font-semibold ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}>
              {labels[view]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render custom dropdown button
  const renderDropdownButton = (label: string, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 flex-row items-center justify-between rounded-lg border border-gray-300 px-3 py-2">
      <Text className="text-sm text-gray-700">{label}</Text>
      <Ionicons name="chevron-down" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  // Render picker modal
  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: Array<{ label: string; value: number }>,
    selectedValue: number,
    onSelect: (value: number) => void
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}>
        <View className="max-h-96 rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                className={`border-b border-gray-100 px-4 py-3 ${
                  item.value === selectedValue ? 'bg-primary/10' : ''
                }`}>
                <Text
                  className={`text-base ${
                    item.value === selectedValue ? 'font-semibold text-primary' : 'text-gray-700'
                  }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render filter controls
  const renderFilterControls = () => (
    <View className="border-b border-gray-200 bg-white px-4 py-3">
      {/* Year and Week/Month selectors - NOT shown in day view */}
      {viewType !== 'day' && (
        <View className="mb-3 flex-row gap-2">
          {/* Year picker */}
          {renderDropdownButton(`Năm ${selectedYear}`, () => setShowYearPicker(true))}

          {/* Week picker - only show for week view */}
          {viewType === 'week' &&
            renderDropdownButton(`Tuần ${selectedWeek}`, () => setShowWeekPicker(true))}

          {/* Month picker - only show for month view */}
          {viewType === 'month' &&
            renderDropdownButton(
              getMonthOptions().find((m) => m.value === selectedMonth)?.label ||
                `Tháng ${selectedMonth}`,
              () => setShowMonthPicker(true)
            )}
        </View>
      )}

      {/* Day view - show selected date with navigation */}
      {viewType === 'day' && (
        <View className="mb-3 flex-row items-center justify-between">
          {/* Previous day button */}
          <TouchableOpacity
            onPress={handlePreviousDay}
            className="rounded-lg bg-gray-100 p-2 active:bg-gray-200">
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>

          {/* Selected date */}
          <View className="mx-3 flex-1 rounded-lg bg-primary/10 px-3 py-2">
            <Text className="text-center text-sm font-semibold text-primary">
              {formatFullDate(selectedDate)}
            </Text>
          </View>

          {/* Next day button */}
          <TouchableOpacity
            onPress={handleNextDay}
            className="rounded-lg bg-gray-100 p-2 active:bg-gray-200">
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* View toggle */}
      {renderViewToggle()}

      {/* Year Picker Modal */}
      {renderPickerModal(
        showYearPicker,
        () => setShowYearPicker(false),
        'Chọn năm',
        getYearOptions().map((year) => ({ label: `${year}`, value: year })),
        selectedYear,
        setSelectedYear
      )}

      {/* Week Picker Modal */}
      {renderPickerModal(
        showWeekPicker,
        () => setShowWeekPicker(false),
        'Chọn tuần',
        getWeekOptions().map((week) => ({ label: `Tuần ${week}`, value: week })),
        selectedWeek,
        setSelectedWeek
      )}

      {/* Month Picker Modal */}
      {renderPickerModal(
        showMonthPicker,
        () => setShowMonthPicker(false),
        'Chọn tháng',
        getMonthOptions(),
        selectedMonth,
        setSelectedMonth
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">Lịch của tôi</Text>
        {/* QR Code Button */}
        <TouchableOpacity
          onPress={() => setShowQRModal(true)}
          className="rounded-full bg-teal-50 p-2">
          <Ionicons name="qr-code-outline" size={20} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Calendar View */}
      <PTCalendarView
        viewType={viewType}
        selectedDate={selectedDate}
        selectedWeek={selectedWeek}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        events={events}
        onDateSelect={handleDateSelect}
      />

      {/* Event List */}
      <PTEventList
        events={displayEvents}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/70"
          activeOpacity={1}
          onPress={() => setShowQRModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            className="mx-6 w-11/12 max-w-md rounded-3xl bg-white p-6"
            onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-teal-50 p-2">
                  <Ionicons name="qr-code" size={24} color="#14b8a6" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Mã QR của bạn</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                className="rounded-full bg-gray-100 p-2">
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* QR Code Image */}
            {user?.qrCode ? (
              <View className="items-center py-6">
                <View className="rounded-2xl border-2 border-teal-100 bg-white p-4 shadow-lg">
                  <Image source={{ uri: user.qrCode }} className="h-64 w-64" resizeMode="contain" />
                </View>

                {/* User Info */}
                <View className="mt-6 items-center">
                  <Text className="text-lg font-bold text-gray-800">{user.fullName}</Text>
                  <Text className="mt-1 text-sm text-gray-500">{user.phone}</Text>
                </View>

                {/* Instructions */}
                <View className="mt-6 rounded-xl bg-teal-50 p-4">
                  <View className="w-full flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#14b8a6" />
                    <Text className="ml-2 flex-1 text-sm leading-5 text-gray-700">
                      Xuất trình mã QR này tại quầy lễ tân để check-in/check-out
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center py-8">
                <View className="mb-3 rounded-full bg-gray-100 p-4">
                  <Ionicons name="qr-code-outline" size={48} color="#9CA3AF" />
                </View>
                <Text className="text-base font-semibold text-gray-700">Không tìm thấy mã QR</Text>
                <Text className="mt-2 text-center text-sm text-gray-500">
                  Vui lòng liên hệ quản lý để được cấp mã QR
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
