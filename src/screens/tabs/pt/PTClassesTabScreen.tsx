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
import PTClassItem from '../../../components/class/PTClassItem';
import { ptClassService } from '../../../services/ptClassService';
import { PTClass, ClassSessionEvent } from '../../../types/class';
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

type TabType = 'current' | 'completed';

// Helper function to generate unique colors for classes
const generateClassColor = (classId: string): string => {
  const colors = [
    '#16697A', // primary blue
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EF4444', // red
    '#EC4899', // pink
    '#06B6D4', // cyan
  ];

  // Simple hash function to consistently assign colors based on classId
  let hash = 0;
  for (let i = 0; i < classId.length; i++) {
    hash = classId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function PTClassesTabScreen() {
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
  const [allClasses, setAllClasses] = useState<PTClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('current');

  const fetchClasses = async (id: string) => {
    try {
      const response = await ptClassService.getListClassForTrainer(id);
      setAllClasses(response.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showError('Không thể tải danh sách lớp học');
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
          await fetchClasses(trainer._id);
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
        fetchClasses(trainerId);
      }
    }, [trainerId])
  );

  const handleRefresh = () => {
    if (trainerId) {
      setRefreshing(true);
      fetchClasses(trainerId);
    }
  };

  const handleClassPress = (classData: PTClass) => {
    navigation.navigate('PTClassDetail', { classData });
  };

  const handleDateSelect = (date: Date) => {
    // Get all class sessions for the selected date
    const sessionsForDate: ClassSessionEvent[] = [];

    allClasses.forEach((classData) => {
      classData.classSession.forEach((session) => {
        const sessionDate = new Date(session.startTime);
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

        if (sessionDateOnly.getTime() === selectedDateOnly.getTime()) {
          sessionsForDate.push({
            _id: session._id,
            classId: classData._id,
            className: classData.name,
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.roomName,
            title: session.title,
            classType: classData.classType,
            image: classData.image,
          });
        }
      });
    });

    // Navigate to DailyClassSessionScreen with selected date and sessions
    navigation.navigate('DailyClassSession', {
      selectedDate: date.toISOString(),
      sessions: sessionsForDate,
    });
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

  // Categorize classes into tabs
  const categorizeClasses = (): {
    current: PTClass[];
    completed: PTClass[];
  } => {
    const now = new Date();
    const current: PTClass[] = [];
    const completed: PTClass[] = [];

    allClasses.forEach((classData) => {
      const endDate = new Date(classData.endDate);

      if (endDate < now) {
        completed.push(classData);
      } else {
        current.push(classData);
      }
    });

    // Sort by startDate
    current.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    completed.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()); // Descending for completed

    return { current, completed };
  };

  const { current, completed } = categorizeClasses();

  // Get current tab classes
  const currentClasses = activeTab === 'current' ? current : completed;

  // Convert class sessions to events for calendar
  const calendarEvents: ScheduleEvent[] = [];
  const classColorMap: { [classId: string]: string } = {};

  allClasses.forEach((classData) => {
    // Assign a color to this class
    if (!classColorMap[classData._id]) {
      classColorMap[classData._id] = generateClassColor(classData._id);
    }

    classData.classSession.forEach((session) => {
      calendarEvents.push({
        _id: session._id,
        title: classData.name,
        startTime: session.startTime,
        endTime: session.endTime,
        locationName: classData.locationInfo.name,
        locationId: classData.locationInfo._id,
        trainerName: '',
        eventType: 'class' as const,
        status: 'active',
        color: classColorMap[classData._id],
      });
    });
  });

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
            Bạn cần đăng nhập bằng tài khoản PT để quản lý lớp học
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        {/* Title */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">Quản lý lớp học</Text>
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
            activeTab === 'current' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('current')}>
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'current' ? 'text-primary' : 'text-gray-600'
            }`}>
            Đang dạy ({current.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center border-b-2 py-3 ${
            activeTab === 'completed' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('completed')}>
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'completed' ? 'text-primary' : 'text-gray-600'
            }`}>
            Đã hoàn thành ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class List for Current Tab */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View className="p-4">
          {currentClasses.length === 0 ? (
            <View className="mt-8 items-center">
              <Ionicons name="school-outline" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-center text-gray-500">
                {activeTab === 'current' && 'Chưa có lớp học nào đang dạy'}
                {activeTab === 'completed' && 'Chưa có lớp học nào hoàn thành'}
              </Text>
            </View>
          ) : (
            currentClasses.map((classData) => (
              <PTClassItem
                key={classData._id}
                class={classData}
                onPress={() => handleClassPress(classData)}
                isCompleted={activeTab === 'completed'}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
