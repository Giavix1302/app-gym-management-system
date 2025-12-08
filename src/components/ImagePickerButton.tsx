import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface ImagePickerButtonProps {
  images: string[]; // Array of image URIs
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  minImages = 1,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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
      allowsEditing: false,
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
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      onImagesChange([...images, ...newImages]);
    }
  };

  // Show action sheet to choose camera or library
  const showImagePickerOptions = () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Giới hạn ảnh",
        `Bạn chỉ có thể thêm tối đa ${maxImages} ảnh`
      );
      return;
    }

    Alert.alert(
      "Chọn ảnh",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        {
          text: "Chụp ảnh",
          onPress: takePhoto,
          style: "default",
        },
        {
          text: "Chọn từ thư viện",
          onPress: pickImage,
          style: "default",
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
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

      {/* Images Grid with Add Button - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingRight: 10,
        }}
      >
        {/* Preview Images */}
        {images.map((uri, index) => (
          <View
            key={index}
            style={{ width: 104, height: 104, marginRight: 8 }}
            className="relative"
          >
            <Image
              source={{ uri }}
              style={{ width: 104, height: 104 }}
              className="rounded-lg border-2 border-gray-300 dark:border-gray-600"
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
        ))}

        {/* Image Picker Button - Dashed border square with + icon */}
        {images.length < maxImages && (
          <TouchableOpacity
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
            style={[
              styles.pickerButton,
              {
                borderColor: isDark ? "#6B7280" : "#9CA3AF",
                backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                width: 104,
                height: 104,
              },
            ]}
          >
            <View className="items-center justify-center w-full h-full">
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={isDark ? "#9CA3AF" : "#6B7280"}
                style={{ marginBottom: 4 }}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Thêm ảnh
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Validation message */}
      {minImages > 0 && images.length < minImages && (
        <Text className="text-red-500 text-sm mt-2">
          Vui lòng thêm ít nhất {minImages} hình ảnh để xác nhận hoàn thành
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
  },
});
