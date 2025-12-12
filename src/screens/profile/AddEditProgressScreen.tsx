import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { RootStackParamList } from '../../navigation/types';
import { progressService } from '../../services/progressService';
import { getUser } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddEditProgressRouteProp = RouteProp<RootStackParamList, 'AddEditProgress'>;

export default function AddEditProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddEditProgressRouteProp>();
  const notification = useNotification();
  const { progressId, progressData } = route.params || {};

  const isEditMode = !!progressId;

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Form fields
  const [measurementDate, setMeasurementDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [note, setNote] = useState('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load user ID and populate form if editing
  useEffect(() => {
    loadUserId();
    if (isEditMode && progressData) {
      setMeasurementDate(new Date(progressData.measurementDate));
      setWeight(progressData.weight.toString());
      setBodyFat(progressData.bodyFat.toString());
      setMuscleMass(progressData.muscleMass.toString());
      setNote(progressData.note || '');
    }
  }, []);

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

  const validateForm = () => {
    if (!weight || !bodyFat || !muscleMass) {
      notification.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    const weightNum = parseFloat(weight);
    const bodyFatNum = parseFloat(bodyFat);
    const muscleMassNum = parseFloat(muscleMass);

    if (isNaN(weightNum) || weightNum <= 0) {
      notification.error('Cân nặng phải là số dương hợp lệ');
      return false;
    }

    if (isNaN(bodyFatNum) || bodyFatNum < 0 || bodyFatNum > 100) {
      notification.error('Phần trăm mỡ cơ thể phải từ 0 đến 100');
      return false;
    }

    if (isNaN(muscleMassNum) || muscleMassNum <= 0) {
      notification.error('Khối lượng cơ phải là số dương hợp lệ');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = {
        measurementDate: measurementDate.toISOString(),
        weight,
        bodyFat,
        muscleMass,
        note: note.trim() || undefined,
      };

      if (isEditMode && progressId) {
        await progressService.updateProgress(progressId, data);
        notification.success('Đã cập nhật tiến trình thành công');
        setTimeout(() => navigation.goBack(), 500);
      } else {
        await progressService.createProgress({
          ...data,
          userId,
        });
        notification.success('Đã thêm tiến trình mới thành công');
        setTimeout(() => navigation.goBack(), 500);
      }
    } catch (error: any) {
      console.error('Error saving progress:', error);
      notification.error('Không thể lưu tiến trình. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMeasurementDate(selectedDate);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'default',
    required: boolean = false,
    unit?: string
  ) => (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-gray-700">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <View className="flex-row items-center rounded-lg border border-gray-300 bg-white px-4 py-3">
        <TextInput
          className="flex-1 text-base text-gray-800"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
        />
        {unit && <Text className="ml-2 text-gray-500">{unit}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          {isEditMode ? 'Sửa tiến trình' : 'Thêm tiến trình'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`rounded-lg px-4 py-2 ${loading ? 'bg-gray-300' : 'bg-primary'}`}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="font-semibold text-white">Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View className="mb-4">
          <Text className="mb-2 font-semibold text-gray-700">
            Ngày đo lường
            <Text className="text-red-500"> *</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-800">
                {format(measurementDate, 'dd/MM/yyyy', { locale: vi })}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={measurementDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Weight Input */}
        {renderInputField(
          'Cân nặng',
          weight,
          setWeight,
          'Nhập cân nặng',
          'decimal-pad',
          true,
          'kg'
        )}

        {/* Body Fat Input */}
        {renderInputField(
          'Phần trăm mỡ cơ thể',
          bodyFat,
          setBodyFat,
          'Nhập % mỡ cơ thể',
          'decimal-pad',
          true,
          '%'
        )}

        {/* Muscle Mass Input */}
        {renderInputField(
          'Khối lượng cơ',
          muscleMass,
          setMuscleMass,
          'Nhập khối lượng cơ',
          'decimal-pad',
          true,
          'kg'
        )}

        {/* Note Input */}
        <View className="mb-4">
          <Text className="mb-2 font-semibold text-gray-700">Ghi chú</Text>
          <View className="rounded-lg border border-gray-300 bg-white px-4 py-3">
            <TextInput
              className="min-h-[100px] text-base text-gray-800"
              value={note}
              onChangeText={setNote}
              placeholder="Nhập ghi chú (tùy chọn)"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Info Card */}
        <View className="mb-20 mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#16697A" />
            <View className="ml-3 flex-1">
              <Text className="mb-1 font-semibold text-primary">Lưu ý</Text>
              <Text className="text-sm text-gray-700">
                • Đo lường vào cùng thời điểm trong ngày để có kết quả chính xác nhất
                {'\n'}• Nên đo vào buổi sáng sau khi thức dậy và đi vệ sinh
                {'\n'}• Cân nặng và khối lượng cơ tính bằng kg
                {'\n'}• Phần trăm mỡ cơ thể từ 0-100%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
