import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewType, ScheduleEvent } from '../types/api';
import {
  getCurrentWeek,
  getCurrentMonth,
  getCurrentYear,
  getWeekOptions,
  getYearOptions,
  getMonthOptions,
  formatDateForAPI,
  formatFullDate,
  isSameDayCheck,
} from '../utils/dateTime';
import { addDays, subDays } from 'date-fns';
import { getUser } from '../utils/storage';
import { eventService } from '../services/eventService';
import CalendarView from '../components/schedule/CalendarView';
import EventList from '../components/schedule/EventList';
import { Colors } from '../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');

  // Modal states for pickers
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Load userId on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const user = await getUser();
        if (user) {
          setUserId(user._id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUserId();
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

        const response = await eventService.getUserEvents(userId, params);
        setEvents(response.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
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
        const eventDate = new Date(event.startTime);
        // Add 7 hours for Vietnam timezone
        eventDate.setHours(eventDate.getHours() + 7);
        return isSameDayCheck(eventDate, selectedDate);
      });
    }
    return events;
  }, [events, selectedDate, viewType]);

  // Render view toggle buttons
  const renderViewToggle = () => (
    <View className="flex-row bg-gray-100 rounded-lg p-1">
      {(['day', 'week', 'month'] as ViewType[]).map((view) => {
        const labels = { day: 'Ngày', week: 'Tuần', month: 'Tháng' };
        const isActive = viewType === view;

        return (
          <TouchableOpacity
            key={view}
            onPress={() => setViewType(view)}
            className={`flex-1 py-2 rounded-md ${
              isActive ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}
            >
              {labels[view]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render custom dropdown button
  const renderDropdownButton = (
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-2"
    >
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-t-3xl max-h-96">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
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
                className={`px-4 py-3 border-b border-gray-100 ${
                  item.value === selectedValue ? 'bg-primary/10' : ''
                }`}
              >
                <Text
                  className={`text-base ${
                    item.value === selectedValue
                      ? 'text-primary font-semibold'
                      : 'text-gray-700'
                  }`}
                >
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
    <View className="bg-white px-4 py-3 border-b border-gray-200">
      {/* Year and Week/Month selectors - NOT shown in day view */}
      {viewType !== 'day' && (
        <View className="flex-row mb-3 gap-2">
          {/* Year picker */}
          {renderDropdownButton(`Năm ${selectedYear}`, () =>
            setShowYearPicker(true)
          )}

          {/* Week picker - only show for week view */}
          {viewType === 'week' &&
            renderDropdownButton(`Tuần ${selectedWeek}`, () =>
              setShowWeekPicker(true)
            )}

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
            className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>

          {/* Selected date */}
          <View className="flex-1 mx-3 px-3 py-2 bg-primary/10 rounded-lg">
            <Text className="text-sm font-semibold text-primary text-center">
              {formatFullDate(selectedDate)}
            </Text>
          </View>

          {/* Next day button */}
          <TouchableOpacity
            onPress={handleNextDay}
            className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
          >
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
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Lịch của tôi
        </Text>
        <View className="w-10" />
      </View>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Calendar View */}
      <CalendarView
        viewType={viewType}
        selectedDate={selectedDate}
        selectedWeek={selectedWeek}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        events={events}
        onDateSelect={handleDateSelect}
      />

      {/* Event List */}
      <EventList
        events={displayEvents}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}
