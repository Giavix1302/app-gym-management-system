import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { trainerService } from '../../services/trainerService';
import { RevenueItem, RevenueResponse } from '../../types/api';
import { Colors } from '../../constants/colors';

interface StatsData {
  totalRevenue: number;
  bookingCount: number;
  classSessionCount: number;
}

export default function RevenueScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    bookingCount: 0,
    classSessionCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Get userId from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user._id);
        }
      } catch (error) {
        console.error('Error getting user from AsyncStorage:', error);
      }
    };
    getUserId();
  }, []);

  // Calculate statistics
  const calculateStats = (data: RevenueItem[]) => {
    const totalRevenue = data.reduce((sum, item) => sum + item.price, 0);
    const bookingCount = data.filter((item) => item.userName).length;
    const classSessionCount = data.filter((item) => item.roomName).length;

    setStats({ totalRevenue, bookingCount, classSessionCount });
  };

  // Fetch revenue data
  const fetchRevenueData = useCallback(
    async (page = 1, isRefresh = false) => {
      if (!userId) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response: RevenueResponse = await trainerService.getTrainerRevenue(userId, page, 20);

        if (response.success) {
          if (isRefresh || page === 1) {
            setRevenueData(response.data);
            calculateStats(response.data);
          } else {
            setRevenueData((prev) => {
              const newData = [...prev, ...response.data];
              calculateStats(newData);
              return newData;
            });
          }

          setHasMore(response.pagination.hasNext);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchRevenueData(1, false);
    }
  }, [userId, fetchRevenueData]);

  // Handle refresh
  const onRefresh = () => {
    setCurrentPage(1);
    fetchRevenueData(1, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && !refreshing && hasMore) {
      fetchRevenueData(currentPage + 1, false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Render stat card
  const renderStatCard = (title: string, value: string, icon: any, color: string) => (
    <View className="mx-1 flex-1 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">{title}</Text>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-xl font-bold text-gray-800">{value}</Text>
    </View>
  );

  // Render revenue item
  const renderRevenueItem = ({ item }: { item: RevenueItem }) => {
    const isBooking = !!item.userName;
    return (
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {/* Type Badge */}
            <View className="mb-2 flex-row items-center">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${Colors.primary}20` }}>
                <Text className="text-xs font-semibold" style={{ color: Colors.primary }}>
                  {isBooking ? 'Dạy kèm' : 'Lớp học'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-sm font-medium text-gray-800" numberOfLines={2}>
              {item.title}
            </Text>

            {/* Date and Info */}
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500">
                {format(new Date(item.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </Text>
              <Text className="mx-2 text-xs text-gray-400">•</Text>
              <Ionicons
                name={isBooking ? 'person-outline' : 'people-outline'}
                size={14}
                color="#6B7280"
              />
              <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
                {isBooking ? item.userName : item.roomName}
              </Text>
            </View>

            {/* Location */}
            <View className="mt-1 flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
                {item.locationName}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View className="ml-3 items-end">
            <Text className="text-base font-bold" style={{ color: Colors.primary }}>
              {formatCurrency(item.price)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="flex-1 items-center justify-center py-32">
        <Ionicons name="wallet-outline" size={80} color="#D1D5DB" />
        <Text className="mt-4 text-xl font-semibold text-gray-600">Chưa có dữ liệu</Text>
        <Text className="mt-2 px-8 text-center text-sm text-gray-400">
          Doanh thu của bạn sẽ hiển thị tại đây
        </Text>
      </View>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-gray-800">Doanh thu</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">Doanh thu</Text>
        <View className="w-10" />
      </View>

      {/* Statistics Cards */}
      <View className="flex-row px-4 py-4">
        {renderStatCard(
          'Tổng doanh thu',
          formatCurrency(stats.totalRevenue),
          'wallet-outline',
          Colors.primary
        )}
        {renderStatCard(
          'Tổng giao dịch',
          (stats.bookingCount + stats.classSessionCount).toString(),
          'receipt-outline',
          Colors.info
        )}
      </View>

      {/* Secondary Stats */}
      <View className="flex-row px-4 pb-4">
        {renderStatCard(
          'Số buổi dạy kèm',
          stats.bookingCount.toString(),
          'person-outline',
          Colors.success
        )}
        {renderStatCard(
          'Số buổi dạy lớp',
          stats.classSessionCount.toString(),
          'people-outline',
          '#8B5CF6'
        )}
      </View>

      {/* Revenue List */}
      <FlatList
        data={revenueData}
        renderItem={renderRevenueItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={revenueData.length === 0 ? { flex: 1 } : undefined}
        className="mt-2"
      />
    </SafeAreaView>
  );
}
