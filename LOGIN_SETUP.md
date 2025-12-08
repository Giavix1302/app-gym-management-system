# 🔐 Hướng Dẫn Hệ Thống Đăng Nhập THE GYM

## 📋 Tổng Quan

Đã tạo hoàn chỉnh hệ thống authentication cho ứng dụng THE GYM với:

- Đăng nhập cho User và PT (Personal Trainer)
- Đăng ký tài khoản
- Quên mật khẩu
- Trang chủ riêng cho User và PT
- Tự động refresh token
- Lưu trữ dữ liệu an toàn

## 📁 Cấu Trúc Files Mới

```
src/
├── types/
│   └── api.ts                      # TypeScript types cho API
├── services/
│   └── authService.ts              # Service xử lý authentication
├── screens/
│   ├── LoginScreen.tsx             # Màn hình đăng nhập
│   ├── SignupScreen.tsx            # Màn hình đăng ký
│   ├── ForgotPasswordScreen.tsx    # Màn hình quên mật khẩu
│   ├── UserHomeScreen.tsx          # Trang chủ User
│   └── PTHomeScreen.tsx            # Trang chủ PT (Personal Trainer)
├── navigation/
│   ├── types.ts                    # (Đã cập nhật) Navigation types
│   └── AppNavigator.tsx            # (Đã cập nhật) Navigation config
└── utils/
    └── storage.ts                  # (Đã cập nhật) Storage utilities
```

## 🔄 Luồng Hoạt Động

### 1. Đăng Nhập (Login Flow)

```typescript
// User nhập số điện thoại & mật khẩu
POST https://gym.sitedemo.io.vn/v1/auths/login
{
  "phone": "0123456789",
  "password": "password123"
}

// Response
{
  "user": { ... },
  "trainer": { ... },      // Chỉ có nếu role là PT
  "myMembership": { ... }, // Membership info (hoặc empty)
  "accessToken": "...",
  "refreshToken": "..."
}

// Lưu trữ
- user → AsyncStorage
- trainer (nếu có) → AsyncStorage
- myMembership → AsyncStorage (hoặc empty object)
- accessToken → AsyncStorage
- refreshToken → SecureStore (BẢO MẬT)

// Navigation
- Nếu role = 'pt' → PTHome
- Nếu role = 'user' → UserHome
```

### 2. Auto Refresh Token

Khi access token hết hạn (401):

1. Tự động gọi `/auths/refresh` với refreshToken
2. Lưu tokens mới
3. Retry request ban đầu
4. Người dùng không cần làm gì

### 3. Logout

```typescript
await authService.logout();
// Xóa tất cả:
// - user
// - trainer
// - myMembership
// - accessToken
// - refreshToken
// Navigate về Login
```

## 📦 Data Types

### User Object

```typescript
interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'user' | 'pt';
  isActived: boolean;
  gender: string;
  address: string;
  avatar: string;
  myMembership?: Membership;
  createdAt: string;
  updatedAt: string;
}
```

### Trainer Object (chỉ có khi role = 'pt')

```typescript
interface Trainer {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'pt';
  height: number;
  weight: number;
  achievements: string;
  experience: number;
  certification: string;
  specialty: string;
  myMembership?: Membership;
  // ... các field giống User
}
```

### Membership Object

```typescript
interface Membership {
  remainingSessions: number;
  startDate: string;
  endDate: string;
  status: string;
  name: string;
  durationMonth: number;
  bannerURL: string;
  totalCheckin: number;
}

// Nếu không có membership, sẽ lưu:
const EMPTY_MEMBERSHIP = {
  remainingSessions: 0,
  startDate: '',
  endDate: '',
  status: '',
  name: '',
  durationMonth: 0,
  bannerURL: '',
  totalCheckin: 0,
};
```

## 🎨 UI Components

### LoginScreen

- **Input**: Số điện thoại, Mật khẩu
- **Buttons**: Đăng nhập, Quên mật khẩu, Đăng ký
- **Validation**: Kiểm tra input trước khi gọi API
- **Loading state**: Disable inputs khi đang loading

### UserHomeScreen

- Hiển thị thông tin user
- Card membership (nếu có)
- Số buổi còn lại, tổng checkin
- Ngày bắt đầu/kết thúc
- Button đăng xuất

### PTHomeScreen

- Hiển thị thông tin PT
- Card membership (PT cũng có membership)
- Thông tin nghề nghiệp:
  - Chuyên môn (specialty)
  - Kinh nghiệm (experience)
  - Chứng chỉ (certification)
  - Thành tích (achievements)
- Thông tin thể chất: Chiều cao, Cân nặng
- Button đăng xuất

### SignupScreen

- **Input**: Họ tên, Số điện thoại, Email, Mật khẩu, Xác nhận mật khẩu
- **Validation**:
  - Kiểm tra tất cả fields
  - Mật khẩu ít nhất 6 ký tự
  - Xác nhận mật khẩu khớp
- **TODO**: Cần implement API endpoint `/auth/register`

### ForgotPasswordScreen

- **Input**: Số điện thoại
- **TODO**: Cần implement API endpoint `/auth/forgot-password`

## 🔧 Cách Sử Dụng

### 1. Import Service

```typescript
import { authService } from '@/services/authService';
```

### 2. Login

```typescript
const handleLogin = async (phone: string, password: string) => {
  try {
    const response = await authService.login(phone, password);

    // Tự động lưu tất cả data vào storage
    // Tự động navigate dựa vào role

    if (response.user.role === 'pt') {
      navigation.navigate('PTHome');
    } else {
      navigation.navigate('UserHome');
    }
  } catch (error) {
    // Lỗi đã được xử lý bởi axios interceptor
    console.error('Login error:', error);
  }
};
```

### 3. Get User Data

```typescript
import { getUser, getTrainer, getMyMembership } from '@/utils/storage';

const userData = await getUser();
const trainerData = await getTrainer(); // null nếu không phải PT
const membership = await getMyMembership(); // EMPTY_MEMBERSHIP nếu không có
```

### 4. Logout

```typescript
import { authService } from '@/services/authService';

await authService.logout();
navigation.navigate('Login');
```

## ⚠️ Lưu Ý Quan Trọng

### 1. API Endpoint

```typescript
// File: src/services/authService.ts
// Endpoint hiện tại: '/auth/login'
// Có thể cần đổi thành: '/auths/login' hoặc endpoint khác
```

### 2. Storage Strategy

- **AccessToken**: AsyncStorage (nhanh, dễ truy cập)
- **RefreshToken**: SecureStore (BẢO MẬT, encrypted)
- **User/Trainer/Membership**: AsyncStorage (JSON stringify/parse)

### 3. Membership Logic

- Cả User và PT đều có thể có membership
- Nếu không có, lưu `EMPTY_MEMBERSHIP`
- Backend response có field `myMembership`

### 4. Navigation

```typescript
// Initial route: Login
// Auth screens: headerShown: false (không có header)
// Home screens: headerShown: false (custom header trong component)
```

## 🚀 Để Hoàn Thiện

### 1. Implement Signup API

```typescript
// File: src/services/authService.ts
// TODO: Thêm function register()
register: async (fullName, phone, email, password) => {
  const response = await axiosPublic.post('/auth/register', {
    fullName,
    phone,
    email,
    password,
  });
  return response.data;
};
```

### 2. Implement Forgot Password API

```typescript
// TODO: Thêm function forgotPassword()
forgotPassword: async (phone) => {
  const response = await axiosPublic.post('/auth/forgot-password', {
    phone,
  });
  return response.data;
};
```

### 3. Check Authentication on App Start

```typescript
// File: src/navigation/AppNavigator.tsx
// TODO: Thêm logic kiểm tra token khi app khởi động
const [isLoading, setIsLoading] = useState(true);
const [initialRoute, setInitialRoute] = useState('Login');

useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  const token = await getAccessToken();
  const user = await getUser();

  if (token && user) {
    setInitialRoute(user.role === 'pt' ? 'PTHome' : 'UserHome');
  }

  setIsLoading(false);
};
```

### 4. Thêm Avatar Upload

```typescript
// TODO: Implement upload avatar
// Sử dụng ImagePicker từ expo-image-picker
// POST /users/avatar với multipart/form-data
```

### 5. Profile Edit

```typescript
// TODO: Tạo màn hình edit profile
// PUT /users/profile
```

## 🐛 Troubleshooting

### TypeScript Error với Navigation

Nếu gặp lỗi TypeScript với `initialRouteName`, thử:

```bash
# Clear cache
rm -rf node_modules/.cache
npx expo start --clear
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npx expo start --reset-cache
```

### API Connection Issues

Kiểm tra `.env`:

```env
API_URL=https://gym.sitedemo.io.vn
```

## 📞 API Endpoints Summary

```
Base URL: https://gym.sitedemo.io.vn/api/v1

Authentication:
POST   /auth/login           - Đăng nhập
POST   /auth/register        - Đăng ký (TODO)
POST   /auth/forgot-password - Quên mật khẩu (TODO)
POST   /auths/refresh        - Refresh token (tự động)

User:
GET    /users/profile        - Lấy thông tin user
PUT    /users/profile        - Cập nhật profile (TODO)
POST   /users/avatar         - Upload avatar (TODO)
```

---

**Chúc bạn code vui vẻ! 🚀**
