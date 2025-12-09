import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { TrainerWithSlots, GroupedBooking, HistoryBooking } from '../../../types/booking';
import { trainerService } from '../../../services/trainerService';
import { bookingService } from '../../../services/bookingService';
import { filterAvailableSlots, groupHistoryBookingsByTrainer } from '../../../utils/bookingHelpers';
import { formatFullDate } from '../../../utils/dateTime';
import { addDays, subDays, isToday } from 'date-fns';
import { useNotification } from '../../../context/NotificationContext';
import { getUser } from '../../../utils/storage';
import { Colors } from '../../../constants/colors';
import TrainerCard from '../../../components/booking/TrainerCard';
import BookingCard from '../../../components/booking/BookingCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'new' | 'booked';

export default function BookPTTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('new');

  // New Booking Tab state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainersWithSlots, setTrainersWithSlots] = useState<TrainerWithSlots[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [refreshingTrainers, setRefreshingTrainers] = useState(false);

  // Booked Sessions Tab state
  const [upcomingBookings, setUpcomingBookings] = useState<GroupedBooking[]>([]);
  console.log('🚀 ~ BookPTTabScreen ~ upcomingBookings:', upcomingBookings);
  const [historyBookings, setHistoryBookings] = useState<
    { trainer: any; bookings: HistoryBooking[] }[]
  >([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshingBookings, setRefreshingBookings] = useState(false);

  const [userId, setUserId] = useState('');

  // Load user ID on mount
  useEffect(() => {
    loadUserId();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        if (activeTab === 'new') {
          fetchTrainers();
        } else {
          fetchBookings();
        }
      }
    }, [userId, activeTab, selectedDate])
  );

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

  // Fetch trainers with available slots
  const fetchTrainers = async (isRefreshing = false) => {
    if (!userId) return;

    if (isRefreshing) {
      setRefreshingTrainers(true);
    } else {
      setLoadingTrainers(true);
    }

    try {
      const response = await trainerService.getListTrainersForUser();
      console.log('🚀 ~ fetchTrainers ~ response:', response);
      const allTrainers = response.listTrainerInfo;

      // Filter trainers with available slots for selected date
      const filtered: TrainerWithSlots[] = allTrainers
        .map((trainer: any) => {
          const availableSlots = filterAvailableSlots(trainer.schedule, selectedDate);
          if (availableSlots.length > 0) {
            return {
              ...trainer,
              availableSlots,
            };
          }
          return null;
        })
        .filter((t: any) => t !== null);

      setTrainersWithSlots(filtered);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      showError('Không thể tải danh sách PT');
    } finally {
      setLoadingTrainers(false);
      setRefreshingTrainers(false);
    }
  };

  // Fetch bookings (upcoming and history)
  const fetchBookings = async (isRefreshing = false) => {
    if (!userId) return;

    if (isRefreshing) {
      setRefreshingBookings(true);
    } else {
      setLoadingBookings(true);
    }

    try {
      const [upcomingRes, historyRes] = await Promise.all([
        bookingService.getUpcomingBookings(userId),
        bookingService.getHistoryBookings(userId),
      ]);
      console.log('🚀 ~ fetchBookings ~ upcomingRes:', upcomingRes);

      // Upcoming bookings already grouped by trainer from API
      setUpcomingBookings(upcomingRes.bookings || []);

      // Group history bookings by trainer
      const groupedHistory = groupHistoryBookingsByTrainer(historyRes.bookings || []);
      setHistoryBookings(groupedHistory);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showError('Không thể tải danh sách lịch đã đặt');
    } finally {
      setLoadingBookings(false);
      setRefreshingBookings(false);
    }
  };

  // Date navigation handlers
  const handlePreviousDay = () => {
    if (isToday(selectedDate)) {
      return; // Don't allow going back from today
    }
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  // Navigation handlers
  const handleTrainerPress = (trainer: TrainerWithSlots) => {
    navigation.navigate('TrainerDetail', {
      trainerId: trainer._id,
      selectedDate: selectedDate.toISOString(),
    });
  };

  const handleBookingCardPress = (trainerId: string, bookingType: 'upcoming' | 'history') => {
    navigation.navigate('BookingDetail', {
      trainerId,
      bookingType,
    });
  };

  // Tab toggle render
  const renderTabToggle = () => (
    <View className="mx-4 mb-4 flex-row rounded-lg bg-gray-100 p-1">
      <TouchableOpacity
        onPress={() => setActiveTab('new')}
        className={`flex-1 rounded-md py-2 ${
          activeTab === 'new' ? 'bg-primary' : 'bg-transparent'
        }`}
        activeOpacity={0.8}>
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === 'new' ? 'text-white' : 'text-gray-600'
          }`}>
          Đặt lịch mới
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab('booked')}
        className={`flex-1 rounded-md py-2 ${
          activeTab === 'booked' ? 'bg-primary' : 'bg-transparent'
        }`}
        activeOpacity={0.8}>
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === 'booked' ? 'text-white' : 'text-gray-600'
          }`}>
          Lịch đã đặt
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Date navigator render
  const renderDateNavigator = () => {
    const isBackDisabled = isToday(selectedDate);

    return (
      <View className="mb-4 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={handlePreviousDay}
          disabled={isBackDisabled}
          className={`rounded-lg p-2 ${isBackDisabled ? 'bg-gray-200' : 'bg-gray-100'}`}
          activeOpacity={0.7}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isBackDisabled ? '#D1D5DB' : Colors.primary}
          />
        </TouchableOpacity>

        <View className="mx-3 flex-1 rounded-lg bg-primary/10 px-3 py-2">
          <Text className="text-center text-sm font-semibold text-primary">
            {formatFullDate(selectedDate)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNextDay}
          className="rounded-lg bg-gray-100 p-2"
          activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Empty state render
  const renderEmptyState = (message: string) => (
    <View className="flex-1 items-center justify-center py-32">
      <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      <Text className="mt-4 text-center text-gray-500">{message}</Text>
    </View>
  );

  // Trainer item render
  const renderTrainerItem = ({ item }: { item: TrainerWithSlots }) => (
    <TrainerCard trainer={item} onPress={handleTrainerPress} />
  );

  // Booking card render
  const renderBookingItem = ({
    item,
    bookingType,
  }: {
    item: GroupedBooking | { trainer: any; bookings: HistoryBooking[] };
    bookingType: 'upcoming' | 'history';
  }) => (
    <BookingCard
      groupedBooking={item as GroupedBooking}
      bookingType={bookingType}
      onPress={(trainerId) => handleBookingCardPress(trainerId, bookingType)}
    />
  );

  // Render Tab "Đặt lịch mới"
  const renderNewBookingTab = () => {
    if (loadingTrainers) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1">
        {renderDateNavigator()}

        <FlatList
          data={trainersWithSlots}
          renderItem={renderTrainerItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState('Không có lịch trống cho ngày này')}
          refreshControl={
            <RefreshControl
              refreshing={refreshingTrainers}
              onRefresh={() => fetchTrainers(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      </View>
    );
  };

  // Render Tab "Lịch đã đặt"
  const renderBookedSessionsTab = () => {
    if (loadingBookings) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <FlatList
          data={[
            { type: 'upcoming', data: upcomingBookings },
            { type: 'history', data: historyBookings },
          ]}
          renderItem={({ item }) => {
            if (item.type === 'upcoming') {
              return (
                <View>
                  {/* Section Header */}
                  <View className="bg-gray-50 px-4 py-3">
                    <Text className="text-base font-bold text-gray-800">
                      Chuẩn bị tập ({upcomingBookings.length})
                    </Text>
                  </View>

                  {/* Upcoming Bookings */}
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => (
                      <View key={booking.trainer.trainerId}>
                        {renderBookingItem({ item: booking, bookingType: 'upcoming' })}
                      </View>
                    ))
                  ) : (
                    <View className="items-center py-12">
                      <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                      <Text className="mt-2 text-gray-500">Chưa có lịch sắp tới</Text>
                    </View>
                  )}
                </View>
              );
            } else {
              return (
                <View>
                  {/* Section Header */}
                  <View className="mt-4 bg-gray-50 px-4 py-3">
                    <Text className="text-base font-bold text-gray-800">
                      Lịch sử ({historyBookings.length})
                    </Text>
                  </View>

                  {/* History Bookings */}
                  {historyBookings.length > 0 ? (
                    historyBookings.map((booking) => (
                      <View key={booking.trainer.trainerId}>
                        {renderBookingItem({ item: booking, bookingType: 'history' })}
                      </View>
                    ))
                  ) : (
                    <View className="items-center py-12">
                      <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                      <Text className="mt-2 text-gray-500">Chưa có lịch sử tập</Text>
                    </View>
                  )}
                </View>
              );
            }
          }}
          keyExtractor={(item) => item.type}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshingBookings}
              onRefresh={() => fetchBookings(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white pb-3">
        <View className="px-4 py-3">
          <Text className="text-2xl font-bold text-gray-800">Đặt PT</Text>
        </View>

        {/* Tab Toggle */}
        {renderTabToggle()}
      </View>

      {/* Content */}
      {activeTab === 'new' ? renderNewBookingTab() : renderBookedSessionsTab()}
    </SafeAreaView>
  );
}
