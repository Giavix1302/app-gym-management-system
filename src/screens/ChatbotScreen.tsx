import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getUser } from '../utils/storage';
import { User } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  chatbotService,
  ChatMessage,
  RateLimitInfo,
} from '../services/chatbotService';
import MessageBubble from '../components/chatbot/MessageBubble';
import TypingIndicator from '../components/chatbot/TypingIndicator';
import RateLimitBadge from '../components/chatbot/RateLimitBadge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chatbot'>;

const STORAGE_KEY = 'chatbot_messages_';
const CONVERSATION_ID_KEY = 'chatbot_conversation_id_';

export default function ChatbotScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);

      if (userData?._id) {
        // Load conversation history from AsyncStorage
        await loadMessagesFromStorage(userData._id);
        // Fetch conversation history from server
        await fetchConversationHistory(userData._id);
      }
    };
    loadUser();
  }, []);

  // Load messages from AsyncStorage
  const loadMessagesFromStorage = async (userId: string) => {
    try {
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY + userId);
      const storedConversationId = await AsyncStorage.getItem(CONVERSATION_ID_KEY + userId);

      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      if (storedConversationId) {
        setConversationId(storedConversationId);
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
  };

  // Save messages to AsyncStorage
  const saveMessagesToStorage = async (userId: string, msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY + userId, JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  };

  // Fetch conversation history from server
  const fetchConversationHistory = async (userId: string) => {
    try {
      const response = await chatbotService.getConversationHistory(userId);

      if (response.success && response.conversation) {
        const serverMessages = response.conversation.messages;
        setMessages(serverMessages);
        setConversationId(response.conversation._id);

        // Save to AsyncStorage
        await saveMessagesToStorage(userId, serverMessages);
        await AsyncStorage.setItem(CONVERSATION_ID_KEY + userId, response.conversation._id);
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isRateLimited || !user?._id) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Save to storage
    await saveMessagesToStorage(user._id, updatedMessages);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const { data, rateLimitInfo: rateLimit } = await chatbotService.sendMessage(
        user._id,
        userMessage.content
      );

      setRateLimitInfo(rateLimit);

      if (data.success) {
        const botMessage: ChatMessage = {
          type: 'bot',
          content: data.response.content,
          timestamp: data.timestamp,
        };

        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);

        // Save conversation ID and messages
        setConversationId(data.conversationId);
        await saveMessagesToStorage(user._id, finalMessages);
        await AsyncStorage.setItem(CONVERSATION_ID_KEY + user._id, data.conversationId);

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Handle error response
        const errorMessage: ChatMessage = {
          type: 'bot',
          content: data.response.content || 'Đã có lỗi xảy ra. Vui lòng thử lại!',
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        await saveMessagesToStorage(user._id, finalMessages);
      }
    } catch (error: any) {
      console.error('Send message error:', error);

      // Check if it's a rate limit error (429)
      if (error?.response?.status === 429) {
        const errorData = error.response.data;
        setIsRateLimited(true);

        Alert.alert(
          'Đã hết lượt hỏi',
          errorData.suggestion || 'Bạn đã vượt quá giới hạn tin nhắn hôm nay.',
          [{ text: 'Đã hiểu' }]
        );
      } else {
        // Generic error
        const errorMessage: ChatMessage = {
          type: 'bot',
          content: 'Không thể kết nối với chatbot. Vui lòng thử lại sau.',
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        await saveMessagesToStorage(user._id, finalMessages);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Render message item
  const renderMessageItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  // Scroll to end when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-backgroundDefault"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header */}
      <View
        className="border-b border-gray-200 bg-white"
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="rounded-full bg-gray-100 p-2">
              <Ionicons name="arrow-back" size={24} color="#16697A" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                <FontAwesome5 name="robot" size={20} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Chatbot AI</Text>
                <Text className="text-xs text-gray-500">Trợ lý ảo của bạn</Text>
              </View>
            </View>
          </View>

          {/* Rate Limit Badge */}
          <RateLimitBadge rateLimitInfo={rateLimitInfo} />
        </View>
      </View>

      {/* Messages List */}
      <View className="flex-1">
        {messages.length === 0 ? (
          // Empty State
          <View className="flex-1 items-center justify-center px-6">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <FontAwesome5 name="robot" size={40} color="#16697A" />
            </View>
            <Text className="mb-2 text-xl font-bold text-gray-800">Xin chào!</Text>
            <Text className="mb-6 text-center text-sm leading-6 text-gray-600">
              Tôi là trợ lý ảo của THE GYM. Bạn có thể hỏi tôi về gói tập, lớp học, lịch
              tập, hoặc bất kỳ thông tin gì về phòng gym!
            </Text>

            {/* Suggestion Chips */}
            <View className="w-full gap-2">
              <TouchableOpacity
                onPress={() => setInputMessage('Gói tập của tôi còn bao nhiêu ngày?')}
                className="rounded-xl border border-primary/30 bg-white px-4 py-3">
                <Text className="text-center text-sm text-primary">
                  Gói tập của tôi còn bao nhiêu ngày?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputMessage('Lịch tập của tôi tuần này')}
                className="rounded-xl border border-primary/30 bg-white px-4 py-3">
                <Text className="text-center text-sm text-primary">
                  Lịch tập của tôi tuần này
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputMessage('Gym có những gói membership nào?')}
                className="rounded-xl border border-primary/30 bg-white px-4 py-3">
                <Text className="text-center text-sm text-primary">
                  Gym có những gói membership nào?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => `${item.type}-${index}-${item.timestamp}`}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />
        )}
      </View>

      {/* Input Area */}
      <View className="border-t border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-full border border-gray-300 bg-gray-50 px-4">
            <TextInput
              className="flex-1 py-3 text-sm text-gray-800"
              placeholder={
                isRateLimited
                  ? 'Đã hết lượt hỏi hôm nay'
                  : 'Nhập tin nhắn...'
              }
              placeholderTextColor="#9CA3AF"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={1000}
              editable={!isLoading && !isRateLimited}
              onSubmitEditing={sendMessage}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isLoading || isRateLimited}
            className={`h-12 w-12 items-center justify-center rounded-full ${
              inputMessage.trim() && !isLoading && !isRateLimited
                ? 'bg-primary'
                : 'bg-gray-300'
            }`}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputMessage.trim() && !isRateLimited ? 'white' : '#9CA3AF'}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Rate Limit Warning (when low) */}
        {rateLimitInfo && rateLimitInfo.remaining <= 10 && rateLimitInfo.remaining > 0 && (
          <View className="mt-2 flex-row items-center justify-center">
            <Ionicons name="warning" size={14} color="#F59E0B" />
            <Text className="ml-1 text-xs text-warning">
              Còn {rateLimitInfo.remaining} lượt hỏi hôm nay
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
