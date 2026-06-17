import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from 'react-native';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  card: '#FFFFFF',
  secondaryCard: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PILL_WIDTH = (SCREEN_WIDTH - 40) / 2;

interface ProfileToggleProps {
  activeTab: 'profile' | 'family';
  onTabChange: (tab: 'profile' | 'family') => void;
}

export const ProfileToggle: React.FC<ProfileToggleProps> = ({ activeTab, onTabChange }) => {
  const pillAnim = useRef(new Animated.Value(activeTab === 'profile' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(pillAnim, {
      toValue: activeTab === 'profile' ? 0 : 1,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const translateX = pillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PILL_WIDTH],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.activePill,
          {
            width: PILL_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('profile')}
        style={styles.toggleButton}
      >
        <Text
          style={[
            styles.toggleText,
            activeTab === 'profile' && styles.activeToggleText,
          ]}
        >
          My Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('family')}
        style={styles.toggleButton}
      >
        <Text
          style={[
            styles.toggleText,
            activeTab === 'family' && styles.activeToggleText,
          ]}
        >
          My Family
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondaryCard,
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    backgroundColor: 'transparent',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
});

export default ProfileToggle;