import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/storage';

// API Base URL - Hard coded (không dùng .env)
const API_BASE_URL = 'https://gym.sitedemo.io.vn/v1';

console.log('👉 API_BASE_URL =', API_BASE_URL);

// ==================== Axios Public Instance ====================
// Dùng cho các request không cần authentication (login, register, etc.)
export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Axios Private Instance ====================
// Dùng cho các request cần authentication
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Request Interceptor ====================
// Tự động gắn access token vào mọi request
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==================== Response Interceptor ====================
// Xử lý refresh token tự động khi access token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status || 0;

    console.log('🚀 ~ API Error Status:', status);

    // Access token hết hạn -> refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh token (gửi refreshToken qua body)
        const response = await axiosPublic.post('/auths/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Lưu tokens mới
        await saveTokens(accessToken, newRefreshToken);

        // Retry request ban đầu với access token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> clear tokens và redirect về login
        await clearTokens();

        // TODO: Navigate to login screen
        // Bạn có thể dùng navigation hoặc emit event ở đây
        console.error('Session expired, please login again');

        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    handleApiError(error);

    return Promise.reject(error);
  }
);

// ==================== Error Handler ====================
// Hàm xử lý và hiển thị lỗi (tích hợp với notification system)
const handleApiError = (error: AxiosError) => {
  const status = error.response?.status || 0;
  const errorData = error.response?.data as { message?: string };
  const errorMessage = errorData?.message || error.message || 'Đã xảy ra lỗi hệ thống';

  console.log('🚀 ~ errorMessage:', errorMessage);

  // TODO: Tích hợp với notification system
  // import { useNotification } from '../context/NotificationContext';
  // const notification = useNotification();

  switch (status) {
    case 400:
      console.error('Bad Request:', errorMessage);
      // notification.error(errorMessage);
      break;
    case 401:
      console.error('Unauthorized:', errorMessage || 'Số điện thoại hoặc mật khẩu không đúng');
      // notification.error(errorMessage || 'Số điện thoại hoặc mật khẩu không đúng');
      break;
    case 403:
      console.error('Forbidden:', errorMessage || 'Bạn không có quyền truy cập');
      // notification.error(errorMessage || 'Bạn không có quyền truy cập (403)');
      break;
    case 404:
      console.error('Not Found:', errorMessage || 'Không tìm thấy tài nguyên');
      // notification.error(errorMessage || 'Không tìm thấy tài nguyên (404)');
      break;
    case 500:
      console.error('Server Error:', errorMessage || 'Lỗi server, vui lòng thử lại sau');
      // notification.error(errorMessage || 'Lỗi server, vui lòng thử lại sau (500)');
      break;
    default:
      console.error('Error:', errorMessage);
    // notification.error(errorMessage);
  }
};

// ==================== Export ====================
export default axiosInstance;
