import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Trainer, Membership } from '../types/api';
import { getTrainer, getMyMembership } from '../utils/storage';
import { authService } from '../services/authService';
import PrimaryButton from '../components/PrimaryButton';

type PTHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PTHome'
>;

interface PTHomeScreenProps {
  navigation: PTHomeScreenNavigationProp;
}

export default function PTHomeScreen({ navigation }: PTHomeScreenProps) {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    const trainerData = await getTrainer();
    const membershipData = await getMyMembership();
    setTrainer(trainerData);
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
            Xin chào, PT {trainer?.fullName || 'Trainer'}!
          </Text>
          <Text className="text-sm text-textSecondary mt-1">
            Huấn luyện viên cá nhân
          </Text>
        </View>

        {/* Membership Card (PT cũng có membership) */}
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
          </View>
        ) : null}

        {/* PT Professional Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-primary mb-4">
            Thông tin nghề nghiệp
          </Text>
          <View className="mb-3">
            <Text className="text-sm text-textSecondary">Chuyên môn</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.specialty || 'Chưa cập nhật'}
            </Text>
          </View>
          <View className="mb-3">
            <Text className="text-sm text-textSecondary">Kinh nghiệm</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.experience || 0} năm
            </Text>
          </View>
          <View className="mb-3">
            <Text className="text-sm text-textSecondary">Chứng chỉ</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.certification || 'Chưa cập nhật'}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-textSecondary">Thành tích</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.achievements || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>

        {/* Personal Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-primary mb-4">
            Thông tin cá nhân
          </Text>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Email</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.email}
            </Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Số điện thoại</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.phone}
            </Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Giới tính</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.gender}
            </Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Chiều cao</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.height} cm
            </Text>
          </View>
          <View className="mb-2">
            <Text className="text-sm text-textSecondary">Cân nặng</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.weight} kg
            </Text>
          </View>
          <View>
            <Text className="text-sm text-textSecondary">Địa chỉ</Text>
            <Text className="text-base text-textPrimary">
              {trainer?.address}
            </Text>
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
