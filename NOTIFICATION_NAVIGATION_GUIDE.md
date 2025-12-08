# Hướng dẫn tích hợp Navigation cho Notifications

## Tổng quan
Tài liệu này hướng dẫn cách tích hợp điều hướng khi người dùng nhấn vào notification để chuyển đến màn hình liên quan.

## Các bước thực hiện

### 1. Thêm màn hình vào RootStackParamList

Mở file `src/navigation/types.ts` và thêm các màn hình mới:

```typescript
export type RootStackParamList = {
  // ... existing screens
  BookingDetail: { id: string };
  ClassDetail: { id: string };
  // ... other screens
};
```

### 2. Cập nhật hàm handleNavigation trong NotificationsScreen

Trong file `src/screens/NotificationsScreen.tsx`, cập nhật hàm `handleNavigation`:

```typescript
const handleNavigation = (notification: Notification) => {
  if (!notification.referenceType || !notification.referenceId) {
    return;
  }

  switch (notification.referenceType) {
    case 'BOOKING':
      // Điều hướng đến màn hình chi tiết booking
      navigation.navigate('BookingDetail', { id: notification.referenceId });
      break;

    case 'CLASS':
      // Điều hướng đến màn hình chi tiết lớp học
      navigation.navigate('ClassDetail', { id: notification.referenceId });
      break;

    case 'MEMBERSHIP':
      // Quay lại và chuyển đến tab Membership
      navigation.goBack();
      // Nếu đang ở User tabs:
      // navigation.navigate('UserTabs', { screen: 'MembershipTab' });
      // Nếu đang ở PT tabs:
      // navigation.navigate('PTTabs', { screen: 'MembershipTab' });
      break;

    case 'SYSTEM':
      // Không cần điều hướng, chỉ đóng modal
      navigation.goBack();
      break;

    default:
      console.log('Unknown reference type:', notification.referenceType);
  }
};
```

### 3. Thêm màn hình vào AppNavigator

Trong file `src/navigation/AppNavigator.tsx`, thêm các màn hình mới:

```typescript
import BookingDetailScreen from '../screens/BookingDetailScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';

// Trong Stack.Navigator
<Stack.Screen
  name="BookingDetail"
  component={BookingDetailScreen}
  options={{ title: 'Chi tiết đặt lịch' }}
/>
<Stack.Screen
  name="ClassDetail"
  component={ClassDetailScreen}
  options={{ title: 'Chi tiết lớp học' }}
/>
```

### 4. Tạo các màn hình chi tiết

#### BookingDetailScreen.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type BookingDetailRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

export default function BookingDetailScreen() {
  const route = useRoute<BookingDetailRouteProp>();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch booking details using the id
    loadBookingDetails(id);
  }, [id]);

  const loadBookingDetails = async (bookingId: string) => {
    try {
      // Call your API to get booking details
      // const response = await bookingService.getBookingById(bookingId);
      // setBooking(response.data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      <Text>Booking Detail - ID: {id}</Text>
      {/* Hiển thị thông tin booking */}
    </View>
  );
}
```

#### ClassDetailScreen.tsx

Tương tự như BookingDetailScreen.

## Các loại notification và điều hướng

| Notification Type | Reference Type | Điều hướng đến |
|------------------|----------------|----------------|
| USER_UPCOMING_BOOKING | BOOKING | BookingDetailScreen |
| USER_BOOKING_CONFIRMED | BOOKING | BookingDetailScreen |
| USER_BOOKING_CANCELLED | BOOKING | BookingDetailScreen |
| USER_CLASS_REMINDER | CLASS | ClassDetailScreen |
| PT_NEW_BOOKING | BOOKING | BookingDetailScreen |
| PT_BOOKING_CANCELLED | BOOKING | BookingDetailScreen |
| MEMBERSHIP_EXPIRING | MEMBERSHIP | MembershipTabScreen |
| MEMBERSHIP_EXPIRED | MEMBERSHIP | MembershipTabScreen |

## Testing

Để test navigation:
1. Login vào app
2. Tạo một notification test từ backend
3. Nhấn vào notification
4. Kiểm tra xem có điều hướng đúng màn hình không

## Notes

- Đảm bảo tất cả các màn hình đã được đăng ký trong navigator
- Xử lý trường hợp notification không có referenceId
- Thêm error handling khi navigation fails
- Có thể cần permission để điều hướng giữa các tab navigators
