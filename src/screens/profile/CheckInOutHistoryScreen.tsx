import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getListAttendanceByUserIdAPI, Attendance } from '../../services/attendanceService';
import { UserDetail } from '../../services/userService';
import { convertUTCToVietnam, formatTime } from '../../utils/dateTime';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CheckInOutHistoryScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Stats for last 7 days
  const [weeklyStats, setWeeklyStats] = useState({
    totalSessions: 0,
    totalHours: 0,
  });

  // Load user from AsyncStorage
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
        loadAttendances(userData._id, 1);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  const loadAttendances = async (userId: string, page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getListAttendanceByUserIdAPI(userId, {
        page,
        limit: 10,
      });

      if (page === 1) {
        setAttendances(response.attendances);
        calculateWeeklyStats(response.attendances);
      } else {
        setAttendances((prev) => [...prev, ...response.attendances]);
      }

      setCurrentPage(page);
      setHasMore(response.pagination.hasNext);
    } catch (error) {
      console.error('Error loading attendances:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const calculateWeeklyStats = (attendanceList: Attendance[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttendances = attendanceList.filter((attendance) => {
      const checkinDate = new Date(attendance.checkinTime);
      return checkinDate >= sevenDaysAgo;
    });

    const totalSessions = recentAttendances.length;
    const totalHours = recentAttendances.reduce((sum, att) => sum + att.hours, 0);

    setWeeklyStats({
      totalSessions,
      totalHours: Math.round(totalHours * 100) / 100,
    });
  };

  const onRefresh = useCallback(() => {
    if (user) {
      setRefreshing(true);
      loadAttendances(user._id, 1);
    }
  }, [user]);

  const loadMore = () => {
    if (!loadingMore && hasMore && user) {
      loadAttendances(user._id, currentPage + 1);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      loadMore();
    }
  };

  const renderAttendanceItem = (attendance: Attendance) => {
    const checkinDate = convertUTCToVietnam(attendance.checkinTime);
    const checkoutDate = attendance.checkoutTime
      ? convertUTCToVietnam(attendance.checkoutTime)
      : null;

    const dateStr = format(checkinDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    const checkinTimeStr = formatTime(checkinDate);
    const checkoutTimeStr = checkoutDate ? formatTime(checkoutDate) : '--:--';

    return (
      <View key={attendance._id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-gray-800 capitalize">{dateStr}</Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-primary">{attendance.hours}h</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
            {attendance.location.name}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="log-in-outline" size={16} color="#10B981" />
            <Text className="text-sm text-gray-600 ml-1">Check-in: {checkinTimeStr}</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text className="text-sm text-gray-600 ml-1">Check-out: {checkoutTimeStr}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-backgroundDefault">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
            Lịch sử Check-in/Check-out
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-backgroundDefault">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Lịch sử Check-in/Check-out
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overview Cards */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-base font-semibold text-gray-800 mb-3">Tổng quan 7 ngày gần nhất</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="calendar-outline" size={24} color="#16697A" />
                <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                  <Text className="text-lg font-bold text-primary">{weeklyStats.totalSessions}</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600">Số buổi tập</Text>
            </View>

            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="time-outline" size={24} color="#16697A" />
                <View className="bg-primary/10 px-2 h-10 rounded-full items-center justify-center">
                  <Text className="text-lg font-bold text-primary">{weeklyStats.totalHours}h</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600">Tổng số giờ</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        {user?.qrCode && (
          <View className="px-4 py-4">
            <Text className="text-base font-semibold text-gray-800 mb-3">Mã QR của bạn</Text>
            <View className="bg-white rounded-lg p-6 items-center shadow-sm">
              <Image
                source={{ uri: user.qrCode }}
                className="w-48 h-48"
                resizeMode="contain"
              />
              <Text className="text-sm text-gray-600 mt-3">{user.fullName}</Text>
              <Text className="text-xs text-gray-400 mt-1">{user.phone}</Text>
            </View>
          </View>
        )}

        {/* Attendance History List */}
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-gray-800 mb-3">Lịch sử tập luyện</Text>

          {attendances.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text className="text-base text-gray-600 mt-4">Chưa có lịch sử tập luyện</Text>
              <Text className="text-sm text-gray-400 mt-2 text-center">
                Hãy check-in tại phòng gym để bắt đầu ghi nhận lịch sử
              </Text>
            </View>
          ) : (
            <>
              {attendances.map((attendance) => renderAttendanceItem(attendance))}

              {loadingMore && (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#16697A" />
                </View>
              )}

              {!hasMore && attendances.length > 0 && (
                <View className="py-4 items-center">
                  <Text className="text-sm text-gray-400">Đã hiển thị tất cả lịch sử</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
