import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { getUser } from '../../../utils/storage';
import { User } from '../../../types/api';
import { getAvatarSource, getInitials } from '../../../utils/avatar';
import ProfileMenuItem from '../../../components/ProfileMenuItem';
import { authService } from '../../../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);

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

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const avatarSource = getAvatarSource(user?.avatar);
  const userInitial = user?.fullName ? getInitials(user.fullName) : '?';
  const isUser = user?.role === 'user';
  const isPT = user?.role === 'pt';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar & Name Section */}
        <View className="items-center py-8 bg-white mb-4">
          {avatarSource ? (
            <Image
              source={avatarSource}
              className="w-[100px] h-[100px] rounded-full mb-4 border-[3px] border-primary"
              resizeMode="cover"
            />
          ) : (
            <View className="w-[100px] h-[100px] rounded-full bg-primary justify-center items-center mb-4 border-[3px] border-primary">
              <Text className="text-white text-[40px] font-bold">
                {userInitial}
              </Text>
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {user?.fullName || 'Người dùng'}
          </Text>
          <Text className="text-base text-gray-600 font-medium">
            {isPT ? 'Huấn luyện viên' : 'Thành viên'}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="bg-white mb-4">
          {/* Common menu items */}
          <ProfileMenuItem
            icon="person-outline"
            title="Hồ sơ cá nhân"
            onPress={() => navigation.navigate('PersonalInfo')}
          />

          {/* User specific menu items */}
          {isUser && (
            <ProfileMenuItem
              icon="trending-up-outline"
              title="Tiến trình thể chất"
              onPress={() => navigation.navigate('FitnessProgress')}
            />
          )}

          <ProfileMenuItem
            icon="time-outline"
            title="Checkin/Checkout"
            onPress={() => navigation.navigate('CheckInOutHistory')}
          />

          <ProfileMenuItem
            icon="receipt-outline"
            title="Lịch sử thanh toán"
            onPress={() => navigation.navigate('PaymentHistory')}
          />

          {/* PT specific menu items */}
          {isPT && (
            <ProfileMenuItem
              icon="cash-outline"
              title="Doanh thu"
              onPress={() => navigation.navigate('Revenue')}
            />
          )}

          <ProfileMenuItem
            icon="lock-closed-outline"
            title="Đổi mật khẩu"
            onPress={() => navigation.navigate('ChangePassword')}
          />

          <ProfileMenuItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={handleLogout}
            showArrow={false}
            isLogout={true}
          />
        </View>

        {/* App Version */}
        <View className="items-center py-6">
          <Text className="text-sm text-gray-400">Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
