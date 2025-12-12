import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserTabParamList } from '../../../navigation/types';
import { getUser } from '../../../utils/storage';
import { User } from '../../../types/api';
import { getAvatarSource, getInitials, getLastName } from '../../../utils/avatar';
import NotificationBadge from '../../../components/NotificationBadge';
import { useUnreadNotifications } from '../../../hooks/useUnreadNotifications';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { eventService } from '../../../services/eventService';
import { ScheduleEvent } from '../../../types/api';
import { formatDateForAPI, isSameDayCheck } from '../../../utils/dateTime';
import EventCard from '../../../components/schedule/EventCard';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<UserTabParamList, 'UserHomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function UserHomeTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const { unreadCount } = useUnreadNotifications();
  const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const loadUser = useCallback(async () => {
    const userData = await getUser();
    setUser(userData);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshUser = async () => {
        const userData = await getUser();
        if (isActive) setUser(userData);
      };

      refreshUser();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Fetch today's events
  const fetchTodayEvents = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoadingEvents(true);
      const today = new Date();
      const response = await eventService.getUserEvents(user._id, {
        viewType: 'day',
        date: formatDateForAPI(today),
      });

      // Filter events for today only (client-side backup)
      const filtered = response.data.events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return isSameDayCheck(eventDate, today);
      });

      setTodayEvents(filtered);
    } catch (error) {
      console.error('Error fetching today events:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchTodayEvents();
    }
  }, [user, fetchTodayEvents]);

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleEventPress = () => {
    navigation.navigate('MySchedule');
  };

  const avatarSource = getAvatarSource(user?.avatar);
  const userInitial = user?.fullName ? getInitials(user.fullName) : '?';
  const userLastName = user?.fullName ? getLastName(user.fullName) : 'User';

  return (
    <ScrollView className="flex-1 bg-backgroundDefault">
      {/* Header Section - Avatar + Greeting + Notification */}
      <View
        className="border-b border-gray-200 bg-white"
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 50,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}>
        <View className="flex-row items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <View className="flex-row items-center gap-3">
            {avatarSource ? (
              <Image source={avatarSource} className="h-12 w-12 rounded-full" resizeMode="cover" />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Text className="text-lg font-bold text-white">{userInitial}</Text>
              </View>
            )}
            <Text className="text-xl font-semibold text-textPrimary">Xin chào {userLastName}</Text>
          </View>

          {/* Right: Chatbot Icon + Notification Icon with Badge */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Chatbot')}
              className="rounded-full bg-primary/10 p-2">
              <FontAwesome5 name="robot" size={20} color="#16697A" />
            </TouchableOpacity>
            <NotificationBadge count={unreadCount} onPress={handleNotificationPress} />
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View className="px-4 py-6">
        {/* Navigation Buttons - 2x2 Grid */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-800">Chức năng</Text>

          {/* Row 1 */}
          <View className="mb-3 flex-row gap-3">
            {/* Gói tập Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MembershipTab')}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Ionicons name="barbell" size={24} color="#16697A" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Gói tập</Text>
              </View>
            </TouchableOpacity>

            {/* Đặt PT Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('BookPTTab')}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <Ionicons name="calendar" size={24} color="#10b981" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Đặt PT</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View className="mb-3 flex-row gap-3">
            {/* Lớp học Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('UserClassesTab')}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                  <Ionicons name="school" size={24} color="#8b5cf6" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Lớp học</Text>
              </View>
            </TouchableOpacity>

            {/* Lịch của tôi Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MySchedule')}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <Ionicons name="time" size={24} color="#f97316" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Lịch của tôi</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 3 */}
          <View className="flex-row gap-3">
            {/* Mã QR của tôi Button */}
            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  <Ionicons name="qr-code-outline" size={24} color="#14b8a6" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Mã QR của tôi</Text>
              </View>
            </TouchableOpacity>

            {/* Tin nhắn Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('UserMessages')}
              className="flex-1 rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                  <Ionicons name="chatbubble-outline" size={24} color="#ec4899" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">Tin nhắn</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule Section */}
        <View className="mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-800">Lịch hôm nay</Text>
            {todayEvents.length > 0 && (
              <TouchableOpacity onPress={handleEventPress} className="flex-row items-center">
                <Text className="mr-1 text-sm font-medium text-primary">Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={16} color="#16697A" />
              </TouchableOpacity>
            )}
          </View>

          {/* Events List or Empty State */}
          {loadingEvents ? (
            <View className="items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
              <ActivityIndicator size="large" color="#16697A" />
              <Text className="mt-3 text-sm text-gray-500">Đang tải lịch...</Text>
            </View>
          ) : todayEvents.length === 0 ? (
            <View className="items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
              <View className="mb-3 rounded-full bg-gray-100 p-4">
                <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="mb-1 text-base font-semibold text-gray-700">
                Không có lịch hôm nay
              </Text>
              <Text className="text-center text-sm text-gray-500">
                Hãy đặt lịch tập PT hoặc đăng ký lớp học nhé!
              </Text>
            </View>
          ) : (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              {/* Scrollable Events Container */}
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}>
                {todayEvents.map((event) => (
                  <TouchableOpacity key={event._id} onPress={handleEventPress} activeOpacity={0.7}>
                    <EventCard event={event} />
                  </TouchableOpacity>
                ))}

                {/* Event Count Summary */}
                <View className="mb-1 mt-2 flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="ml-2 text-sm text-gray-600">
                    {todayEvents.length} sự kiện hôm nay
                  </Text>
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        <View className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-blue-50 p-4">
          <View className="flex-row items-start">
            <View className="mr-3 rounded-full bg-primary/20 p-2">
              <Ionicons name="bulb" size={20} color="#16697A" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-gray-800">Mẹo tập luyện</Text>
              <Text className="text-xs leading-5 text-gray-600">
                Hãy đảm bảo uống đủ nước và khởi động kỹ trước mỗi buổi tập để đạt hiệu quả tốt
                nhất!
              </Text>
            </View>
          </View>
        </View>
      </View>

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
    </ScrollView>
  );
}
