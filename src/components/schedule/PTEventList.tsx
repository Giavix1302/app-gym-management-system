import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PTEvent } from '../../types/api';
import PTEventCard from './PTEventCard';
import { convertUTCToVietnam, formatFullDate } from '../../utils/dateTime';
import { Colors } from '../../constants/colors';

interface PTEventListProps {
  events: PTEvent[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

interface PTEventGroup {
  dateKey: string;
  date: Date;
  events: PTEvent[];
}

// Group PT events by date
const groupPTEventsByDate = (events: PTEvent[]): Record<string, PTEvent[]> => {
  const grouped: Record<string, PTEvent[]> = {};

  events.forEach((event) => {
    const eventDate = convertUTCToVietnam(event.startTime);
    const dateKey = eventDate.toDateString();

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  // Sort events within each date by start time
  Object.keys(grouped).forEach((dateKey) => {
    grouped[dateKey].sort((a, b) => {
      const timeA = convertUTCToVietnam(a.startTime).getTime();
      const timeB = convertUTCToVietnam(b.startTime).getTime();
      return timeA - timeB;
    });
  });

  return grouped;
};

export default function PTEventList({ events, loading, refreshing, onRefresh }: PTEventListProps) {
  // Group events by date and convert to array for FlatList
  const groupedEvents = useMemo(() => {
    const grouped = groupPTEventsByDate(events);
    const groups: PTEventGroup[] = Object.keys(grouped)
      .map((dateKey) => ({
        dateKey,
        date: new Date(dateKey),
        events: grouped[dateKey],
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return groups;
  }, [events]);

  // Empty state
  if (!loading && events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-center text-gray-500">
          Không có lịch nào trong khoảng thời gian này
        </Text>
      </View>
    );
  }

  // Loading state
  if (loading && events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Render date header
  const renderDateHeader = (date: Date, eventCount: number) => (
    <View className="mx-4 mb-2 rounded-full bg-primary px-4 py-2">
      <Text className="font-bold text-white">
        {formatFullDate(date)} ({eventCount} sự kiện)
      </Text>
    </View>
  );

  // Render event group
  const renderEventGroup = ({ item }: { item: PTEventGroup }) => (
    <View className="mb-4">
      {renderDateHeader(item.date, item.events.length)}
      <View className="px-4">
        {item.events.map((event, index) => (
          <PTEventCard key={event._id || index} event={event} />
        ))}
      </View>
    </View>
  );

  // Render legend
  const renderLegend = () => (
    <View className="flex-row items-center justify-center bg-gray-100 px-4 py-3">
      <View className="mr-6 flex-row items-center">
        <View className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: '#EAB308' }} />
        <Text className="text-xs text-gray-600">Lớp học</Text>
      </View>
      <View className="flex-row items-center">
        <View className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
        <Text className="text-xs text-gray-600">Booking PT</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={groupedEvents}
      renderItem={renderEventGroup}
      keyExtractor={(item) => item.dateKey}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
      ListFooterComponent={renderLegend}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
}
