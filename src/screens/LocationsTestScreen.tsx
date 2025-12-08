import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { locationService } from '../services/locationService';
import { Location } from '../types/api';
import { useNotification } from '../context/NotificationContext';
import PrimaryButton from '../components/PrimaryButton';
import axios from 'axios';

export default function LocationsTestScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    fetchLocations();
  
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const response = await locationService.getLocations();

      setLocations(response.locations);
      notification.success(response.message);
    } catch (error: any) {
      console.error('Fetch locations error:', error);
      notification.error('Không thể tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundDefault">
        <ActivityIndicator size="large" color="#16697A" />
        <Text className="text-textSecondary mt-4">Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-backgroundDefault"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-primary mb-2">
            THE GYM
          </Text>
          <Text className="text-xl font-semibold text-textPrimary">
            Danh Sách Chi Nhánh
          </Text>
          <Text className="text-sm text-textSecondary mt-1">
            Tìm thấy {locations.length} chi nhánh
          </Text>
        </View>

        {/* Locations List */}
        {locations.map((location) => (
          <View
            key={location._id}
            className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
          >
            {/* Image Gallery */}
            {location.images && location.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {location.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-80 h-48"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {/* Info */}
            <View className="px-6 pb-6">
              <Text className="text-xl font-bold text-primary mb-3">
                {location.name}
              </Text>

              <View className="mb-2">
                <Text className="text-sm text-textSecondary">📞 Điện thoại</Text>
                <Text className="text-base text-textPrimary">
                  {location.phone}
                </Text>
              </View>

              <View>
                <Text className="text-sm text-textSecondary">📍 Địa chỉ</Text>
                <Text className="text-base text-textPrimary">
                  {location.address.street}, {location.address.ward},{' '}
                  {location.address.province}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Refresh Button */}
        <PrimaryButton title="Tải lại" onPress={onRefresh} />
      </View>
    </ScrollView>
  );
}