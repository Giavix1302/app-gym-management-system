import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Slot } from '../../types/booking';
import { formatSlotTime } from '../../utils/bookingHelpers';

interface SlotButtonProps {
  slot: Slot;
  onPress: (slot: Slot) => void;
  disabled?: boolean;
}

export default function SlotButton({ slot, onPress, disabled = false }: SlotButtonProps) {
  const timeRange = formatSlotTime(slot.startTime, slot.endTime);

  return (
    <TouchableOpacity
      className={`mr-2 rounded-lg px-4 py-2 ${disabled ? 'bg-gray-100' : 'bg-primary/10'}`}
      onPress={() => onPress(slot)}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-primary'}`}>
        {timeRange}
      </Text>
    </TouchableOpacity>
  );
}
