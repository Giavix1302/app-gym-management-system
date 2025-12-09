import axiosInstance from '../config/axios';

// ==================== Types ====================
export interface AttendanceLocation {
  _id: string;
  name: string;
  address: {
    street: string;
    ward: string;
    province: string;
  };
}

export interface Attendance {
  _id: string;
  userId: string;
  locationId: string;
  checkinTime: string;
  checkoutTime: string;
  hours: number;
  method: string;
  location: AttendanceLocation;
}

export interface AttendancePagination {
  currentPage: number;
  totalPages: number;
  totalAttendances: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AttendanceListResponse {
  success: boolean;
  message: string;
  attendances: Attendance[];
  pagination: AttendancePagination;
  user: {
    _id: string;
    fullName: string;
    phone: string;
  };
}

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// ==================== Attendance Service ====================
export const attendanceService = {
  /**
   * Get paginated list of user attendances
   * @param userId - User ID
   * @param params - Query parameters (page, limit, startDate, endDate)
   * @returns Attendance list with pagination
   */
  getListAttendanceByUserId: async (
    userId: string,
    params: AttendanceListParams = {}
  ): Promise<AttendanceListResponse> => {
    console.log('🚀 ~ getListAttendanceByUserIdAPI ~ params:', params);
    const response = await axiosInstance.get<AttendanceListResponse>(
      `/attendances/list/${userId}`,
      {
        params: params,
      }
    );
    console.log('🚀 ~ getListAttendanceByUserIdAPI ~ response:', response.data);
    return response.data;
  },
};

// ==================== Export Individual APIs (for backward compatibility) ====================
export const getListAttendanceByUserIdAPI = attendanceService.getListAttendanceByUserId;
