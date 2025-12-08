import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PaymentHistoryScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          Lịch sử thanh toán
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center py-32">
          <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-600 mt-4">
            Lịch sử thanh toán
          </Text>
          <Text className="text-sm text-gray-400 mt-2">
            Tính năng đang được phát triển
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
