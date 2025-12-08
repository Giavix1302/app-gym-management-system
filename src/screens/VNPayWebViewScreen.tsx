import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNotification } from '../context/NotificationContext';

type VNPayWebViewRouteProp = RouteProp<RootStackParamList, 'VNPayWebView'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VNPayWebViewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VNPayWebViewRouteProp>();
  const { paymentUrl } = route.params;
  const { success: showSuccess, error: showError } = useNotification();
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('Current URL:', url);

    // Kiểm tra URL return từ VNPay hoặc URL success/failed của backend
    const isVnpayReturn = url.includes('/payments/vnpay-return') || url.includes('/payment/success') || url.includes('/payment/failed');

    if (isVnpayReturn) {
      // Parse URL để lấy query parameters
      const urlObj = new URL(url);
      const responseCode = urlObj.searchParams.get('vnp_ResponseCode');
      const transactionStatus = urlObj.searchParams.get('vnp_TransactionStatus');

      console.log('Response Code:', responseCode);
      console.log('Transaction Status:', transactionStatus);

      // vnp_ResponseCode = '00' nghĩa là thanh toán thành công
      if (responseCode === '00' && transactionStatus === '00') {
        // Thanh toán thành công - Navigate đến PaymentSuccess screen
        navigation.replace('PaymentSuccess');
      } else {
        // Thanh toán thất bại - Navigate đến PaymentFailed screen với error message
        const errorMessage = getErrorMessage(responseCode);
        navigation.replace('PaymentFailed', { errorMessage });
      }
    }
  };

  const getErrorMessage = (responseCode: string | null): string => {
    const errorMessages: { [key: string]: string } = {
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Thẻ chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ bị khóa',
      '13': 'Sai mật khẩu giao dịch',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch vượt quá số lần thanh toán',
      '99': 'Lỗi không xác định',
    };

    return errorMessages[responseCode || ''] || 'Thanh toán thất bại. Vui lòng thử lại.';
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleClose} className="p-1 w-10">
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Thanh toán VNPay
        </Text>
        <View className="w-10" />
      </View>

      {/* WebView */}
      <View className="flex-1">
        {loading && (
          <View className="absolute inset-0 justify-center items-center bg-white z-10">
            <ActivityIndicator size="large" color="#16697A" />
            <Text className="text-gray-600 mt-4">Đang tải trang thanh toán...</Text>
          </View>
        )}

        <WebView
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
        />
      </View>
    </SafeAreaView>
  );
}
