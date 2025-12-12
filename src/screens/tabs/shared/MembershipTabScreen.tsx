import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { getMyMembership } from '../../../utils/storage';
import { membershipService } from '../../../services/membershipService';
import { Membership, MembershipPackage, EMPTY_MEMBERSHIP } from '../../../types/api';
import MyMembershipCard from '../../../components/MyMembershipCard';
import MembershipPackageCard from '../../../components/MembershipPackageCard';
import { useNotification } from '../../../context/NotificationContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MembershipTabScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { error: showError } = useNotification();
  const [myMembership, setMyMembership] = useState<Membership>(EMPTY_MEMBERSHIP);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load both myMembership and packages in parallel
      const [membershipData, packagesData] = await Promise.all([
        getMyMembership(),
        membershipService.getListMembership(),
      ]);

      setMyMembership(membershipData);

      if (packagesData.success) {
        setPackages(packagesData.memberships);
      }
    } catch (error) {
      console.error('Error loading membership data:', error);
      showError('Không thể tải thông tin gói tập');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleMyMembershipPress = () => {
    navigation.navigate('MembershipDetail', {
      membership: myMembership,
      isMyMembership: true,
    });
  };

  const handlePackagePress = (pkg: MembershipPackage) => {
    navigation.navigate('MembershipDetail', {
      package: pkg,
      isMyMembership: false,
    });
  };

  const hasActiveMembership = myMembership && myMembership.name && myMembership.name !== '';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16697A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#16697A']}
            tintColor="#16697A"
          />
        }>
        {/* My Membership Section - Highlighted */}
        <View className="bg-primary pb-8 pt-6">
          <View className="mb-4 flex-row items-center justify-between px-4">
            <Text className="text-2xl font-bold text-white">Gói tập của tôi</Text>
            {hasActiveMembership && (
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-semibold text-white">Đang hoạt động</Text>
              </View>
            )}
          </View>

          {hasActiveMembership ? (
            <MyMembershipCard membership={myMembership} onPress={handleMyMembershipPress} />
          ) : (
            <View className="mx-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <View className="items-center">
                <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                  <Ionicons name="barbell-outline" size={48} color="#16697A" />
                </View>
                <Text className="mb-2 text-xl font-bold text-gray-800">Bạn chưa có gói tập</Text>
                <Text className="mb-4 text-center text-sm text-gray-600">
                  Chọn gói tập phù hợp bên dưới để bắt đầu tập luyện
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="arrow-down" size={20} color="#16697A" />
                  <Text className="ml-1 text-sm font-medium text-primary">Xem các gói tập</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Available Packages Section */}
        <View className="mb-6 mt-8">
          <View className="mb-4 flex-row items-center justify-between px-4">
            <Text className="text-2xl font-bold text-gray-800">Các gói tập khả dụng</Text>
            <View className="flex-row items-center rounded-full bg-primary/10 px-3 py-1">
              <Ionicons name="pricetag" size={14} color="#16697A" />
              <Text className="ml-1 text-xs font-semibold text-primary">{packages.length} gói</Text>
            </View>
          </View>

          {packages.length > 0 ? (
            packages.map((pkg) => (
              <MembershipPackageCard
                key={pkg._id}
                package={pkg}
                onPress={() => handlePackagePress(pkg)}
              />
            ))
          ) : (
            <View className="mx-4 rounded-2xl bg-white p-6">
              <View className="items-center">
                <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
                <Text className="mt-3 text-base text-gray-600">Hiện chưa có gói tập nào</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
