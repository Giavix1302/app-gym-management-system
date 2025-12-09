import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import {
  paymentService,
  Payment,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
} from '../../services/paymentService';
import { getUser } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import { Colors } from '../../constants/colors';

// Payment Type Labels
const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  membership: 'Gói tập',
  booking: 'Đặt lịch PT',
  class: 'Lớp học',
};

// Payment Method Labels
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  vnpay: 'VNPay',
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
};

// Payment Status Labels
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  refunded: 'Đã hoàn tiền',
};

// Payment Status Colors
const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: Colors.success,
  unpaid: Colors.warning,
  refunded: Colors.info,
};

export default function PaymentHistoryScreen() {
  const navigation = useNavigation();
  const notification = useNotification();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<PaymentType | 'all'>('all');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all');

  // Dropdown states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Statistics
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Load user ID
  useEffect(() => {
    loadUserId();
  }, []);

  // Reload data when screen is focused or filters change
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        resetAndLoadPayments();
      }
    }, [userId, selectedType, selectedMethod, selectedStatus])
  );

  const loadUserId = async () => {
    try {
      const user = await getUser();
      if (user && user._id) {
        setUserId(user._id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const resetAndLoadPayments = async () => {
    setCurrentPage(1);
    setPayments([]);
    setHasMore(true);
    await loadPayments(1, true);
  };

  const loadPayments = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await paymentService.getPaymentsByUserId(userId, page, 10);

      if (response.success) {
        const filteredPayments = filterPayments(response.payments);

        if (isRefresh) {
          setPayments(filteredPayments);
        } else {
          setPayments((prev) => [...prev, ...filteredPayments]);
        }

        setHasMore(response.pagination.hasNext);
        setCurrentPage(page);

        // Calculate statistics from all payments (not filtered)
        if (isRefresh) {
          calculateStatistics(response.payments);
        }
      }
    } catch (error: any) {
      console.error('Error loading payments:', error);
      notification.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterPayments = (paymentList: Payment[]): Payment[] => {
    return paymentList.filter((payment) => {
      const typeMatch = selectedType === 'all' || payment.paymentType === selectedType;
      const methodMatch =
        selectedMethod === 'all' || payment.paymentMethod === selectedMethod;
      const statusMatch =
        selectedStatus === 'all' || payment.paymentStatus === selectedStatus;
      return typeMatch && methodMatch && statusMatch;
    });
  };

  const calculateStatistics = (paymentList: Payment[]) => {
    const paidPayments = paymentList.filter((p) => p.paymentStatus === 'paid');
    const total = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalSpent(total);
    setTotalTransactions(paidPayments.length);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPayments(currentPage + 1, false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderStatCard = (title: string, value: string, icon: any, color: string) => (
    <View className="mx-1 flex-1 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">{title}</Text>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-xl font-bold text-gray-800">{value}</Text>
    </View>
  );

  // Dropdown component
  const renderDropdown = <T extends string>(
    label: string,
    value: T,
    options: { value: T; label: string }[],
    isOpen: boolean,
    onToggle: () => void,
    onSelect: (val: T) => void
  ) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <View className="flex-1 mx-1">
        <TouchableOpacity
          onPress={onToggle}
          className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2"
        >
          <View className="flex-1">
            <Text className="text-xs text-gray-500">{label}</Text>
            <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
              {selectedOption?.label || 'Tất cả'}
            </Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>

        {isOpen && (
          <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onToggle}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={onToggle}
              className="flex-1 bg-black/50"
            >
              <View className="absolute left-4 right-4 top-1/3 rounded-lg bg-white shadow-lg">
                <ScrollView className="max-h-64">
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        onSelect(option.value);
                        onToggle();
                      }}
                      className={`border-b border-gray-100 px-4 py-3 ${
                        option.value === value ? 'bg-green-50' : ''
                      }`}
                      style={
                        option.value === value
                          ? { backgroundColor: `${Colors.primary}10` }
                          : undefined
                      }
                    >
                      <Text
                        className={`text-sm ${
                          option.value === value ? 'font-semibold' : 'font-normal'
                        }`}
                        style={
                          option.value === value
                            ? { color: Colors.primary }
                            : { color: '#374151' }
                        }
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View className="border-b border-gray-200 bg-white px-4 py-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Payment Type Badge */}
          <View className="mb-2 flex-row items-center">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: `${Colors.primary}20` }}
            >
              <Text className="text-xs font-semibold" style={{ color: Colors.primary }}>
                {PAYMENT_TYPE_LABELS[item.paymentType]}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="mb-2 text-sm font-medium text-gray-800" numberOfLines={2}>
            {item.description}
          </Text>

          {/* Date and Method */}
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">
              {format(new Date(item.paymentDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </Text>
            <Text className="mx-2 text-xs text-gray-400">•</Text>
            <Ionicons name="card-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">
              {PAYMENT_METHOD_LABELS[item.paymentMethod]}
            </Text>
          </View>
        </View>

        {/* Amount and Status */}
        <View className="ml-3 items-end">
          <Text className="mb-1 text-base font-bold" style={{ color: Colors.primary }}>
            {formatCurrency(item.amount)}
          </Text>
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: `${PAYMENT_STATUS_COLORS[item.paymentStatus]}20` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: PAYMENT_STATUS_COLORS[item.paymentStatus] }}
            >
              {PAYMENT_STATUS_LABELS[item.paymentStatus]}
            </Text>
          </View>
        </View>
      </View>

      {/* Refund Info */}
      {item.paymentStatus === 'refunded' && item.refundAmount > 0 && (
        <View className="mt-2 rounded-lg bg-blue-50 p-2">
          <Text className="text-xs text-blue-700">
            Đã hoàn: {formatCurrency(item.refundAmount)} vào{' '}
            {format(new Date(item.refundDate), 'dd/MM/yyyy', { locale: vi })}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-32">
      <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
      <Text className="mt-4 text-xl font-semibold text-gray-600">
        Chưa có giao dịch nào
      </Text>
      <Text className="mt-2 px-8 text-center text-sm text-gray-400">
        Lịch sử thanh toán của bạn sẽ hiển thị tại đây
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-gray-800">
            Lịch sử thanh toán
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
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
          Lịch sử thanh toán
        </Text>
        <View className="w-10" />
      </View>

      {/* Statistics Cards */}
      <View className="flex-row px-4 py-4">
        {renderStatCard(
          'Tổng chi tiêu',
          formatCurrency(totalSpent),
          'wallet-outline',
          Colors.primary
        )}
        {renderStatCard(
          'Tổng giao dịch',
          totalTransactions.toString(),
          'receipt-outline',
          Colors.info
        )}
      </View>

      {/* Filters - Dropdowns on one row */}
      <View className="bg-white px-4 py-3">
        <View className="flex-row">
          {renderDropdown<PaymentType | 'all'>(
            'Loại',
            selectedType,
            [
              { value: 'all', label: 'Tất cả' },
              { value: 'membership', label: 'Gói tập' },
              { value: 'booking', label: 'Đặt PT' },
              { value: 'class', label: 'Lớp học' },
            ],
            showTypeDropdown,
            () => setShowTypeDropdown(!showTypeDropdown),
            setSelectedType
          )}
          {renderDropdown<PaymentMethod | 'all'>(
            'Phương thức',
            selectedMethod,
            [
              { value: 'all', label: 'Tất cả' },
              { value: 'vnpay', label: 'VNPay' },
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'transfer', label: 'Chuyển khoản' },
            ],
            showMethodDropdown,
            () => setShowMethodDropdown(!showMethodDropdown),
            setSelectedMethod
          )}
          {renderDropdown<PaymentStatus | 'all'>(
            'Trạng thái',
            selectedStatus,
            [
              { value: 'all', label: 'Tất cả' },
              { value: 'paid', label: 'Đã TT' },
              { value: 'unpaid', label: 'Chưa TT' },
              { value: 'refunded', label: 'Hoàn tiền' },
            ],
            showStatusDropdown,
            () => setShowStatusDropdown(!showStatusDropdown),
            setSelectedStatus
          )}
        </View>
      </View>

      {/* Payment List */}
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={payments.length === 0 ? { flex: 1 } : undefined}
        className="mt-2"
      />
    </SafeAreaView>
  );
}
