import React, {useEffect, useRef} from 'react';
import {View, Text, Animated} from 'react-native';

interface Props {
  progress: number; // 0-100
  current: number;
  target: number;
}

export function ProgressBar({progress, current, target}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(progress, 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-400 text-sm">S/ {current.toLocaleString()}</Text>
        <Text className="text-accent font-bold text-sm">{Math.round(progress)}%</Text>
        <Text className="text-gray-400 text-sm">S/ {target.toLocaleString()}</Text>
      </View>
      <View className="h-3 bg-dark-border rounded-full overflow-hidden">
        <Animated.View
          style={{width}}
          className="h-full rounded-full bg-primary"
        />
      </View>
    </View>
  );
}
