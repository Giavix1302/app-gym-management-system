# 📡 Hướng Dẫn Sử Dụng Axios Config

## 📁 Cấu Trúc Files

```
src/
├── config/
│   └── axios.ts              # Axios configuration
├── utils/
│   └── storage.ts            # Storage utilities
├── types/
│   └── env.d.ts              # TypeScript env declarations
└── context/
    └── NotificationContext.tsx # Notification system
```

## 🚀 Cài Đặt

Các packages đã được cài đặt:
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Lưu access token
- `expo-secure-store` - Lưu refresh token (bảo mật)
- `react-native-dotenv` - Environment variables

## ⚙️ Cấu Hình

### 1. File `.env`

```env
API_URL=http://localhost:3000/v1
```

**Lưu ý:**
- Trên Android Emulator: dùng `http://10.0.2.2:3000/v1`
- Trên iOS Simulator: dùng `http://localhost:3000/v1`
- Trên thiết bị thật: dùng IP máy tính (VD: `http://192.168.1.100:3000/v1`)

### 2. Restart Metro Bundler

Sau khi thay đổi `.env`, cần restart:

```bash
npm start -- --reset-cache
```

## 📚 Cách Sử Dụng

### 1. Import Axios Instance

```typescript
import axiosInstance, { axiosPublic } from '@/config/axios';
// hoặc
import axiosInstance, { axiosPublic } from '../config/axios';
```

### 2. Request Không Cần Authentication

Dùng `axiosPublic` cho login, register, forgot password, etc.

```typescript
// Login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await axiosPublic.post('/auths/login', {
      email,
      password,
    });

    const { accessToken, refreshToken, user } = response.data;

    // Lưu tokens
    await saveTokens(accessToken, refreshToken);

    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 3. Request Cần Authentication

Dùng `axiosInstance` - access token tự động được gắn vào header.

```typescript
// Get user profile
const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile failed:', error);
    throw error;
  }
};

// Update profile
const updateProfile = async (data: any) => {
  try {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
};
```

### 4. Logout

```typescript
import { clearTokens } from '@/utils/storage';

const handleLogout = async () => {
  try {
    // Optional: Call logout API
    await axiosInstance.post('/auths/logout');

    // Clear tokens
    await clearTokens();

    // Navigate to login screen
    // navigation.navigate('Login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

## 🔄 Auto Refresh Token

Axios đã được config để tự động refresh token khi:
- Access token hết hạn (401)
- Retry request ban đầu với token mới

```typescript
// Bạn không cần làm gì cả!
// Axios tự động xử lý refresh token
const data = await axiosInstance.get('/users/profile');
```

**Luồng hoạt động:**
1. Request với access token cũ
2. Server trả về 401 (token hết hạn)
3. Axios tự động gọi `/auths/refresh` với refresh token
4. Lưu access token & refresh token mới
5. Retry request ban đầu với token mới
6. Trả về kết quả cho bạn

## 🛠️ Utility Functions

### Storage Functions

```typescript
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  saveToAsyncStorage,
  getFromAsyncStorage,
  removeFromAsyncStorage,
} from '@/utils/storage';

// Lưu tokens (được gọi sau khi login thành công)
await saveTokens(accessToken, refreshToken);

// Lấy tokens
const accessToken = await getAccessToken();
const refreshToken = await getRefreshToken();

// Xóa tokens (khi logout)
await clearTokens();

// Lưu data khác vào AsyncStorage
await saveToAsyncStorage('user_id', '123');
const userId = await getFromAsyncStorage('user_id');
await removeFromAsyncStorage('user_id');
```

## 🎯 Ví Dụ Hoàn Chỉnh

### Service Example

```typescript
// src/services/authService.ts
import { axiosPublic } from '@/config/axios';
import { saveTokens, clearTokens } from '@/utils/storage';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosPublic.post('/auths/login', {
      email,
      password,
    });

    const { accessToken, refreshToken, user } = response.data;
    await saveTokens(accessToken, refreshToken);

    return user;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await axiosPublic.post('/auths/register', {
      email,
      password,
      name,
    });

    return response.data;
  },

  logout: async () => {
    await clearTokens();
  },
};
```

```typescript
// src/services/userService.ts
import axiosInstance from '@/config/axios';

export const userService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: any) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
```

### Component Example

```typescript
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useNotification } from '@/context/NotificationContext';
import { authService } from '@/services/authService';
import PrimaryButton from '@/components/PrimaryButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const user = await authService.login(email, password);

      notification.success('Đăng nhập thành công!');

      // Navigate to home
      // navigation.navigate('Home');
    } catch (error: any) {
      // Lỗi đã được xử lý bởi axios interceptor
      // Notification đã được hiển thị
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton
        title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

## 🔧 Tích Hợp Notification

Để hiển thị lỗi tự động, uncomment các dòng trong `src/config/axios.ts`:

```typescript
// Trong handleApiError function
import { notificationService } from '@/services/notificationService';

switch (status) {
  case 400:
    notificationService.error(errorMessage);
    break;
  // ...
}
```

Tạo notification service:

```typescript
// src/services/notificationService.ts
let notificationContext: any = null;

export const notificationService = {
  setContext: (context: any) => {
    notificationContext = context;
  },

  success: (message: string) => {
    notificationContext?.success(message);
  },

  error: (message: string) => {
    notificationContext?.error(message);
  },

  warning: (message: string) => {
    notificationContext?.warning(message);
  },

  info: (message: string) => {
    notificationContext?.info(message);
  },
};
```

Trong AppNavigator:

```typescript
import { useNotification } from '@/context/NotificationContext';
import { notificationService } from '@/services/notificationService';

export default function AppNavigator() {
  const notification = useNotification();

  React.useEffect(() => {
    notificationService.setContext(notification);
  }, [notification]);

  // ...
}
```

## 🐛 Debugging

### Check Access Token

```typescript
import { getAccessToken } from '@/utils/storage';

const token = await getAccessToken();
console.log('Access Token:', token);
```

### Check API URL

```typescript
import { API_URL } from '@env';
console.log('API URL:', API_URL);
```

### Monitor Network Requests

Mở React Native Debugger hoặc Flipper để xem network requests.

## 📝 Notes

- **Access Token** lưu trong AsyncStorage (nhanh, dễ truy cập)
- **Refresh Token** lưu trong SecureStore (bảo mật, encrypted)
- Axios tự động refresh token khi access token hết hạn
- Error handling tự động, tích hợp với notification system

## 🚨 Troubleshooting

### 1. "Unable to resolve module @env"

Restart Metro Bundler:
```bash
npm start -- --reset-cache
```

### 2. "Network Error" trên Android

Sử dụng `http://10.0.2.2:3000/v1` thay vì `localhost`

### 3. CORS Error

Backend cần enable CORS cho mobile app.

---

**Happy Coding! 🚀**
