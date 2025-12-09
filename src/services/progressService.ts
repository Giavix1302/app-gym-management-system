import axiosInstance from '../config/axios';

// ==================== Types ====================
export interface ProgressRecord {
  _id: string;
  userId: string;
  measurementDate: string; // ISO date string
  weight: number;
  bodyFat: number;
  muscleMass: number;
  note?: string;
}

export interface CreateProgressPayload {
  measurementDate: string;
  weight: string | number;
  bodyFat: string | number;
  muscleMass: string | number;
  note?: string;
  userId: string;
}

export interface UpdateProgressPayload {
  measurementDate?: string;
  weight?: string | number;
  bodyFat?: string | number;
  muscleMass?: string | number;
  note?: string;
}

export interface ProgressResponse {
  success: boolean;
  message: string;
  data: ProgressRecord | null;
}

export interface ProgressListResponse {
  success: boolean;
  data: ProgressRecord[];
  total: number;
}

export interface GetProgressOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

// ==================== Progress Service ====================
export const progressService = {
  /**
   * Create new progress record
   * @param data - Progress data
   * @returns Created progress record
   */
  createProgress: async (data: CreateProgressPayload): Promise<ProgressResponse> => {
    const response = await axiosInstance.post<ProgressResponse>('/progress', data);
    console.log('🚀 ~ createProgressAPI ~ response:', response);
    return response.data;
  },

  /**
   * Get all progress records by user ID
   * @param userId - User ID
   * @param options - Query options (sortBy, sortOrder, limit, skip)
   * @returns List of progress records
   */
  getAllProgressByUserId: async (
    userId: string,
    options: GetProgressOptions = {}
  ): Promise<ProgressListResponse> => {
    const { sortBy, sortOrder, limit, skip } = options;
    const params = new URLSearchParams();

    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());

    const queryString = params.toString();
    const url = queryString ? `/progress/${userId}?${queryString}` : `/progress/${userId}`;

    const response = await axiosInstance.get<ProgressListResponse>(url);
    console.log('🚀 ~ getAllProgressByUserIdAPI ~ response:', response);
    return response.data;
  },

  /**
   * Update progress record
   * @param progressId - Progress record ID
   * @param data - Update data
   * @returns Updated response
   */
  updateProgress: async (
    progressId: string,
    data: UpdateProgressPayload
  ): Promise<ProgressResponse> => {
    const response = await axiosInstance.put<ProgressResponse>(
      `/progress/${progressId}`,
      data
    );
    console.log('🚀 ~ updateProgressAPI ~ response:', response);
    return response.data;
  },

  /**
   * Delete progress record
   * @param progressId - Progress record ID
   * @returns Delete response
   */
  deleteProgress: async (progressId: string): Promise<ProgressResponse> => {
    console.log('🚀 ~ deleteProgressAPI ~ progressId:', progressId);
    const response = await axiosInstance.delete<ProgressResponse>(
      `/progress/${progressId}`
    );
    console.log('🚀 ~ deleteProgressAPI ~ response:', response);
    return response.data;
  },
};

// ==================== Export Individual APIs (for backward compatibility) ====================
export const createProgressAPI = progressService.createProgress;
export const getAllProgressByUserIdAPI = progressService.getAllProgressByUserId;
export const updateProgressAPI = progressService.updateProgress;
export const deleteProgressAPI = progressService.deleteProgress;
