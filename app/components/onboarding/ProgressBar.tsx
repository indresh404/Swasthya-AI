// components/onboarding/ProgressBar.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS } from '@/theme';

interface ProgressBarProps {
  progress: number; // between 0 and 1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { width: widthInterpolate }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#0474FC',
    borderRadius: 3,
  },
});
