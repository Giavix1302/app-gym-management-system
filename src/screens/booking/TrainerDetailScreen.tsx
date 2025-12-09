import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { TrainerInfo, Slot } from '../../types/booking';
import { trainerService } from '../../services/trainerService';
import { bookingService } from '../../services/bookingService';
import { filterAvailableSlots, formatPrice } from '../../utils/bookingHelpers';
import { useNotification } from '../../context/NotificationContext';
import { getUser } from '../../utils/storage';
import SlotButton from '../../components/booking/SlotButton';
import LocationSelectorModal from '../../components/modals/LocationSelectorModal';
import PaymentMethodModal from '../../components/PaymentMethodModal';
import { Location } from '../../types/api';

type TrainerDetailRouteProp = RouteProp<RootStackParamList, 'TrainerDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TrainerDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrainerDetailRouteProp>();
  const { trainerId, selectedDate } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
    fetchTrainerDetails();
  }, [trainerId, selectedDate]);

  const loadUserInfo = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUserId(user._id);
        setUserName(user.fullName || 'User');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const response = await trainerService.getListTrainersForUser();
      const trainerData = response.listTrainerInfo.find((t: TrainerInfo) => t._id === trainerId);

      if (!trainerData) {
        showError('Không tìm thấy thông tin PT');
        navigation.goBack();
        return;
      }

      setTrainer(trainerData);

      // Filter available slots for selected date
      const date = new Date(selectedDate);
      const slots = filterAvailableSlots(trainerData.schedule, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching trainer details:', error);
      showError('Không thể tải thông tin PT');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotPress = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = async () => {
    if (!selectedSlot || !selectedLocation || !trainer) {
      return;
    }

    setShowPaymentModal(false);
    setPaymentLoading(true);

    try {
      const pricePerHour =
        typeof trainer.trainerInfo.pricePerHour === 'string'
          ? parseInt(trainer.trainerInfo.pricePerHour, 10)
          : trainer.trainerInfo.pricePerHour;

      const bookingData = [
        {
          title: `PT ${trainer.userInfo.fullName} - Huấn luyện 1 kèm 1 cùng ${userName}`,
          userId,
          scheduleId: selectedSlot._id,
          locationId: selectedLocation._id,
          price: pricePerHour,
          note: '',
        },
      ];

      const result = await bookingService.createBookingPayment(bookingData);
      navigation.navigate('VNPayWebView', {
        paymentUrl: result.paymentUrl,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      showError('Không thể tạo thanh toán. Vui lòng thử lại');
    } finally {
      setPaymentLoading(false);
    }
  };

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

  if (!trainer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle" size={64} color="#D1D5DB" />
          <Text className="mt-4 text-gray-500">Không tìm thấy thông tin PT</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pricePerHour =
    typeof trainer.trainerInfo.pricePerHour === 'string'
      ? parseInt(trainer.trainerInfo.pricePerHour, 10)
      : trainer.trainerInfo.pricePerHour;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">Chi tiết PT</Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner/Avatar */}
        <View className="relative">
          {trainer.trainerInfo.physiqueImages && trainer.trainerInfo.physiqueImages.length > 0 ? (
            <Image
              source={{ uri: trainer.trainerInfo.physiqueImages[0] }}
              className="h-64 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-64 w-full items-center justify-center bg-primary/10">
              <Ionicons name="person" size={80} color="#16697A" />
            </View>
          )}

          {/* Avatar Overlay */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <View className="flex-row items-center">
              {trainer.userInfo.avatar ? (
                <Image
                  source={{ uri: trainer.userInfo.avatar }}
                  className="h-20 w-20 rounded-full border-4 border-white"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary/10">
                  <Ionicons name="person" size={40} color="#16697A" />
                </View>
              )}
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-white">{trainer.userInfo.fullName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trainer Info */}
        <View className="m-4 rounded-2xl border border-gray-200 bg-white p-4">
          {/* Specialization & Rating */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <Ionicons name="barbell" size={20} color="#16697A" />
              <Text className="ml-2 text-base font-semibold capitalize text-gray-800">
                {trainer.trainerInfo.specialization}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="ml-1 text-base font-semibold text-gray-800">
                {trainer.review.rating > 0 ? trainer.review.rating.toFixed(1) : 'Chưa có'}
              </Text>
            </View>
          </View>

          {/* Experience & Education */}
          <View className="mb-4">
            <View className="mb-2 flex-row items-center">
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-600">
                Kinh nghiệm: {trainer.trainerInfo.experience}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="school" size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-600">{trainer.trainerInfo.education}</Text>
            </View>
          </View>

          {/* Bio */}
          {trainer.trainerInfo.bio && (
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-gray-700">Giới thiệu</Text>
              <Text className="text-sm leading-5 text-gray-600">{trainer.trainerInfo.bio}</Text>
            </View>
          )}

          {/* Price */}
          <View className="flex-row items-center justify-between border-t border-gray-200 pt-4">
            <Text className="text-sm text-gray-600">Giá mỗi giờ</Text>
            <Text className="text-xl font-bold text-primary">{formatPrice(pricePerHour)}</Text>
          </View>
        </View>

        {/* Available Slots */}
        <View className="m-4 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="mb-3 text-lg font-bold text-gray-800">
            Lịch trống ({availableSlots.length})
          </Text>

          {availableSlots.length > 0 ? (
            <View className="flex-row flex-wrap">
              {availableSlots.map((slot) => (
                <View key={slot._id} className="mb-2">
                  <SlotButton slot={slot} onPress={handleSlotPress} />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="mt-2 text-gray-500">Không có lịch trống</Text>
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Loading Overlay */}
      {paymentLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="rounded-2xl bg-white p-6">
            <ActivityIndicator size="large" color="#16697A" />
            <Text className="mt-4 text-gray-600">Đang tạo thanh toán...</Text>
          </View>
        </View>
      )}

      {/* Modals */}
      <LocationSelectorModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleLocationSelect}
      />

      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectVNPay={handlePaymentSelect}
      />
    </SafeAreaView>
  );
}
