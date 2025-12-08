import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageUploaderProps {
  images: string[]; // Array of image URIs
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  minImages = 1,
}) => {
  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập camera",
        "Vui lòng cấp quyền truy cập camera để chụp ảnh"
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập thư viện",
        "Vui lòng cấp quyền truy cập thư viện ảnh"
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Giới hạn ảnh",
        `Bạn chỉ có thể thêm tối đa ${maxImages} ảnh`
      );
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImagesChange([...images, result.assets[0].uri]);
    }
  };

  // Pick image from library
  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Giới hạn ảnh",
        `Bạn chỉ có thể thêm tối đa ${maxImages} ảnh`
      );
      return;
    }

    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      onImagesChange([...images, ...newImages]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View>
      {/* Label */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-700 dark:text-gray-300 font-semibold">
          Hình ảnh {minImages > 0 && <Text className="text-red-500">*</Text>}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {images.length}/{maxImages} ảnh
        </Text>
      </View>

      {/* Images Grid */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{
            paddingTop: 8,
            paddingRight: 10,
          }}
        >
          {images.map((uri, index) => (
            <View key={index} style={{ width: 104, height: 104 }}>
              <View className="relative w-24 h-24">
                <Image
                  source={{ uri }}
                  className="w-full h-full border-separate border-2 rounded-md border-gray-300 dark:border-gray-600"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center border-2 border-white dark:border-gray-900"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload Buttons */}
      <View className="flex-row gap-3">
        {/* Camera Button */}
        <TouchableOpacity
          onPress={takePhoto}
          disabled={images.length >= maxImages}
          className={`flex-1 ${
            images.length >= maxImages
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
          } border-2 rounded-xl py-3.5 flex-row items-center justify-center`}
        >
          <Ionicons
            name="camera"
            size={22}
            color={images.length >= maxImages ? "#9CA3AF" : "#2563EB"}
          />
          <Text
            className={`${
              images.length >= maxImages
                ? "text-gray-400 dark:text-gray-500"
                : "text-blue-600 dark:text-blue-400"
            } font-bold ml-2 text-base`}
          >
            Chụp ảnh
          </Text>
        </TouchableOpacity>

        {/* Library Button */}
        <TouchableOpacity
          onPress={pickImage}
          disabled={images.length >= maxImages}
          className={`flex-1 ${
            images.length >= maxImages
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              : "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
          } border-2 rounded-xl py-3.5 flex-row items-center justify-center`}
        >
          <Ionicons
            name="images"
            size={22}
            color={images.length >= maxImages ? "#9CA3AF" : "#9333EA"}
          />
          <Text
            className={`${
              images.length >= maxImages
                ? "text-gray-400 dark:text-gray-500"
                : "text-purple-600 dark:text-purple-400"
            } font-bold ml-2 text-base`}
          >
            Thư viện
          </Text>
        </TouchableOpacity>
      </View>

      {/* Validation message */}
      {minImages > 0 && images.length < minImages && (
        <Text className="text-red-500 text-sm mt-2">
          Vui lòng thêm ít nhất {minImages} hình ảnh để xác nhận hoàn thành
        </Text>
      )}
    </View>
  );
};
