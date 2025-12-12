import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Class, EnrolledClass } from '../../types/class';
import { classService } from '../../services/classService';
import {
  getClassTypeIcon,
  getClassTypeLabel,
  formatRecurrenceSchedule,
  formatClassDuration,
  formatPrice,
  sortClassSessions,
  getCancelInfo,
} from '../../utils/classHelpers';
import { getUser } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import { Colors } from '../../constants/colors';
import ClassSessionItem from '../../components/class/ClassSessionItem';
import PaymentMethodModal from '../../components/PaymentMethodModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

type ClassDetailRouteProp = RouteProp<RootStackParamList, 'ClassDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ClassDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClassDetailRouteProp>();
  const { classId } = route.params;
  const { success: showSuccess, error: showError } = useNotification();

  const [classData, setClassData] = useState<Class | EnrolledClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string>('');

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user ID
      const user = await getUser();
      if (user) {
        setUserId(user._id);

        // Fetch both available and enrolled classes
        const [availableRes, enrolledRes] = await Promise.all([
          classService.getListClassForUser(),
          classService.getMemberEnrolledClasses(user._id),
        ]);

        // Check if enrolled
        const enrolled = enrolledRes.classes.find((c) => c._id === classId);
        if (enrolled) {
          setClassData(enrolled);
          setIsEnrolled(true);
          setEnrollmentId((enrolled as EnrolledClass).classEnrollmentId);
        } else {
          // Find in available classes
          const available = availableRes.classes.find((c) => c._id === classId);
          if (available) {
            setClassData(available);
            setIsEnrolled(false);
          } else {
            showError('Không tìm thấy thông tin lớp học');
            navigation.goBack();
          }
        }
      }
    } catch (error) {
      console.error('Error loading class detail:', error);
      showError('Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollPress = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = async () => {
    if (!classData || !userId) return;

    setShowPaymentModal(false);
    setPaymentLoading(true);

    try {
      const paymentData = {
        userId,
        classId: classData._id,
        title: `Đăng kí ${classData.name}`,
        price: classData.price,
      };

      const result = await classService.createLinkVnpayClassPayment(paymentData);

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

  const handleCancelPress = () => {
    if (!classData) return;

    const cancelInfo = getCancelInfo(classData.startDate, classData.price);
    setCancelMessage(cancelInfo.message);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!enrollmentId) return;

    setCancelLoading(true);

    try {
      await classService.cancelClassEnrollment(enrollmentId);
      showSuccess('Hủy đăng ký thành công');
      setShowCancelModal(false);

      // Navigate back and refresh
      navigation.goBack();
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      showError('Không thể hủy đăng ký. Vui lòng thử lại');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!classData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle" size={64} color="#D1D5DB" />
          <Text className="mt-4 text-center text-gray-500">Không tìm thấy thông tin lớp học</Text>
        </View>
      </SafeAreaView>
    );
  }

  const classTypeIcon = getClassTypeIcon(classData.classType);
  const classTypeLabel = getClassTypeLabel(classData.classType);
  const scheduleText = formatRecurrenceSchedule(classData.recurrence);
  const durationText = formatClassDuration(classData.startDate, classData.endDate);
  const sortedSessions = sortClassSessions(classData.classSession);
  const trainer =
    classData.trainers && classData.trainers.length > 0 ? classData.trainers[0] : null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={handleBackPress} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800">Chi tiết lớp học</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Class Image */}
        {classData.image ? (
          <Image source={{ uri: classData.image }} className="h-56 w-full" resizeMode="cover" />
        ) : (
          <View className="h-56 w-full items-center justify-center bg-primary/10">
            <Ionicons name={classTypeIcon as any} size={80} color="#16697A" />
          </View>
        )}

        {/* Class Info Section */}
        <View className="p-4">
          {/* Class Type Badge */}
          <View className="mb-2 flex-row items-center">
            <View className="flex-row items-center rounded-full bg-primary/10 px-3 py-1">
              <Ionicons name={classTypeIcon as any} size={14} color="#16697A" />
              <Text className="ml-1 text-sm font-semibold text-primary">{classTypeLabel}</Text>
            </View>
            {isEnrolled && (
              <View className="ml-2 rounded-full bg-success px-3 py-1">
                <Text className="text-sm font-bold text-white">Đã đăng ký</Text>
              </View>
            )}
          </View>

          {/* Class Name */}
          <Text className="mb-2 text-2xl font-bold text-gray-800">{classData.name}</Text>

          {/* Description */}
          {classData.description && (
            <Text className="mb-4 text-base leading-6 text-gray-600">{classData.description}</Text>
          )}

          {/* Price */}
          <View className="mb-4 rounded-xl bg-primary/5 p-4">
            <Text className="mb-1 text-sm text-gray-600">Học phí</Text>
            <Text className="text-3xl font-bold text-primary">{formatPrice(classData.price)}</Text>
          </View>

          {/* Trainer Section */}
          {trainer && (
            <View className="mb-4">
              <Text className="mb-3 text-lg font-bold text-gray-800">Huấn luyện viên</Text>
              <View className="flex-row items-center rounded-xl bg-gray-50 p-3">
                {trainer.avatar ? (
                  <Image
                    source={{ uri: trainer.avatar }}
                    className="mr-3 h-16 w-16 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="mr-3 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Ionicons name="person" size={32} color="#16697A" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="mb-1 text-base font-bold text-gray-800">{trainer.name}</Text>
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="barbell" size={14} color="#6B7280" />
                    <Text className="ml-1 text-sm capitalize text-gray-600">
                      {trainer.specialization}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="ml-1 text-sm text-gray-600">
                      {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'Chưa có đánh giá'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Schedule Section */}
          <View className="mb-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">Lịch học</Text>
            <View className="rounded-xl bg-gray-50 p-4">
              <View className="mb-3 flex-row items-start">
                <Ionicons name="calendar" size={18} color="#16697A" />
                <View className="ml-3 flex-1">
                  <Text className="mb-1 text-sm text-gray-600">Thời gian khóa học</Text>
                  <Text className="text-base font-semibold text-gray-800">{durationText}</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="time" size={18} color="#16697A" />
                <View className="ml-3 flex-1">
                  <Text className="mb-1 text-sm text-gray-600">Lịch học hàng tuần</Text>
                  <Text className="text-base font-semibold text-gray-800">{scheduleText}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View className="mb-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">Địa điểm</Text>
            <View className="rounded-xl bg-gray-50 p-4">
              <Text className="mb-2 text-base font-bold text-gray-800">
                {classData.locationName}
              </Text>
              <View className="flex-row items-start">
                <Ionicons name="location" size={18} color="#16697A" />
                <Text className="ml-2 flex-1 text-sm text-gray-600">
                  {classData.address.street}, {classData.address.ward}, {classData.address.province}
                </Text>
              </View>
            </View>
          </View>

          {/* Capacity */}
          <View className="mb-4 flex-row items-center justify-between rounded-xl bg-gray-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="#16697A" />
              <Text className="ml-2 text-base text-gray-700">Sĩ số lớp</Text>
            </View>
            <Text className="text-lg font-bold text-primary">
              {classData.enrolled}/{classData.capacity} người
            </Text>
          </View>

          {/* Enrollment Info (if enrolled) */}
          {isEnrolled && (
            <View className="mb-4 rounded-xl border border-success/20 bg-success/5 p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-2 text-base font-bold text-success">Đã đăng ký lớp học</Text>
              </View>
              <Text className="text-sm text-gray-600">
                Ngày đăng ký:{' '}
                {new Date((classData as EnrolledClass).enrolledAt).toLocaleDateString('vi-VN')}
              </Text>
              <Text className="text-sm text-gray-600">
                Trạng thái: <Text className="font-semibold text-success">Đã thanh toán</Text>
              </Text>
            </View>
          )}

          {/* Class Sessions Section */}
          <View className="mb-4">
            <Text className="mb-3 text-lg font-bold text-gray-800">
              Các buổi học ({sortedSessions.length} buổi)
            </Text>
            <FlatList
              data={sortedSessions}
              renderItem={({ item }) => <ClassSessionItem session={item} />}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="border-t border-gray-200 bg-white p-4">
        {paymentLoading ? (
          <View className="items-center rounded-xl bg-primary/50 py-4">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : isEnrolled ? (
          <TouchableOpacity
            className="items-center rounded-xl bg-red-500 py-4"
            onPress={handleCancelPress}
            activeOpacity={0.8}>
            <Text className="text-base font-bold text-white">Hủy đăng ký</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="items-center rounded-xl bg-primary py-4"
            onPress={handleEnrollPress}
            activeOpacity={0.8}
            disabled={classData.enrolled >= classData.capacity}>
            <Text className="text-base font-bold text-white">
              {classData.enrolled >= classData.capacity ? 'Lớp đã đầy' : 'Đăng ký ngay'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectVNPay={handlePaymentSelect}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelModal}
        title="Xác nhận hủy lớp học"
        message={cancelMessage}
        confirmText="Xác nhận hủy"
        cancelText="Quay lại"
        confirmStyle="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        loading={cancelLoading}
      />
    </SafeAreaView>
  );
}
