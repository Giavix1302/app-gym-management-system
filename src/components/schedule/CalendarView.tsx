import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarViewProps } from '../../types/schedule';
import {
  getDaysInWeek,
  getDaysInMonth,
  getShortDayName,
  isToday,
  isWeekend,
  isSameDayCheck,
  isInSameMonth,
} from '../../utils/dateTime';
import { dateHasEvents } from '../../utils/eventHelpers';
import { Colors } from '../../constants/colors';

export default function CalendarView({
  viewType,
  selectedDate,
  selectedWeek,
  selectedMonth,
  selectedYear,
  events,
  onDateSelect,
}: CalendarViewProps) {
  // Day view - no calendar
  if (viewType === 'day') {
    return null;
  }

  // Week view
  if (viewType === 'week') {
    const weekDays = getDaysInWeek(selectedYear, selectedWeek);

    return (
      <View className="bg-white border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2 py-3"
        >
          {weekDays.map((date, index) => {
            const isCurrentDay = isToday(date);
            const isWeekendDay = isWeekend(date);
            const isSelected = isSameDayCheck(date, selectedDate);
            const hasEvents = dateHasEvents(date, events);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => onDateSelect(date)}
                className={`items-center justify-center mx-1 px-3 py-2 rounded-lg ${
                  isCurrentDay
                    ? 'bg-primary'
                    : isSelected
                    ? 'border-2 border-primary'
                    : ''
                }`}
                style={{ minWidth: 50 }}
              >
                {/* Day name */}
                <Text
                  className={`text-xs mb-1 ${
                    isCurrentDay
                      ? 'text-white font-bold'
                      : isWeekendDay
                      ? 'text-error'
                      : 'text-gray-600'
                  }`}
                >
                  {getShortDayName(date)}
                </Text>

                {/* Date number */}
                <Text
                  className={`text-base font-semibold ${
                    isCurrentDay
                      ? 'text-white'
                      : isWeekendDay
                      ? 'text-error'
                      : 'text-gray-800'
                  }`}
                >
                  {date.getDate()}
                </Text>

                {/* Event indicator dot */}
                {hasEvents && !isCurrentDay && (
                  <View
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: '#EAB308' }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Month view
  if (viewType === 'month') {
    const monthDays = getDaysInMonth(selectedYear, selectedMonth);
    const weeks: Date[][] = [];

    // Group days into weeks (7 days each)
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }

    return (
      <View className="bg-white border-b border-gray-200 px-2 py-3">
        {/* Header - day names */}
        <View className="flex-row mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
            <View
              key={index}
              className="flex-1 items-center"
              style={{ minWidth: 40 }}
            >
              <Text
                className={`text-xs font-semibold ${
                  index >= 5 ? 'text-error' : 'text-gray-600'
                }`}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row mb-1">
            {week.map((date, dayIndex) => {
              const isCurrentDay = isToday(date);
              const isWeekendDay = isWeekend(date);
              const isSelected = isSameDayCheck(date, selectedDate);
              const hasEvents = dateHasEvents(date, events);
              const isCurrentMonth = isInSameMonth(
                date,
                selectedYear,
                selectedMonth
              );

              return (
                <TouchableOpacity
                  key={dayIndex}
                  onPress={() => onDateSelect(date)}
                  className={`flex-1 items-center justify-center py-2 mx-0.5 rounded-lg ${
                    isCurrentDay
                      ? 'bg-primary'
                      : isSelected
                      ? 'border-2 border-primary'
                      : ''
                  }`}
                  style={{ minWidth: 40, minHeight: 40 }}
                >
                  <Text
                    className={`text-sm ${
                      isCurrentDay
                        ? 'text-white font-bold'
                        : !isCurrentMonth
                        ? 'text-gray-300'
                        : isWeekendDay
                        ? 'text-error'
                        : 'text-gray-800'
                    }`}
                  >
                    {date.getDate()}
                  </Text>

                  {/* Event indicator dot */}
                  {hasEvents && !isCurrentDay && isCurrentMonth && (
                    <View
                      className="w-1 h-1 rounded-full mt-0.5"
                      style={{ backgroundColor: '#EAB308' }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  }

  return null;
}
