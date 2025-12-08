import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventListProps } from '../../types/schedule';
import { ScheduleEvent } from '../../types/api';
import EventCard from './EventCard';
import { groupEventsByDate } from '../../utils/eventHelpers';
import { formatFullDate, convertUTCToVietnam } from '../../utils/dateTime';
import { Colors } from '../../constants/colors';

interface EventGroup {
  dateKey: string;
  date: Date;
  events: ScheduleEvent[];
}

export default function EventList({
  events,
  loading,
  refreshing,
  onRefresh,
}: EventListProps) {
  // Group events by date and convert to array for FlatList
  const groupedEvents = useMemo(() => {
    const grouped = groupEventsByDate(events);
    const groups: EventGroup[] = Object.keys(grouped)
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
        <Text className="text-gray-500 text-center mt-4">
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
    <View className="bg-primary px-4 py-2 rounded-tl-lg mb-2">
      <Text className="text-white font-bold">
        {formatFullDate(date)} ({eventCount} sự kiện)
      </Text>
    </View>
  );

  // Render event group
  const renderEventGroup = ({ item }: { item: EventGroup }) => (
    <View className="mb-4">
      {renderDateHeader(item.date, item.events.length)}
      <View className="px-4">
        {item.events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </View>
    </View>
  );

  // Render legend
  const renderLegend = () => (
    <View className="px-4 py-3 bg-gray-100 flex-row items-center justify-center">
      <View className="flex-row items-center mr-6">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: '#EAB308' }}
        />
        <Text className="text-xs text-gray-600">Lịch học lớp</Text>
      </View>
      <View className="flex-row items-center">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: '#3B82F6' }}
        />
        <Text className="text-xs text-gray-600">Lịch tập PT</Text>
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
