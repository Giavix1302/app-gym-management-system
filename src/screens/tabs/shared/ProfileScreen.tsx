import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { getUser } from '../../../utils/storage';
import { User } from '../../../types/api';
import { getAvatarSource, getInitials } from '../../../utils/avatar';
import ProfileMenuItem from '../../../components/ProfileMenuItem';
import { authService } from '../../../services/authService';
import ConfirmModal from '../../../components/modals/ConfirmModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

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
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await authService.logout();
      setShowLogoutModal(false);
      setLogoutLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      setLogoutLoading(false);
    }
  };

  const avatarSource = getAvatarSource(user?.avatar);
  const userInitial = user?.fullName ? getInitials(user.fullName) : '?';
  const isUser = user?.role === 'user';
  const isPT = user?.role === 'pt';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Avatar & Name Section */}
        <View className="mb-4 items-center bg-white py-8">
          {avatarSource ? (
            <Image
              source={avatarSource}
              className="mb-4 h-[100px] w-[100px] rounded-full border-[3px] border-primary"
              resizeMode="cover"
            />
          ) : (
            <View className="mb-4 h-[100px] w-[100px] items-center justify-center rounded-full border-[3px] border-primary bg-primary">
              <Text className="text-[40px] font-bold text-white">{userInitial}</Text>
            </View>
          )}
          <Text className="mb-1 text-2xl font-bold text-gray-800">
            {user?.fullName || 'Người dùng'}
          </Text>
          <Text className="text-base font-medium text-gray-600">
            {isPT ? 'Huấn luyện viên' : 'Thành viên'}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="mb-4 bg-white">
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

      {/* Confirm Logout Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        confirmStyle="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        loading={logoutLoading}
      />
    </SafeAreaView>
  );
}
