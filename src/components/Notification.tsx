import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  title: string;
  duration?: number;
  onHide?: () => void;
}

const getNotificationConfig = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-success',
        icon: '✓',
        borderColor: 'border-success',
      };
    case 'error':
      return {
        bgColor: 'bg-error',
        icon: '✕',
        borderColor: 'border-error',
      };
    case 'warning':
      return {
        bgColor: 'bg-warning',
        icon: '⚠',
        borderColor: 'border-warning',
      };
    case 'info':
      return {
        bgColor: 'bg-info',
        icon: 'ℹ',
        borderColor: 'border-info',
      };
  }
};

export default function Notification({
  type,
  title,
  duration = 3000,
  onHide,
}: NotificationProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const config = getNotificationConfig(type);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      className="absolute top-12 left-4 right-4 z-50"
    >
      <View
        className={`${config.bgColor} rounded-lg shadow-lg border-l-4 ${config.borderColor} p-4 flex-row items-center`}
      >
        <View className="mr-3">
          <Text className="text-white text-xl font-bold">{config.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">{title}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
