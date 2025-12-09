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

interface SignupRequest {
  phone: string;
  password: string;
  fullName: string;
  role: 'user' | 'pt';
}

interface SignupResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpRequest {
  phone: string;
  code: string;
}

interface VerifyOtpResponse extends LoginResponse {
  success: boolean;
  message: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface ForgotPasswordVerifyOtpResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordRequest {
  phone: string;
  plainPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

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
   * Signup new user or PT
   * @param phone - User's phone number
   * @param password - User's password
   * @param fullName - User's full name
   * @param role - User role ('user' or 'pt')
   * @returns SignupResponse with success message
   */
  signup: async (
    phone: string,
    password: string,
    fullName: string,
    role: 'user' | 'pt' = 'user'
  ): Promise<SignupResponse> => {
    const requestData: SignupRequest = {
      phone: formatPhoneToInternational(phone),
      password,
      fullName,
      role,
    };

    const response = await axiosPublic.post<SignupResponse>('/auths/signup', requestData);
    return response.data;
  },

  /**
   * Verify OTP code after signup
   * @param phone - User's phone number
   * @param code - 6-digit OTP code
   * @returns VerifyOtpResponse with user data and tokens
   */
  verifyOtp: async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const requestData: VerifyOtpRequest = {
      phone: formatPhoneToInternational(phone),
      code,
    };

    const response = await axiosPublic.post<VerifyOtpResponse>('/auths/verify', requestData);

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
   * Send OTP for forgot password
   * @param phone - User's phone number
   * @returns ForgotPasswordResponse with success message
   */
  forgotPasswordSendOtp: async (phone: string): Promise<ForgotPasswordResponse> => {
    const response = await axiosPublic.post<ForgotPasswordResponse>(
      '/auths/forgot-password/sent-opt',
      { phone: formatPhoneToInternational(phone) }
    );
    return response.data;
  },

  /**
   * Verify OTP for forgot password
   * @param phone - User's phone number
   * @param code - 6-digit OTP code
   * @returns ForgotPasswordVerifyOtpResponse with success message
   */
  forgotPasswordVerifyOtp: async (
    phone: string,
    code: string
  ): Promise<ForgotPasswordVerifyOtpResponse> => {
    const response = await axiosPublic.post<ForgotPasswordVerifyOtpResponse>(
      '/auths/forgot-password/verify',
      {
        phone: formatPhoneToInternational(phone),
        code,
      }
    );
    return response.data;
  },

  /**
   * Reset password after OTP verification
   * @param phone - User's phone number
   * @param newPassword - New password
   * @returns ResetPasswordResponse with success message
   */
  resetPassword: async (phone: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const requestData: ResetPasswordRequest = {
      phone: formatPhoneToInternational(phone),
      plainPassword: newPassword,
    };

    const response = await axiosPublic.post<ResetPasswordResponse>(
      '/users/reset-password',
      requestData
    );
    return response.data;
  },

  /**
   * Logout and clear all stored data
   */
  logout: async (): Promise<void> => {
    await clearUserData();
  },
};
