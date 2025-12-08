import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { User, Membership } from '../types/api';
import { getUser, getMyMembership } from '../utils/storage';
import { authService } from '../services/authService';
import PrimaryButton from '../components/PrimaryButton';

type UserHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserHome'
>;

interface UserHomeScreenProps {
  navigation: UserHomeScreenNavigationProp;
}

export default function UserHomeScreen({ navigation }: UserHomeScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getUser();
    const membershipData = await getMyMembership();
    setUser(userData);
    setMembership(membershipData);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView className="flex-1 bg-backgroundDefault">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-primary mb-2">
            THE GYM
          </Text>
          <Text className="text-xl font-semibold text-textPrimary">
            Xin chào, {user?.fullName || 'User'}!
          </Text>
        </View>

        {/* Membership Card */}
        {membership && membership.name ? (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-primary mb-4">
              Gói tập của bạn
            </Text>
            <View className="mb-3">
              <Text className="text-base font-semibold text-textPrimary">
                {membership.name}
              </Text>
              <Text className="text-sm text-textSecondary">
                Thời hạn: {membership.durationMonth} tháng
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <View>
                <Text className="text-sm text-textSecondary">
                  Số buổi còn lại
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  {membership.remainingSessions}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-textSecondary">
                  Tổng số lần checkin
                </Text>
                <Text className="text-2xl font-bold text-success">
                  {membership.totalCheckin}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-textSecondary">Bắt đầu</Text>
                <Text className="text-sm font-medium text-textPrimary">
                  {membership.startDate}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-textSecondary">Kết thúc</Text>
                <Text className="text-sm font-medium text-textPrimary">
                  {membership.endDate}
                </Text>
              </View>
            </View>
            <View className="mt-3">
              <Text className="text-sm text-textSecondary">Trạng thái</Text>
              <Text className="text-sm font-semibold text-success">
                {membership.status}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-base text-textSecondary text-center">
              Bạn chưa có gói tập nào
            </Text>
          </View>
        )}

        {/* User Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-primary mb-4">
            Thông tin cá nhân
          </Text>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Email</Text>
            <Text className="text-base text-textPrimary">{user?.email}</Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Số điện thoại</Text>
            <Text className="text-base text-textPrimary">{user?.phone}</Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Giới tính</Text>
            <Text className="text-base text-textPrimary">{user?.gender}</Text>
          </View>
          <View>
            <Text className="text-sm text-textSecondary">Địa chỉ</Text>
            <Text className="text-base text-textPrimary">{user?.address}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <PrimaryButton
          title="Đăng xuất"
          onPress={handleLogout}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}
