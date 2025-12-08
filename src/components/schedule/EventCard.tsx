import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventCardProps } from '../../types/schedule';
import {
  formatEventTimeRange,
  getTrainerNames,
  getEventLocation,
  getEventColor,
} from '../../utils/eventHelpers';

export default function EventCard({ event }: EventCardProps) {
  const borderColor = getEventColor(event.eventType);

  return (
    <View style={styles.container} className="bg-white rounded-lg p-4 mb-3">
      {/* Left border for visual indicator - color based on event type */}
      <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />

      {/* Event Title */}
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {event.title}
      </Text>

      {/* Time */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="time-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          {formatEventTimeRange(event)}
        </Text>
      </View>

      {/* Location */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          {getEventLocation(event)}
        </Text>
      </View>

      {/* Trainer */}
      <View className="flex-row items-center">
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          HLV {getTrainerNames(event)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
});
