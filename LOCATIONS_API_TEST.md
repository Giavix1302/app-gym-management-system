# 📍 Test Locations API

## ✅ Đã Hoàn Thành

### 1. **Cập nhật axios config**
- Gắn cứng API URL: `http://172.17.96.1:3000/v1`
- Không sử dụng `.env` nữa
- File: [src/config/axios.ts](src/config/axios.ts)

### 2. **Tạo Types cho Locations**
- `Address` interface
- `Location` interface
- `LocationsResponse` interface
- File: [src/types/api.ts](src/types/api.ts)

### 3. **Tạo Location Service**
- `getLocations()` - Lấy danh sách locations
- File: [src/services/locationService.ts](src/services/locationService.ts)

### 4. **Tạo Test Screen**
- LocationsTestScreen - Hiển thị danh sách locations
- Pull to refresh
- Image gallery cho mỗi location
- File: [src/screens/LocationsTestScreen.tsx](src/screens/LocationsTestScreen.tsx)

### 5. **Cập nhật Navigation**
- Thêm route `LocationsTest`
- Thêm button test vào LoginScreen
- Files:
  - [src/navigation/types.ts](src/navigation/types.ts)
  - [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx)
  - [src/screens/LoginScreen.tsx](src/screens/LoginScreen.tsx)

## 🎯 API Endpoint

```
GET http://172.17.96.1:3000/v1/locations

Response:
{
  "success": true,
  "message": "Locations retrieved successfully",
  "locations": [
    {
      "_id": "68b80223c88e5c2130e084e8",
      "name": "The GYM Lê Hồng Phong",
      "phone": "+84987650001",
      "address": {
        "street": "123 Lê Hồng Phong",
        "ward": "An Đông",
        "province": "Hồ Chí Minh"
      },
      "images": [
        "https://res.cloudinary.com/...",
        "https://res.cloudinary.com/..."
      ]
    }
  ]
}
```

## 🧪 Cách Test

### Option 1: Từ Login Screen
1. Mở app
2. Click button **"🧪 Test Locations API"** ở màn hình Login
3. Xem danh sách locations

### Option 2: Direct Navigation
```typescript
navigation.navigate('LocationsTest');
```

## 📱 Features của Test Screen

1. **Loading State**
   - Hiển thị spinner khi đang tải

2. **Pull to Refresh**
   - Kéo xuống để reload data

3. **Location Cards**
   - Image gallery (scroll ngang)
   - Tên chi nhánh
   - Số điện thoại
   - Địa chỉ đầy đủ

4. **Error Handling**
   - Hiển thị notification nếu lỗi
   - Console log chi tiết

5. **Refresh Button**
   - Button "Tải lại" ở cuối danh sách

## 🔍 Console Logs

Khi chạy, bạn sẽ thấy:

```
👉 API_BASE_URL = http://172.17.96.1:3000/v1
📍 Fetching locations...
✅ Locations fetched: 1 items
```

Nếu lỗi:
```
🚀 ~ API Error Status: 404
🚀 ~ errorMessage: Not Found
❌ Not Found: Không tìm thấy tài nguyên
```

## 📦 Data Structure

### Location Interface
```typescript
interface Location {
  _id: string;
  name: string;
  phone: string;
  address: Address;
  images: string[];
}

interface Address {
  street: string;
  ward: string;
  province: string;
}
```

## 🛠️ Service Usage

```typescript
import { locationService } from '@/services/locationService';

// Get all locations
const fetchLocations = async () => {
  try {
    const response = await locationService.getLocations();
    console.log('Locations:', response.locations);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎨 UI Components

### Location Card Layout
```
┌─────────────────────────────────┐
│  [Image Gallery - Scroll →]    │
├─────────────────────────────────┤
│  📍 The GYM Lê Hồng Phong      │
│                                 │
│  📞 Điện thoại                  │
│  +84987650001                   │
│                                 │
│  📍 Địa chỉ                     │
│  123 Lê Hồng Phong, An Đông,   │
│  Hồ Chí Minh                    │
└─────────────────────────────────┘
```

## 📝 Notes

1. **API URL Hard Coded**
   - Không dùng `.env` nữa
   - URL gắn cứng trong `src/config/axios.ts`
   - Không cần restart Metro khi đổi URL

2. **Public API**
   - `/locations` là public endpoint
   - Không cần authentication
   - Sử dụng `axiosPublic` instance

3. **Image Loading**
   - Images load từ Cloudinary
   - Horizontal scroll cho gallery
   - `resizeMode="cover"` để fit image

4. **Refresh Strategy**
   - Pull to refresh: `RefreshControl`
   - Manual refresh: Button "Tải lại"
   - Auto fetch on mount

## 🐛 Troubleshooting

### Không tải được locations
```bash
# Kiểm tra API URL
console.log('API_BASE_URL =', API_BASE_URL);

# Kiểm tra network
curl http://172.17.96.1:3000/v1/locations

# Restart Metro
npx expo start --reset-cache
```

### Images không hiển thị
- Kiểm tra URL images có đúng không
- Kiểm tra internet connection
- Xem console log có lỗi CORS không

### Empty list
- Backend có trả data không?
- Check response format
- Xem console log

---

**Test thành công! 🚀**