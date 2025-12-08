import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { getUser } from '../../../utils/storage';
import { User } from '../../../types/api';
import { getAvatarSource, getInitials, getLastName } from '../../../utils/avatar';
import NotificationBadge from '../../../components/NotificationBadge';
import { useUnreadNotifications } from '../../../hooks/useUnreadNotifications';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PTHomeTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const { unreadCount } = useUnreadNotifications();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

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
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-2xl font-bold text-textPrimary">
          Trang chủ PT
        </Text>
      </View>
    </ScrollView>
  );
}
