import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PTClass } from '../../../types/class';

type PTClassDetailRouteProp = RouteProp<RootStackParamList, 'PTClassDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PTClassDetailScreen() {
  const route = useRoute<PTClassDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { classData } = route.params;

  const startDate = new Date(classData.startDate);
  const endDate = new Date(classData.endDate);

  const formatTimeRange = (hour: number, minute: number, endHour: number, endMinute: number) => {
    const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    return `${start} - ${end}`;
  };

  const getClassTypeIcon = (classType: string) => {
    switch (classType.toLowerCase()) {
      case 'yoga':
        return 'fitness';
      case 'dance':
        return 'musical-notes';
      case 'boxing':
        return 'barbell';
      default:
        return 'barbell';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#16697A" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-gray-800">Chi tiết lớp học</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Class Image */}
        {classData.image && (
          <Image source={{ uri: classData.image }} className="h-48 w-full" resizeMode="cover" />
        )}

        <View className="p-4">
          {/* Class Name and Type */}
          <View className="mb-4">
            <Text className="mb-2 text-2xl font-bold text-gray-800">{classData.name}</Text>
            <View className="flex-row items-center">
              <Ionicons name={getClassTypeIcon(classData.classType)} size={18} color="#16697A" />
              <Text className="ml-2 text-base capitalize text-gray-600">{classData.classType}</Text>
            </View>
          </View>

          {/* Description */}
          {classData.description && (
            <View className="mb-2 rounded-xl bg-white p-4">
              <Text className="mb-2 text-base font-semibold text-gray-800">Mô tả</Text>
              <Text className="text-sm leading-6 text-gray-600">{classData.description}</Text>
            </View>
          )}

          {/* Duration */}
          <View className="mb-4 rounded-xl bg-white p-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="calendar" size={20} color="#16697A" />
              <Text className="ml-2 text-base font-semibold text-gray-800">Thời gian</Text>
            </View>
            <Text className="text-sm text-gray-600">
              Từ {format(startDate, 'dd/MM/yyyy', { locale: vi })} đến{' '}
              {format(endDate, 'dd/MM/yyyy', { locale: vi })}
            </Text>
          </View>

          {/* Recurrence Schedule */}
          {classData.recurrence && classData.recurrence.length > 0 && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <View className="mb-3 flex-row items-center">
                <Ionicons name="time" size={20} color="#16697A" />
                <Text className="ml-2 text-base font-semibold text-gray-800">Lịch học</Text>
              </View>
              {classData.recurrence.map((schedule, index) => (
                <View key={index} className="mb-2 flex-row items-center">
                  <View className="mr-3 w-8 items-center rounded-lg bg-blue-100 py-1">
                    <Text className="text-xs font-bold text-primary">
                      {DAYS_OF_WEEK[schedule.dayOfWeek]}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {formatTimeRange(
                      schedule.startTime.hour,
                      schedule.startTime.minute,
                      schedule.endTime.hour,
                      schedule.endTime.minute
                    )}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          <View className="mb-4 rounded-xl bg-white p-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="location" size={20} color="#16697A" />
              <Text className="ml-2 text-base font-semibold text-gray-800">Địa điểm</Text>
            </View>
            <Text className="mb-1 text-sm font-medium text-gray-700">
              {classData.locationInfo.name}
            </Text>
            <Text className="text-sm text-gray-600">
              {classData.locationInfo.address.street}, {classData.locationInfo.address.ward},{' '}
              {classData.locationInfo.address.province}
            </Text>
          </View>

          {/* Capacity and Enrollment */}
          <View className="mb-4 flex-row">
            <View className="mr-2 flex-1 rounded-xl bg-white p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="people" size={20} color="#16697A" />
                <Text className="ml-2 text-base font-semibold text-gray-800">Sức chứa</Text>
              </View>
              <Text className="text-2xl font-bold text-primary">{classData.capacity}</Text>
            </View>
            <View className="ml-2 flex-1 rounded-xl bg-white p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-2 text-base font-semibold text-gray-800">Đã đăng kí</Text>
              </View>
              <Text className="text-2xl font-bold text-green-600">
                {classData.classEnrolled.length}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View className="mb-4 rounded-xl bg-white p-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="cash" size={20} color="#16697A" />
              <Text className="ml-2 text-base font-semibold text-gray-800">Học phí</Text>
            </View>
            <Text className="text-2xl font-bold text-primary">
              {classData.price.toLocaleString('vi-VN')} 
            </Text>
          </View>

          {/* Trainers */}
          {classData.trainers && classData.trainers.length > 0 && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <View className="mb-3 flex-row items-center">
                <Ionicons name="person" size={20} color="#16697A" />
                <Text className="ml-2 text-base font-semibold text-gray-800">
                  Huấn luyện viên ({classData.trainers.length})
                </Text>
              </View>
              {classData.trainers.map((trainer, index) => (
                <View key={trainer._id} className="mb-3 flex-row items-center">
                  {trainer.avatar ? (
                    <Image
                      source={{ uri: trainer.avatar }}
                      className="mr-3 h-12 w-12 rounded-full"
                    />
                  ) : (
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                      <Ionicons name="person" size={24} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800">{trainer.fullName}</Text>
                    {trainer.specialization && (
                      <Text className="text-xs text-gray-600">{trainer.specialization}</Text>
                    )}
                    {trainer.phone && (
                      <Text className="text-xs text-gray-500">{trainer.phone}</Text>
                    )}
                  </View>
                  {trainer.rating && (
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="ml-1 text-sm font-medium text-gray-700">
                        {trainer.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Enrolled Students */}
          {classData.classEnrolled && classData.classEnrolled.length > 0 && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <View className="mb-3 flex-row items-center">
                <Ionicons name="people" size={20} color="#16697A" />
                <Text className="ml-2 text-base font-semibold text-gray-800">
                  Học viên đã đăng kí ({classData.classEnrolled.length})
                </Text>
              </View>
              {classData.classEnrolled.map((student, index) => (
                <View key={student.userId} className="mb-3 flex-row items-center">
                  {student.avatar ? (
                    <Image
                      source={{ uri: student.avatar }}
                      className="mr-3 h-10 w-10 rounded-full"
                    />
                  ) : (
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <Ionicons name="person" size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">{student.fullName}</Text>
                    {student.phone && (
                      <Text className="text-xs text-gray-500">{student.phone}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Class Sessions */}
          {classData.classSession && classData.classSession.length > 0 && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <View className="mb-3 flex-row items-center">
                <Ionicons name="list" size={20} color="#16697A" />
                <Text className="ml-2 text-base font-semibold text-gray-800">
                  Danh sách buổi học ({classData.classSession.length})
                </Text>
              </View>
              {classData.classSession.map((session, index) => {
                const sessionStart = new Date(session.startTime);
                const sessionEnd = new Date(session.endTime);
                return (
                  <View
                    key={session._id}
                    className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <Text className="mb-1 text-sm font-semibold text-gray-800">
                      {session.title || `Buổi ${index + 1}`}
                    </Text>
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text className="ml-2 text-xs text-gray-600">
                        {format(sessionStart, 'EEE, dd/MM/yyyy', { locale: vi })}
                      </Text>
                    </View>
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text className="ml-2 text-xs text-gray-600">
                        {format(sessionStart, 'HH:mm', { locale: vi })} -{' '}
                        {format(sessionEnd, 'HH:mm', { locale: vi })} ({session.hours}h)
                      </Text>
                    </View>
                    {session.roomName && (
                      <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <Text className="ml-2 text-xs text-gray-600">{session.roomName}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
