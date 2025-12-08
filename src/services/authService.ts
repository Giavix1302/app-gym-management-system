import { axiosPublic } from '../config/axios';
import { LoginRequest, LoginResponse, EMPTY_MEMBERSHIP } from '../types/api';
import {
  saveTokens,
  saveUser,
  saveTrainer,
  saveMyMembership,
  clearUserData,
} from '../utils/storage';
import { formatPhoneToInternational } from '../utils/phoneNumber';

export const authService = {
  /**
   * Login user or PT
   * @param phone - User's phone number
   * @param password - User's password
   * @returns LoginResponse data
   */
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    const requestData: LoginRequest = {
      phone: formatPhoneToInternational(phone),
      password,
    };

    const response = await axiosPublic.post<LoginResponse>('/auths/login', requestData);

    const { user, trainer, myMembership, accessToken, refreshToken } = response.data;

    // Validate tokens before saving
    if (!accessToken || typeof accessToken !== 'string') {
      console.error('Invalid accessToken received:', {
        type: typeof accessToken,
        value: accessToken,
      });
      throw new Error('Invalid access token received from server');
    }

    if (!refreshToken || typeof refreshToken !== 'string') {
      console.error('Invalid refreshToken received:', {
        type: typeof refreshToken,
        value: refreshToken,
      });
      throw new Error('Invalid refresh token received from server');
    }

    // Save tokens
    await saveTokens(accessToken, refreshToken);

    // Save user data
    await saveUser(user);

    // Save trainer data if role is PT
    if (trainer) {
      await saveTrainer(trainer);
    }

    // Save myMembership (or empty if not exists)
    await saveMyMembership(myMembership || EMPTY_MEMBERSHIP);

    return response.data;
  },

  /**
   * Logout and clear all stored data
   */
  logout: async (): Promise<void> => {
    await clearUserData();
  },
};
