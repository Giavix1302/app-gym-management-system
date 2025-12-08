import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, Trainer, Membership, EMPTY_MEMBERSHIP } from '../types/api';

// ==================== AsyncStorage (cho Access Token) ====================

export const saveToAsyncStorage = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to AsyncStorage:`, error);
    throw error;
  }
};

export const getFromAsyncStorage = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key} from AsyncStorage:`, error);
    return null;
  }
};

export const removeFromAsyncStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from AsyncStorage:`, error);
    throw error;
  }
};

export const clearAsyncStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    throw error;
  }
};

// ==================== SecureStore (cho Refresh Token) ====================

export const saveToSecureStore = async (key: string, value: string): Promise<void> => {
  try {
    // Validate that value is actually a string
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type for ${key}. Expected string but got ${typeof value}`);
    }

    // Ensure value is not empty
    if (!value || value.trim() === '') {
      throw new Error(`Invalid empty value for ${key}`);
    }

    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
    throw error;
  }
};

export const getFromSecureStore = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting ${key} from SecureStore:`, error);
    return null;
  }
};

export const removeFromSecureStore = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing ${key} from SecureStore:`, error);
    throw error;
  }
};

// ==================== Token Management ====================

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await Promise.all([
    saveToAsyncStorage(ACCESS_TOKEN_KEY, accessToken),
    saveToSecureStore(REFRESH_TOKEN_KEY, refreshToken),
  ]);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await getFromAsyncStorage(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await getFromSecureStore(REFRESH_TOKEN_KEY);
};

export const clearTokens = async (): Promise<void> => {
  await Promise.all([
    removeFromAsyncStorage(ACCESS_TOKEN_KEY),
    removeFromSecureStore(REFRESH_TOKEN_KEY),
  ]);
};

// ==================== User Data Management ====================

const USER_KEY = 'user';
const TRAINER_KEY = 'trainer';
const MY_MEMBERSHIP_KEY = 'myMembership';

export const saveUser = async (user: User): Promise<void> => {
  await saveToAsyncStorage(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<User | null> => {
  const data = await getFromAsyncStorage(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const removeUser = async (): Promise<void> => {
  await removeFromAsyncStorage(USER_KEY);
};

export const saveTrainer = async (trainer: Trainer): Promise<void> => {
  await saveToAsyncStorage(TRAINER_KEY, JSON.stringify(trainer));
};

export const getTrainer = async (): Promise<Trainer | null> => {
  const data = await getFromAsyncStorage(TRAINER_KEY);
  return data ? JSON.parse(data) : null;
};

export const removeTrainer = async (): Promise<void> => {
  await removeFromAsyncStorage(TRAINER_KEY);
};

export const saveMyMembership = async (membership: Membership): Promise<void> => {
  await saveToAsyncStorage(MY_MEMBERSHIP_KEY, JSON.stringify(membership));
};

export const getMyMembership = async (): Promise<Membership> => {
  const data = await getFromAsyncStorage(MY_MEMBERSHIP_KEY);
  return data ? JSON.parse(data) : EMPTY_MEMBERSHIP;
};

export const removeMyMembership = async (): Promise<void> => {
  await removeFromAsyncStorage(MY_MEMBERSHIP_KEY);
};

// Clear all user-related data
export const clearUserData = async (): Promise<void> => {
  await Promise.all([removeUser(), removeTrainer(), removeMyMembership(), clearTokens()]);
};
