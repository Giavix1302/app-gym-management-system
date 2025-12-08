# 🐛 Debug Login Error 401

## 🔍 Nguyên Nhân Lỗi 401 Unauthorized

Lỗi **401** có nghĩa là **xác thực thất bại**. Có thể do:

### 1. **API URL Sai**
```env
# File: .env
# ❌ SAI - Thiếu /v1
API_URL=https://gym.sitedemo.io.vn

# ✅ ĐÚNG
API_URL=https://gym.sitedemo.io.vn/v1
```

### 2. **Endpoint Sai**
```typescript
// File: src/services/authService.ts
// ❌ SAI
await axiosPublic.post('/auth/login', requestData);

// ✅ ĐÚNG
await axiosPublic.post('/auths/login', requestData);
```

### 3. **Request Body Sai Format**
Backend có thể yêu cầu format khác, ví dụ:
```typescript
// Có thể backend muốn:
{
  "username": "0123456789",  // thay vì "phone"
  "password": "password123"
}
```

### 4. **Số Điện Thoại/Mật Khẩu Sai**
- Kiểm tra xem số điện thoại và mật khẩu có đúng không
- Thử tài khoản test từ backend

## 🛠️ Cách Debug

### Bước 1: Kiểm tra URL đang gọi

Thêm log vào `src/services/authService.ts`:

```typescript
login: async (phone: string, password: string): Promise<LoginResponse> => {
  const requestData: LoginRequest = {
    phone,
    password,
  };

  // 👇 THÊM LOG NÀY
  console.log('🔐 Login Request:');
  console.log('   URL:', axiosPublic.defaults.baseURL + '/auths/login');
  console.log('   Body:', requestData);

  const response = await axiosPublic.post<LoginResponse>('/auths/login', requestData);

  // 👇 THÊM LOG NÀY
  console.log('✅ Login Success:', response.data);

  // ... rest of code
}
```

### Bước 2: Kiểm tra Response Error

Thêm log vào `src/config/axios.ts`:

```typescript
// Trong handleApiError function
const handleApiError = (error: AxiosError) => {
  const status = error.response?.status || 0;
  const errorData = error.response?.data as { message?: string };

  // 👇 THÊM LOG CHI TIẾT
  console.log('❌ API Error Details:');
  console.log('   Status:', status);
  console.log('   URL:', error.config?.url);
  console.log('   Method:', error.config?.method);
  console.log('   Request Data:', error.config?.data);
  console.log('   Response:', errorData);

  // ... rest of code
}
```

### Bước 3: Test với cURL

Thử gọi API trực tiếp bằng cURL hoặc Postman:

```bash
curl -X POST https://gym.sitedemo.io.vn/v1/auths/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0123456789",
    "password": "password123"
  }'
```

Nếu cURL thành công nhưng app lỗi → Vấn đề ở config app
Nếu cURL cũng lỗi 401 → Vấn đề ở credentials

## ✅ Đã Fix

1. ✅ Cập nhật `.env`:
   ```env
   API_URL=https://gym.sitedemo.io.vn/v1
   ```

2. ✅ Cập nhật endpoint trong `authService.ts`:
   ```typescript
   await axiosPublic.post('/auths/login', requestData);
   ```

3. ✅ Thêm case 401 vào error handler:
   ```typescript
   case 401:
     console.error('Unauthorized:', errorMessage || 'Số điện thoại hoặc mật khẩu không đúng');
     break;
   ```

## 🚀 Sau Khi Fix

### 1. Restart Metro Bundler
```bash
# Đã chạy tự động
npx expo start --reset-cache
```

### 2. Test Lại Login

Với thông tin đúng, bạn sẽ thấy:

```
Console Output:
🔐 Login Request:
   URL: https://gym.sitedemo.io.vn/v1/auths/login
   Body: { phone: "0123456789", password: "password123" }
✅ Login Success: { user: {...}, accessToken: "...", ... }
```

### 3. Kiểm tra Console Log

Mở React Native Debugger hoặc terminal, tìm:
- `🔐 Login Request:` - Xem URL có đúng không
- `❌ API Error Details:` - Nếu lỗi, xem chi tiết

## 📝 Checklist Khi Gặp 401

- [ ] API_URL trong `.env` đã đúng: `https://gym.sitedemo.io.vn/v1`
- [ ] Endpoint đã đúng: `/auths/login` (không phải `/auth/login`)
- [ ] Đã restart Metro: `npx expo start --reset-cache`
- [ ] Số điện thoại và mật khẩu đúng
- [ ] Request body format đúng theo API docs

## 🔗 API Endpoint Đầy Đủ

```
Full URL: https://gym.sitedemo.io.vn/v1/auths/login

Request:
POST /auths/login
Content-Type: application/json

Body:
{
  "phone": "0123456789",
  "password": "password123"
}

Response (Success - 200):
{
  "user": { ... },
  "trainer": { ... },      // nếu role = 'pt'
  "myMembership": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}

Response (Error - 401):
{
  "message": "Invalid credentials" // hoặc message khác
}
```

## 💡 Tips

1. **Kiểm tra Network Tab**
   - Mở React Native Debugger
   - Vào Network tab
   - Xem request đang gọi đến URL nào

2. **Log Everything**
   - Thêm `console.log` để debug
   - Xem request body, headers, response

3. **Test Backend Trước**
   - Dùng Postman/cURL test API
   - Đảm bảo backend hoạt động đúng

4. **Kiểm tra CORS**
   - Nếu web app, có thể bị CORS
   - React Native không bị CORS

---

**Nếu vẫn lỗi 401 sau khi fix, hãy:**
1. Check console logs
2. Kiểm tra lại credentials
3. Liên hệ backend team để verify API endpoint
