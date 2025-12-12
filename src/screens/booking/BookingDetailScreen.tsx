import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { GroupedBooking, BookingSession, HistoryBooking } from '../../types/booking';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import { calculateCancelInfo, formatSlotTime, formatPrice } from '../../utils/bookingHelpers';
import { formatFullDate, convertUTCToVietnam } from '../../utils/dateTime';
import { useNotification } from '../../context/NotificationContext';
import { getUser } from '../../utils/storage';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ReviewModal from '../../components/modals/ReviewModal';

type BookingDetailRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingDetailRouteProp>();
  const { trainerId, bookingType } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  const [trainer, setTrainer] = useState<any>(null);
  const [sessions, setSessions] = useState<BookingSession[] | HistoryBooking[]>([]);
  console.log('🚀 ~ BookingDetailScreen ~ sessions:', sessions);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadUserInfo();
    fetchBookingDetails();
  }, [trainerId, bookingType]);

  const loadUserInfo = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUserId(user._id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response =
        bookingType === 'upcoming'
          ? await bookingService.getUpcomingBookings(await getUserId())
          : await bookingService.getHistoryBookings(await getUserId());

      const allBookings: GroupedBooking[] | HistoryBooking[] = response.bookings;

      if (bookingType === 'upcoming') {
        const groupedBookings = allBookings as GroupedBooking[];
        const trainerBooking = groupedBookings.find((gb) => gb.trainer.trainerId === trainerId);

        if (trainerBooking) {
          setTrainer(trainerBooking.trainer);
          setSessions(trainerBooking.allSessions);
        }
      } else {
        const historyBookings = allBookings as HistoryBooking[];
        const trainerSessions = historyBookings.filter((hb) => hb.trainer.trainerId === trainerId);

        if (trainerSessions.length > 0) {
          setTrainer(trainerSessions[0].trainer);
          setSessions(trainerSessions);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      showError('Không thể tải thông tin booking');
    } finally {
      setLoading(false);
    }
  };

  const getUserId = async () => {
    const user = await getUser();
    return user?._id || '';
  };

  const handleCancelPress = (booking: any) => {
    const startTime = bookingType === 'upcoming' ? booking.startTime : booking.session.startTime;
    const cancelInfo = calculateCancelInfo(startTime);

    if (!cancelInfo.canCancel) {
      showError(cancelInfo.warningMessage || 'Không thể hủy lịch này');
      return;
    }

    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelLoading(true);
      const bookingId =
        bookingType === 'upcoming' ? selectedBooking.bookingId : selectedBooking._id;

      await bookingService.cancelBooking(bookingId);
      showSuccess('Hủy lịch thành công');

      setShowCancelModal(false);
      setSelectedBooking(null);

      // Refresh booking list
      fetchBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Không thể hủy lịch. Vui lòng thử lại');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReviewPress = (booking: HistoryBooking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedBooking || !userId) return;

    try {
      setReviewLoading(true);

      await reviewService.createReview({
        bookingId: selectedBooking._id,
        userId,
        trainerId: trainer.trainerId,
        rating,
        comment,
      });

      showSuccess('Đánh giá thành công');
      setShowReviewModal(false);
      setSelectedBooking(null);

      // Refresh to update review status
      fetchBookingDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Không thể gửi đánh giá. Vui lòng thử lại');
    } finally {
      setReviewLoading(false);
    }
  };

  const getCancelModalMessage = () => {
    if (!selectedBooking) return '';

    const startTime =
      bookingType === 'upcoming' ? selectedBooking.startTime : selectedBooking.session.startTime;
    const cancelInfo = calculateCancelInfo(startTime);

    if (cancelInfo.hasRefund) {
      const price = bookingType === 'upcoming' ? selectedBooking.price : selectedBooking.price;
      return `Bạn sẽ được hoàn 100% (${formatPrice(price)})`;
    } else {
      return 'Hủy lịch trong vòng 24 giờ sẽ không được hoàn tiền. Bạn có chắc chắn muốn hủy?';
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

  if (!trainer || sessions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle" size={64} color="#D1D5DB" />
          <Text className="mt-4 text-gray-500">Không tìm thấy thông tin booking</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">
          Chi tiết lịch tập
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trainer Header */}
        <View className="m-4 rounded-2xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-center">
            {trainer.userInfo.avatar ? (
              <Image
                source={{ uri: trainer.userInfo.avatar }}
                className="mr-3 h-16 w-16 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="mr-3 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="person" size={32} color="#16697A" />
              </View>
            )}

            <View className="flex-1">
              <Text className="mb-1 text-xl font-bold text-gray-800">
                {trainer.userInfo.fullName}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="barbell" size={14} color="#6B7280" />
                <Text className="ml-1 mr-3 text-sm capitalize text-gray-600">
                  {trainer.specialization}
                </Text>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="ml-1 text-sm text-gray-600">
                  {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'Chưa có'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <View className="mx-4 mb-4">
          <Text className="mb-3 text-lg font-bold text-gray-800">
            Danh sách buổi tập ({sessions.length})
          </Text>

          {sessions.map((session, index) => {
            const isUpcoming = bookingType === 'upcoming';
            const upcomingSession = session as BookingSession;
            const historySession = session as HistoryBooking;

            const startTime = isUpcoming
              ? upcomingSession.startTime
              : historySession.session.startTime;
            const endTime = isUpcoming ? upcomingSession.endTime : historySession.session.endTime;
            const location = isUpcoming
              ? upcomingSession.location
              : historySession.session.location;
            const price = isUpcoming ? upcomingSession.price : historySession.price;
            const status = isUpcoming ? upcomingSession.status : historySession.status;

            const canCancel = isUpcoming && status === 'booking';
            const canReview =
              !historySession.review || Object.keys(historySession.review).length === 0;

            const cancelInfo = calculateCancelInfo(startTime);

            return (
              <View
                key={isUpcoming ? upcomingSession.bookingId : historySession._id}
                className="mb-3 rounded-2xl border border-gray-200 bg-white p-4">
                {/* Date */}
                <View className="mb-2 flex-row items-center">
                  <Ionicons name="calendar" size={16} color="#16697A" />
                  <Text className="ml-2 text-base font-semibold text-gray-800">
                    {formatFullDate(convertUTCToVietnam(startTime))}
                  </Text>
                </View>

                {/* Time */}
                <View className="mb-2 flex-row items-center">
                  <Ionicons name="time" size={16} color="#16697A" />
                  <Text className="ml-2 text-base font-semibold text-gray-800">
                    {formatSlotTime(startTime, endTime)}
                  </Text>
                </View>

                {/* Location */}
                <View className="mb-2 flex-row items-start">
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-medium text-gray-700">{location.name}</Text>
                    <Text className="text-sm text-gray-600">
                      {location.address.street}, {location.address.ward}
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <View className="mb-3 flex-row items-center">
                  <Ionicons name="cash" size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600">
                    Giá: <Text className="font-semibold text-primary">{formatPrice(price)}</Text>
                  </Text>
                </View>

                {/* Status Badge */}
                <View className="mb-3 flex-row items-center">
                  <View
                    className={`rounded-full px-3 py-1 ${
                      status === 'completed'
                        ? 'bg-green-100'
                        : status === 'cancelled'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                    }`}>
                    <Text
                      className={`text-xs font-semibold ${
                        status === 'completed'
                          ? 'text-green-700'
                          : status === 'cancelled'
                            ? 'text-red-700'
                            : 'text-blue-700'
                      }`}>
                      {status === 'completed'
                        ? 'Đã hoàn thành'
                        : status === 'cancelled'
                          ? 'Đã hủy'
                          : status === 'booking'
                            ? 'Đã đặt'
                            : 'Chưa thanh toán'}
                    </Text>
                  </View>
                </View>

                {/* Review Display */}
                {!isUpcoming && historySession.review && status !== 'cancelled' && (
                  <View className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <View className="mb-1 flex-row items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={16}
                          color={star <= historySession.review!.rating ? '#F59E0B' : '#D1D5DB'}
                        />
                      ))}
                    </View>
                    <Text className="text-sm text-gray-700">{historySession.review.comment}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                {canCancel && (
                  <TouchableOpacity
                    className="items-center rounded-xl bg-red-500 py-3"
                    onPress={() => handleCancelPress(session)}
                    activeOpacity={0.8}>
                    <Text className="text-base font-bold text-white">Hủy lịch</Text>
                  </TouchableOpacity>
                )}

                {canReview && status !== 'cancelled' && (
                  <TouchableOpacity
                    className="items-center rounded-xl bg-primary py-3"
                    onPress={() => handleReviewPress(historySession)}
                    activeOpacity={0.8}>
                    <Text className="text-base font-bold text-white">Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Modals */}
      <ConfirmModal
        visible={showCancelModal}
        title="Xác nhận hủy lịch"
        message={getCancelModalMessage()}
        confirmText="Hủy lịch"
        cancelText="Quay lại"
        confirmStyle="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        loading={cancelLoading}
      />

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        loading={reviewLoading}
      />
    </SafeAreaView>
  );
}
