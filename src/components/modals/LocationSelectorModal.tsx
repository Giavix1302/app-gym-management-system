import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../../services/locationService';
import { Location } from '../../types/api';
import { useNotification } from '../../context/NotificationContext';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
}

export default function LocationSelectorModal({
  visible,
  onClose,
  onSelectLocation,
}: LocationSelectorModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const { error: showError } = useNotification();

  useEffect(() => {
    if (visible) {
      fetchLocations();
    }
  }, [visible]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationService.getLocations();
      setLocations(response.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      showError('Không thể tải danh sách cơ sở');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedId(location._id);
    onSelectLocation(location);
    onClose();
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const isSelected = selectedId === item._id;

    return (
      <TouchableOpacity
        className={`mb-3 rounded-2xl border-2 p-4 ${
          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
        }`}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}>
        <View className="flex-row items-start">
          {/* Icon */}
          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: '#16697A15' }}>
            <Ionicons name="location" size={24} color="#16697A" />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="mb-1 text-base font-bold text-gray-800">{item.name}</Text>
            <Text className="text-sm leading-5 text-gray-600">
              {item.address.street}, {item.address.ward}
            </Text>
            <Text className="text-sm text-gray-600">{item.address.province}</Text>
          </View>

          {/* Checkmark */}
          {isSelected && <Ionicons name="checkmark-circle" size={24} color="#16697A" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-4/5 rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-gray-800">Chọn cơ sở tập</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#16697A" />
              <Text className="mt-4 text-gray-600">Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item._id}
              contentContainerClassName="px-6 py-4"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center py-20">
                  <Ionicons name="location-outline" size={64} color="#D1D5DB" />
                  <Text className="mt-4 text-gray-500">Không có cơ sở nào</Text>
                </View>
              }
            />
          )}

          {/* Bottom padding for safe area */}
          <View className="h-6" />
        </View>
      </View>
    </Modal>
  );
}
