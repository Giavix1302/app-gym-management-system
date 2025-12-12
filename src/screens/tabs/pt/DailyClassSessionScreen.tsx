import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ClassSessionEvent } from '../../../types/class';

type DailyClassSessionRouteProp = RouteProp<RootStackParamList, 'DailyClassSession'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DailyClassSessionScreen() {
  const route = useRoute<DailyClassSessionRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { selectedDate, sessions } = route.params;

  const date = new Date(selectedDate);
  const dateString = format(date, 'EEEE, dd/MM/yyyy', { locale: vi });

  // Sort sessions by start time
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: vi });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#16697A" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">Bu’i hÕc ng‡y</Text>
            <Text className="text-sm capitalize text-gray-600">{dateString}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {sortedSessions.length === 0 ? (
            <View className="mt-16 items-center">
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-center text-gray-500">
                KhÙng cÛ bu’i hÕc n‡o trong ng‡y n‡y
              </Text>
            </View>
          ) : (
            <>
              <Text className="mb-4 text-sm font-medium text-gray-600">
                T’ng s—: {sortedSessions.length} bu’i hÕc
              </Text>
              {sortedSessions.map((session, index) => {
                const startTime = new Date(session.startTime);
                const endTime = new Date(session.endTime);
                const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

                return (
                  <View
                    key={session._id}
                    className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    {/* Class Image */}
                    {session.image && (
                      <Image
                        source={{ uri: session.image }}
                        className="h-32 w-full"
                        resizeMode="cover"
                      />
                    )}

                    <View className="p-4">
                      {/* Class Name and Type */}
                      <View className="mb-3 flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="mb-1 text-lg font-bold text-gray-800">
                            {session.className}
                          </Text>
                          <View className="flex-row items-center">
                            <Ionicons
                              name={getClassTypeIcon(session.classType)}
                              size={16}
                              color="#6B7280"
                            />
                            <Text className="ml-1 text-xs capitalize text-gray-600">
                              {session.classType}
                            </Text>
                          </View>
                        </View>
                        <View className="rounded-full bg-blue-100 px-3 py-1">
                          <Text className="text-xs font-semibold text-blue-700">Bu’i {index + 1}</Text>
                        </View>
                      </View>

                      {/* Session Title */}
                      {session.title && (
                        <View className="mb-3">
                          <Text className="text-sm font-medium text-gray-700">{session.title}</Text>
                        </View>
                      )}

                      {/* Time */}
                      <View className="mb-2 flex-row items-center">
                        <Ionicons name="time" size={18} color="#16697A" />
                        <Text className="ml-2 text-sm font-semibold text-gray-800">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </Text>
                        <Text className="ml-2 text-xs text-gray-500">
                          ({duration.toFixed(1)}h)
                        </Text>
                      </View>

                      {/* Room */}
                      {session.roomName && (
                        <View className="flex-row items-center">
                          <Ionicons name="location" size={18} color="#16697A" />
                          <Text className="ml-2 text-sm text-gray-600">{session.roomName}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
