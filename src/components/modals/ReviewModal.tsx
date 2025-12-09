import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  loading?: boolean;
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      return;
    }
    if (comment.trim().length < 2) {
      return;
    }
    onSubmit(rating, comment.trim());
  };

  const isValid = rating > 0 && comment.trim().length >= 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Đánh giá PT</Text>
            <TouchableOpacity onPress={handleClose} className="p-1" disabled={loading}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerClassName="px-6 py-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Rating Stars */}
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Đánh giá chất lượng
            </Text>
            <View className="flex-row justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  disabled={loading}
                  className="mx-1"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Nhận xét của bạn
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 min-h-32 text-base"
              placeholder="Chia sẻ trải nghiệm của bạn về PT... (tối thiểu 2 ký tự)"
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
              editable={!loading}
              maxLength={500}
            />

            {/* Character Count */}
            <View className="flex-row justify-between mt-2 mb-4">
              <Text
                className={`text-sm ${
                  comment.trim().length >= 2 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {comment.trim().length >= 2 ? 'Đủ ký tự' : 'Còn thiếu ký tự'}
              </Text>
              <Text className="text-sm text-gray-400">{comment.length}/500</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                isValid && !loading ? 'bg-primary' : 'bg-gray-300'
              }`}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom padding for safe area */}
          <View className="h-6" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
