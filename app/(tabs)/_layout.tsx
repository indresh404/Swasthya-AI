// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useSegments, Slot } from 'expo-router';
import { Dimensions, StyleSheet, TouchableOpacity, View, Text, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');
const FAB_SIZE = 62;

// Primary Color
const PRIMARY_COLOR = '#0474FC';

export default function TabLayout() {
  const segments = useSegments();
  
  // Animation values for each tab
  const tabScaleAnimations = useRef([
    new Animated.Value(1), // Home
    new Animated.Value(1), // Check-in
    new Animated.Value(1), // Meds
    new Animated.Value(1), // Profile
  ]).current;
  
  const tabGlowAnimations = useRef([
    new Animated.Value(0), // Home glow
    new Animated.Value(0), // Check-in glow
    new Animated.Value(0), // Meds glow
    new Animated.Value(0), // Profile glow
  ]).current;

  // Continuous subtle pulse for active tab
  useEffect(() => {
    const animations = tabs.map((_, index) => {
      if (getActiveTab() === index) {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(tabGlowAnimations[index], {
              toValue: 0.5,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(tabGlowAnimations[index], {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
      return null;
    });
    
    return () => {
      animations.forEach(anim => anim && anim.stop());
    };
  }, [segments]);

  const getActiveTab = () => {
    const currentRoute = segments[segments.length - 1];
    if (currentRoute === 'home') return 0;
    if (currentRoute === 'checkin') return 1;
    if (currentRoute === 'meds') return 2;
    if (currentRoute === 'profile') return 3;
    return 0;
  };

  const handleFabPress = () => {
    router.push('/(onboarding)/chat');
  };

  const handleTabPress = (route: string, index: number) => {
    // Smooth ripple effect on press
    Animated.parallel([
      Animated.timing(tabScaleAnimations[index], {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(tabGlowAnimations[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth return
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(tabScaleAnimations[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(tabGlowAnimations[index], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    router.push(route as any);
  };

  const activeTab = getActiveTab();
  
  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(tabs)/home' },
    { name: 'Check-in', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', route: '/(tabs)/checkin' },
    { name: 'Meds', icon: 'medkit-outline', activeIcon: 'medkit', route: '/(tabs)/meds' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/profile' },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2, 4);

  // Import Easing
  const Easing = require('react-native').Easing;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Slot />
      
      {/* Bottom Navigation Bar */}
      <View style={styles.navContainer}>
        <View style={styles.navbar}>
          <View style={styles.navContent}>
            {leftTabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              const glowIntensity = tabGlowAnimations[idx].interpolate({
                inputRange: [0, 0.5, 0.8, 1],
                outputRange: [0, 0.15, 0.25, 0],
              });
              
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnimations[idx] }] }}
                >
                  <TouchableOpacity
                    onPress={() => handleTabPress(tab.route, idx)}
                    activeOpacity={0.9}
                    style={styles.navItem}
                  >
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                      {
                        shadowColor: PRIMARY_COLOR,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: glowIntensity,
                        shadowRadius: 10,
                      }
                    ]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            <View style={styles.fabSpace} />

            {rightTabs.map((tab, idx) => {
              const isActive = activeTab === idx + 2;
              const tabIndex = idx + 2;
              const glowIntensity = tabGlowAnimations[tabIndex].interpolate({
                inputRange: [0, 0.5, 0.8, 1],
                outputRange: [0, 0.15, 0.25, 0],
              });
              
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnimations[tabIndex] }] }}
                >
                  <TouchableOpacity
                    onPress={() => handleTabPress(tab.route, tabIndex)}
                    activeOpacity={0.9}
                    style={styles.navItem}
                  >
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                      {
                        shadowColor: PRIMARY_COLOR,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: glowIntensity,
                        shadowRadius: 10,
                      }
                    ]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Floating Action Button - Clean & Simple */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFabPress}
          style={styles.fabOuter}
        >
          <View style={styles.fabButton}>
            <Ionicons name="chatbubble-ellipses" size={30} color={PRIMARY_COLOR} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  navbar: {
    width: '95%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 35,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'center',
  },
  navContent: {
    flexDirection: 'row',
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fabSpace: {
    width: FAB_SIZE - 12,
  },
  fabOuter: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    zIndex: 200,
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
});