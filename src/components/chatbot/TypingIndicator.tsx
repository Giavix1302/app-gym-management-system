import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createAnimation(dot1, 0);
    const animation2 = createAnimation(dot2, 150);
    const animation3 = createAnimation(dot3, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View className="mb-3 flex-row items-center">
      {/* Bot Icon */}
      <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
        <FontAwesome5 name="robot" size={16} color="white" />
      </View>

      {/* Typing Bubble */}
      <View className="rounded-2xl rounded-tl-sm bg-gray-100 px-5 py-3">
        <View className="flex-row items-center gap-1">
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#9CA3AF',
              transform: [{ translateY: dot1 }],
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#9CA3AF',
              transform: [{ translateY: dot2 }],
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#9CA3AF',
              transform: [{ translateY: dot3 }],
            }}
          />
        </View>
      </View>
    </View>
  );
}
