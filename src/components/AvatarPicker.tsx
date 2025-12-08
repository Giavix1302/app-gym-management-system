import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface AvatarPickerProps {
  imageUri: string | null; // Single image URI
  onImageChange: (uri: string) => void;
  size?: number; // Avatar size (default: 120)
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  imageUri,
  onImageChange,
  size = 120,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập camera',
        'Vui lòng cấp quyền truy cập camera để chụp ảnh'
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập thư viện',
        'Vui lòng cấp quyền truy cập thư viện ảnh'
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageChange(result.assets[0].uri);
    }
  };

  // Pick image from library
  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageChange(result.assets[0].uri);
    }
  };

  // Show action sheet to choose camera or library
  const showImagePickerOptions = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
      [
        {
          text: 'Chụp ảnh',
          onPress: takePhoto,
          style: 'default',
        },
        {
          text: 'Chọn từ thư viện',
          onPress: pickImage,
          style: 'default',
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="items-center justify-center">
      <TouchableOpacity
        onPress={showImagePickerOptions}
        activeOpacity={0.8}
        className="relative"
      >
        {/* Avatar Image */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          className="bg-gray-200 dark:bg-gray-700 items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
              }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person"
              size={size * 0.5}
              color={isDark ? '#9CA3AF' : '#D1D5DB'}
            />
          )}
        </View>

        {/* Edit Button - Positioned at bottom right */}
        <View
          className="absolute bottom-0 right-0 bg-primary rounded-full p-2.5 border-3 border-white dark:border-gray-800"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="camera" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Helper Text */}
      <Text className="text-gray-500 dark:text-gray-400 text-sm mt-3 text-center">
        Nhấn để thay đổi ảnh đại diện
      </Text>
    </View>
  );
};
