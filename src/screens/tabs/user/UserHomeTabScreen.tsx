import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserTabParamList } from '../../../navigation/types';
import { getUser } from '../../../utils/storage';
import { User } from '../../../types/api';
import { getAvatarSource, getInitials, getLastName } from '../../../utils/avatar';
import NotificationBadge from '../../../components/NotificationBadge';
import { useUnreadNotifications } from '../../../hooks/useUnreadNotifications';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<UserTabParamList, 'UserHomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function UserHomeTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const { unreadCount } = useUnreadNotifications();

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

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const avatarSource = getAvatarSource(user?.avatar);
  const userInitial = user?.fullName ? getInitials(user.fullName) : '?';
  const userLastName = user?.fullName ? getLastName(user.fullName) : 'User';

  return (
    <ScrollView className="flex-1 bg-backgroundDefault">
      {/* Header Section - Avatar + Greeting + Notification */}
      <View
        className="border-b border-gray-200"
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 50,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex-row items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <View className="flex-row items-center gap-3">
            {avatarSource ? (
              <Image
                source={avatarSource}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-primary justify-center items-center">
                <Text className="text-white text-lg font-bold">
                  {userInitial}
                </Text>
              </View>
            )}
            <Text className="text-base font-semibold text-textPrimary">
              Xin chào {userLastName}
            </Text>
          </View>

          {/* Right: Notification Icon with Badge */}
          <NotificationBadge count={unreadCount} onPress={handleNotificationPress} />
        </View>
      </View>

      {/* Content Section */}
      <View className="flex-1 p-6">
        {/* Navigation Buttons Grid */}
        <View className="mt-4">
          {/* Row 1 */}
          <View className="flex-row gap-4 mb-4">
            {/* Gói tập Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MembershipTab')}
              className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="barbell" size={32} color="#16697A" />
                </View>
                <Text className="text-base font-semibold text-textPrimary text-center">
                  Gói tập
                </Text>
              </View>
            </TouchableOpacity>

            {/* Đặt PT Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('BookPTTab')}
              className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="calendar" size={32} color="#10b981" />
                </View>
                <Text className="text-base font-semibold text-textPrimary text-center">
                  Đặt PT
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-4">
            {/* Lớp học Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('UserClassesTab')}
              className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="items-center">
                <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="school" size={32} color="#8b5cf6" />
                </View>
                <Text className="text-base font-semibold text-textPrimary text-center">
                  Lớp học
                </Text>
              </View>
            </TouchableOpacity>

            {/* Lịch của tôi Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MySchedule')}
              className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="items-center">
                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="time" size={32} color="#f97316" />
                </View>
                <Text className="text-base font-semibold text-textPrimary text-center">
                  Lịch của tôi
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
