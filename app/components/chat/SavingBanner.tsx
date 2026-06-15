// components/chat/SavingBanner.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

interface SavingBannerProps {
  status: 'idle' | 'analyzing' | 'saving';
}

export const SavingBanner: React.FC<SavingBannerProps> = ({ status }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start offscreen

  useEffect(() => {
    if (status !== 'idle') {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  if (status === 'idle') return null;

  const getStatusDetails = () => {
    switch (status) {
      case 'analyzing':
        return {
          icon: '🧠',
          text: 'Analyzing health information...',
          color: '#3B82F6',
        };
      case 'saving':
        return {
          icon: '💾',
          text: 'Saving medical information...',
          color: '#10B981',
        };
      default:
        return { icon: '', text: '', color: '#3B82F6' };
    }
  };

  const details = getStatusDetails();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.content, { borderColor: details.color }]}>
        {status === 'analyzing' ? (
          <ActivityIndicator size="small" color={details.color} />
        ) : (
          <Text style={styles.icon}>{details.icon}</Text>
        )}
        <Text style={styles.text}>{details.text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    borderWidth: 1,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
