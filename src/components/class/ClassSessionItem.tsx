import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassSession } from '../../types/class';
import { formatSessionDate, formatSessionTime, isSessionPast } from '../../utils/classHelpers';

interface ClassSessionItemProps {
  session: ClassSession;
}

export default function ClassSessionItem({ session }: ClassSessionItemProps) {
  const isPast = isSessionPast(session.endTime);
  const sessionDate = formatSessionDate(session.startTime);
  const sessionTime = formatSessionTime(session.startTime, session.endTime);

  return (
    <View
      className={`mb-3 rounded-lg border-2 p-3 ${
        isPast ? 'border-gray-200 bg-gray-50' : 'border-primary/20 bg-primary/5'
      }`}>
      <View className="flex-row items-center justify-between mb-2">
        {/* Date */}
        <View className="flex-row items-center flex-1">
          <Ionicons
            name="calendar"
            size={16}
            color={isPast ? '#9CA3AF' : '#16697A'}
          />
          <Text
            className={`text-sm font-semibold ml-2 ${
              isPast ? 'text-gray-500' : 'text-gray-800'
            }`}>
            {sessionDate}
          </Text>
        </View>

        {/* Status Badge */}
        {isPast && (
          <View className="bg-gray-200 rounded-full px-2 py-1">
            <Text className="text-xs font-semibold text-gray-600">Đã qua</Text>
          </View>
        )}
      </View>

      {/* Time */}
      <View className="flex-row items-center mb-2">
        <Ionicons
          name="time"
          size={16}
          color={isPast ? '#9CA3AF' : '#16697A'}
        />
        <Text
          className={`text-sm ml-2 ${
            isPast ? 'text-gray-500' : 'text-gray-700'
          }`}>
          {sessionTime}
        </Text>
      </View>

      {/* Room */}
      <View className="flex-row items-center">
        <Ionicons
          name="location"
          size={16}
          color={isPast ? '#9CA3AF' : '#16697A'}
        />
        <Text
          className={`text-sm ml-2 ${
            isPast ? 'text-gray-500' : 'text-gray-700'
          }`}>
          {session.room}
        </Text>
      </View>
    </View>
  );
}
