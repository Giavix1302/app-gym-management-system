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
import { Class, EnrolledClass } from '../../../types/class';
import { classService } from '../../../services/classService';
import { separateEnrolledClasses } from '../../../utils/classHelpers';
import { getUser } from '../../../utils/storage';
import { useNotification } from '../../../context/NotificationContext';
import { Colors } from '../../../constants/colors';
import ClassCard from '../../../components/class/ClassCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'available' | 'enrolled';

export default function UserClassesTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('available');

  // Available classes tab
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [refreshingAvailable, setRefreshingAvailable] = useState(false);

  // Enrolled classes tab
  const [activeEnrolled, setActiveEnrolled] = useState<EnrolledClass[]>([]);
  const [historyEnrolled, setHistoryEnrolled] = useState<EnrolledClass[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [refreshingEnrolled, setRefreshingEnrolled] = useState(false);

  const [userId, setUserId] = useState('');

  // Load user ID on mount
  useEffect(() => {
    loadUserId();
  }, []);

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

  // Fetch available classes
  const fetchAvailableClasses = useCallback(async (isRefreshing = false) => {
    if (!userId) return;

    if (isRefreshing) {
      setRefreshingAvailable(true);
    } else {
      setLoadingAvailable(true);
    }

    try {
      const response = await classService.getListClassForUser();
      console.log('🚀 ~ fetchAvailableClasses ~ response:', response);
      setAvailableClasses(response.classes || []);
    } catch (error) {
      console.error('Error fetching available classes:', error);
      showError('Không thể tải danh sách lớp học');
    } finally {
      setLoadingAvailable(false);
      setRefreshingAvailable(false);
    }
  }, [userId, showError]);

  // Fetch enrolled classes
  const fetchEnrolledClasses = useCallback(async (isRefreshing = false) => {
    if (!userId) return;

    if (isRefreshing) {
      setRefreshingEnrolled(true);
    } else {
      setLoadingEnrolled(true);
    }

    try {
      const response = await classService.getMemberEnrolledClasses(userId);
      console.log('🚀 ~ fetchEnrolledClasses ~ response:', response);

      const classes = response.classes || [];

      // Separate into active and history
      const { active, history } = separateEnrolledClasses(classes);
      setActiveEnrolled(active);
      setHistoryEnrolled(history);
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
      showError('Không thể tải lớp học đã đăng ký');
    } finally {
      setLoadingEnrolled(false);
      setRefreshingEnrolled(false);
    }
  }, [userId, showError]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        if (activeTab === 'available') {
          fetchAvailableClasses();
        } else {
          fetchEnrolledClasses();
        }
      }
    }, [userId, activeTab, fetchAvailableClasses, fetchEnrolledClasses])
  );

  // Navigation handlers
  const handleClassPress = (classData: Class | EnrolledClass) => {
    navigation.navigate('ClassDetail', {
      classId: classData._id,
    });
  };

  // Tab toggle render
  const renderTabToggle = () => (
    <View className="mx-4 mb-4 flex-row rounded-lg bg-gray-100 p-1">
      <TouchableOpacity
        onPress={() => setActiveTab('available')}
        className={`flex-1 rounded-md py-2 ${
          activeTab === 'available' ? 'bg-primary' : 'bg-transparent'
        }`}
        activeOpacity={0.8}>
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === 'available' ? 'text-white' : 'text-gray-600'
          }`}>
          Lớp học khả dụng
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab('enrolled')}
        className={`flex-1 rounded-md py-2 ${
          activeTab === 'enrolled' ? 'bg-primary' : 'bg-transparent'
        }`}
        activeOpacity={0.8}>
        <Text
          className={`text-center text-sm font-semibold ${
            activeTab === 'enrolled' ? 'text-white' : 'text-gray-600'
          }`}>
          Lớp học của tôi
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state render
  const renderEmptyState = (message: string) => (
    <View className="flex-1 items-center justify-center py-32">
      <Ionicons name="school-outline" size={64} color="#D1D5DB" />
      <Text className="mt-4 text-center text-gray-500">{message}</Text>
    </View>
  );

  // Class item render
  const renderClassItem = ({ item }: { item: Class }) => (
    <ClassCard classData={item} enrolled={false} onPress={handleClassPress} />
  );

  const renderEnrolledClassItem = ({ item }: { item: EnrolledClass }) => (
    <ClassCard classData={item} enrolled={true} onPress={handleClassPress} />
  );

  // Render Tab "Lớp học khả dụng"
  const renderAvailableTab = () => {
    if (loadingAvailable) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={availableClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState('Chưa có lớp học nào khả dụng')}
        refreshControl={
          <RefreshControl
            refreshing={refreshingAvailable}
            onRefresh={() => fetchAvailableClasses(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    );
  };

  // Render Tab "Lớp học của tôi"
  const renderEnrolledTab = () => {
    if (loadingEnrolled) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[
          { type: 'active', data: activeEnrolled },
          { type: 'history', data: historyEnrolled },
        ]}
        renderItem={({ item }) => {
          if (item.type === 'active') {
            return (
              <View>
                {/* Section Header */}
                <View className="bg-gray-50 px-4 py-3">
                  <Text className="text-base font-bold text-gray-800">
                    Đang học ({activeEnrolled.length})
                  </Text>
                </View>

                {/* Active Classes */}
                {activeEnrolled.length > 0 ? (
                  activeEnrolled.map((cls) => (
                    <View key={cls._id}>{renderEnrolledClassItem({ item: cls })}</View>
                  ))
                ) : (
                  <View className="items-center py-12">
                    <Ionicons name="school-outline" size={48} color="#D1D5DB" />
                    <Text className="mt-2 text-gray-500">Chưa có lớp học nào đang học</Text>
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
                    Lịch sử ({historyEnrolled.length})
                  </Text>
                </View>

                {/* History Classes */}
                {historyEnrolled.length > 0 ? (
                  historyEnrolled.map((cls) => (
                    <View key={cls._id}>{renderEnrolledClassItem({ item: cls })}</View>
                  ))
                ) : (
                  <View className="items-center py-12">
                    <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                    <Text className="mt-2 text-gray-500">Chưa có lịch sử lớp học</Text>
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
            refreshing={refreshingEnrolled}
            onRefresh={() => fetchEnrolledClasses(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white pb-3">
        <View className="px-4 py-3">
          <Text className="text-2xl font-bold text-gray-800">Lớp học</Text>
        </View>

        {/* Tab Toggle */}
        {renderTabToggle()}
      </View>

      {/* Content */}
      {activeTab === 'available' ? renderAvailableTab() : renderEnrolledTab()}
    </SafeAreaView>
  );
}
