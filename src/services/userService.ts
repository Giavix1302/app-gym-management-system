import axiosInstance from '../config/axios';

// ==================== Types ====================
export interface UserDetail {
  _id: string;
  phone: string;
  fullName: string;
  role: 'user' | 'pt' | 'admin';
  status: 'active' | 'inactive';
  email: string;
  avatar: string;
  age: number | null;
  dateOfBirth: string;
  address: string;
  gender: 'male' | 'female' | 'other' | null;
  qrCode: string;
  createdAt: number;
  updatedAt: number;
  _destroy: boolean;
}

export interface UpdateUserInfoPayload {
  fullName?: string;
  email?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string; // ISO format
  age?: number;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: UserDetail;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPlainPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ==================== User Service ====================
export const userService = {
  /**
   * Get user detail by ID
   * @param userId - User ID
   * @returns User detail data
   */
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    console.log('🚀 ~ getUserDetailAPI ~ userId:', userId);
    const response = await axiosInstance.get<UserDetail>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user information (không bao gồm số điện thoại)
   * @param userId - User ID
   * @param payload - Update payload
   * @returns Updated user data
   */
  updateUserInfo: async (
    userId: string,
    payload: UpdateUserInfoPayload
  ): Promise<UpdateUserResponse> => {
    console.log('🚀 ~ updateInfoUserAPI ~ payload:', payload);
    const response = await axiosInstance.put<UpdateUserResponse>(
      `/users/${userId}`,
      payload
    );
    return response.data;
  },

  /**
   * Update user avatar
   * @param userId - User ID
   * @param imageUri - Local image URI from ImagePicker
   * @returns Updated user data with new avatar URL
   */
  updateAvatar: async (userId: string, imageUri: string): Promise<UpdateUserResponse> => {
    console.log('🚀 ~ updateAvatarAPI ~ imageUri:', imageUri);

    // Create FormData for file upload
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file to FormData
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await axiosInstance.put<UpdateUserResponse>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Change user password
   * @param userId - User ID
   * @param oldPassword - Current password
   * @param newPlainPassword - New password
   * @returns Success response
   */
  changePassword: async (
    userId: string,
    oldPassword: string,
    newPlainPassword: string
  ): Promise<ChangePasswordResponse> => {
    console.log('🚀 ~ changePasswordAPI ~ userId:', userId);
    const response = await axiosInstance.put<ChangePasswordResponse>(
      `/users/${userId}/change-password`,
      {
        oldPassword,
        newPlainPassword,
      }
    );
    return response.data;
  },
};

// ==================== Export Individual APIs (for backward compatibility) ====================
export const getUserDetailAPI = userService.getUserDetail;
export const updateInfoUserAPI = userService.updateUserInfo;
export const updateAvatarAPI = userService.updateAvatar;
export const changePasswordAPI = userService.changePassword;
