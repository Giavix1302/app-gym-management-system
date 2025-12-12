import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { RootStackParamList } from '../../navigation/types';
import { progressService, ProgressRecord } from '../../services/progressService';
import { getUser } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import { Colors } from '../../constants/colors';
import ConfirmModal from '../../components/modals/ConfirmModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

export default function FitnessProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressRecord[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgressId, setSelectedProgressId] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load user ID
  useEffect(() => {
    loadUserId();
  }, []);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadProgressData();
      }
    }, [userId])
  );

  const loadUserId = async () => {
    try {
      const user = await getUser();
      if (user && user._id) {
        setUserId(user._id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await progressService.getAllProgressByUserId(userId, {
        sortBy: 'measurementDate',
        sortOrder: 'desc',
      });
      setProgressData(response.data || []);
    } catch (error: any) {
      console.error('Error loading progress data:', error);
      notification.error('Không thể tải dữ liệu tiến trình');
    } finally {
      setLoading(false);
    }
  }, [userId, notification]);

  const handleDelete = (progressId: string, isLatest: boolean) => {
    if (!isLatest) {
      notification.warning('Chỉ có thể xóa bản ghi mới nhất');
      return;
    }

    setSelectedProgressId(progressId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await progressService.deleteProgress(selectedProgressId);
      setShowDeleteModal(false);
      setDeleteLoading(false);
      notification.success('Đã xóa bản ghi thành công');
      loadProgressData();
    } catch (error: any) {
      console.error('Error deleting progress:', error);
      notification.error('Không thể xóa bản ghi');
      setDeleteLoading(false);
    }
  };

  const handleEdit = (record: ProgressRecord) => {
    navigation.navigate('AddEditProgress', {
      progressId: record._id,
      progressData: record,
    });
  };

  const handleAdd = () => {
    navigation.navigate('AddEditProgress', {});
  };

  // Calculate statistics
  const getLatestRecord = () => progressData[0];
  const getChangeFromPrevious = (key: keyof ProgressRecord) => {
    if (progressData.length < 2) return null;
    const latest = progressData[0];
    const previous = progressData[1];
    const latestValue = Number(latest[key]);
    const previousValue = Number(previous[key]);
    return latestValue - previousValue;
  };

  // Prepare chart data
  const getChartData = () => {
    if (progressData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [0],
            color: () => '#10B981',
          },
        ],
      };
    }

    // Get last 7 records (reversed for chronological order)
    const recentData = [...progressData].reverse().slice(-7);

    return {
      labels: recentData.map((record) =>
        format(new Date(record.measurementDate), 'dd/MM', { locale: vi })
      ),
      datasets: [
        {
          data: recentData.map((record) => record.weight),
          color: () => Colors.primary, // Primary color for weight
          strokeWidth: 2,
        },
        {
          data: recentData.map((record) => record.bodyFat),
          color: () => Colors.error, // Red for body fat
          strokeWidth: 2,
        },
        {
          data: recentData.map((record) => record.muscleMass),
          color: () => Colors.success, // Green for muscle mass
          strokeWidth: 2,
        },
      ],
    };
  };

  const renderStatCard = (
    title: string,
    value: number | string,
    unit: string,
    icon: any,
    change?: number | null,
    color: string = '#3B82F6'
  ) => (
    <View className="mx-1 flex-1 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">{title}</Text>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-800">
        {value}
        <Text className="text-sm text-gray-500"> {unit}</Text>
      </Text>
      {change !== null && change !== undefined && (
        <View className="mt-1 flex-row items-center">
          <Ionicons
            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={change >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text className={`ml-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change).toFixed(1)} so với lần trước
          </Text>
        </View>
      )}
    </View>
  );

  const renderTableRow = (record: ProgressRecord, index: number) => {
    const isLatest = index === 0;
    return (
      <View
        key={record._id}
        className={`border-b border-gray-200 py-3 ${isLatest ? 'bg-green-50' : 'bg-white'}`}>
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-800">
              {format(new Date(record.measurementDate), 'dd/MM/yyyy', { locale: vi })}
              {isLatest && (
                <Text className="text-xs" style={{ color: Colors.primary }}>
                  {' '}
                  (Mới nhất)
                </Text>
              )}
            </Text>
            <View className="mt-2 flex-row space-x-4">
              <Text className="text-xs text-gray-600">
                Cân nặng: <Text className="font-semibold">{record.weight} kg</Text>
              </Text>
              <Text className="text-xs text-gray-600">
                Mỡ: <Text className="font-semibold">{record.bodyFat}%</Text>
              </Text>
              <Text className="text-xs text-gray-600">
                Cơ: <Text className="font-semibold">{record.muscleMass} kg</Text>
              </Text>
            </View>
            {record.note && (
              <Text className="mt-1 text-xs italic text-gray-500">{record.note}</Text>
            )}
          </View>
          <View className="flex-row items-center space-x-2">
            {isLatest && (
              <View>
                <TouchableOpacity
                  onPress={() => handleEdit(record)}
                  className="rounded-lg bg-green-100 p-2">
                  <Ionicons name="pencil" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(record._id, isLatest)}
                  className="rounded-lg bg-red-100 p-2">
                  <Ionicons name="trash" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-gray-800">
            Tiến trình thể chất
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const latestRecord = getLatestRecord();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">
          Tiến trình thể chất
        </Text>
        <TouchableOpacity onPress={handleAdd} className="w-10 p-1">
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {progressData.length === 0 ? (
          <View className="flex-1 items-center justify-center py-32">
            <Ionicons name="trending-up-outline" size={80} color="#D1D5DB" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              Chưa có dữ liệu đo lường
            </Text>
            <Text className="mt-2 px-8 text-center text-sm text-gray-400">
              Nhấn vào dấu + để thêm bản ghi đầu tiên
            </Text>
          </View>
        ) : (
          <>
            {/* Dashboard - Quick Stats */}
            <View className="px-4 py-4">
              <Text className="mb-3 text-lg font-bold text-gray-800">Thống kê nhanh</Text>
              <View className="flex-row">
                {renderStatCard(
                  'Cân nặng',
                  latestRecord?.weight || 0,
                  'kg',
                  'barbell-outline',
                  getChangeFromPrevious('weight'),
                  Colors.primary
                )}
                {renderStatCard(
                  'Mỡ cơ thể',
                  latestRecord?.bodyFat || 0,
                  '%',
                  'water-outline',
                  getChangeFromPrevious('bodyFat'),
                  '#EF4444'
                )}
              </View>
              <View className="mt-2 flex-row">
                {renderStatCard(
                  'Khối lượng cơ',
                  latestRecord?.muscleMass || 0,
                  'kg',
                  'fitness-outline',
                  getChangeFromPrevious('muscleMass'),
                  '#10B981'
                )}
                {renderStatCard(
                  'Tổng bản ghi',
                  progressData.length,
                  'lần',
                  'stats-chart-outline',
                  null,
                  '#8B5CF6'
                )}
              </View>
            </View>

            {/* Charts */}
            {progressData.length > 1 && (
              <View className="mt-2 bg-white px-4 py-4">
                <Text className="mb-3 text-lg font-bold text-gray-800">Biểu đồ xu hướng</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={getChartData()}
                    width={Math.max(screenWidth - 32, progressData.length * 80)}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(22, 105, 122, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                      },
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </ScrollView>
                <View className="mt-2 flex-row items-center justify-center space-x-4">
                  <View className="flex-row items-center">
                    <View
                      className="mr-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: Colors.primary }}
                    />
                    <Text className="text-xs text-gray-600">Cân nặng</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="mr-1 h-3 w-3 rounded-full bg-red-500" />
                    <Text className="text-xs text-gray-600">Mỡ cơ thể</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                    <Text className="text-xs text-gray-600">Khối lượng cơ</Text>
                  </View>
                </View>
              </View>
            )}

            {/* History Table */}
            <View className="mt-2 bg-white py-4">
              <Text className="mb-3 px-4 text-lg font-bold text-gray-800">Lịch sử đo lường</Text>
              {progressData.map((record, index) => renderTableRow(record, index))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa bản ghi này?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleteLoading}
      />
    </SafeAreaView>
  );
}
