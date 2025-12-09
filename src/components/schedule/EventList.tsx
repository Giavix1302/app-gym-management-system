import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventListProps } from '../../types/schedule';
import { ScheduleEvent } from '../../types/api';
import EventCard from './EventCard';
import { groupEventsByDate } from '../../utils/eventHelpers';
import { formatFullDate } from '../../utils/dateTime';
import { Colors } from '../../constants/colors';

interface EventGroup {
  dateKey: string;
  date: Date;
  events: ScheduleEvent[];
}

export default function EventList({ events, loading, refreshing, onRefresh }: EventListProps) {
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
    <View className="mx-4 mb-2 rounded-full bg-primary px-4 py-2 ">
      <Text className="font-bold text-white">
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
    <View className="flex-row items-center justify-center bg-gray-100 px-4 py-3">
      <View className="mr-6 flex-row items-center">
        <View className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: '#EAB308' }} />
        <Text className="text-xs text-gray-600">Lịch học lớp</Text>
      </View>
      <View className="flex-row items-center">
        <View className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
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
