// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Slot, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FAB_SIZE = 62;
const PRIMARY_COLOR = '#0474FC';
const PRIMARY_DARK = '#0360D0';

const TAB_CONFIG = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(tabs)/home' },
  { name: 'Check-in', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', route: '/(tabs)/checkin' },
  { name: 'Meds', icon: 'medkit-outline', activeIcon: 'medkit', route: '/(tabs)/meds' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/profile' },
] as const;

export default function TabLayout() {
  const segments = useSegments();
  
  const fabPulseRing = useRef(new Animated.Value(0)).current;
  const fabShadowAnim = useRef(new Animated.Value(1)).current;
  const tabScaleAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;
  const tabTextAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulseRing, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulseRing, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fabShadowAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabShadowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabPulseRing, fabShadowAnim]);

  const getActiveTab = () => {
    const currentRoute = segments[segments.length - 1];
    if (currentRoute === 'home') return 0;
    if (currentRoute === 'checkin') return 1;
    if (currentRoute === 'meds') return 2;
    if (currentRoute === 'profile') return 3;
    if (currentRoute === 'chatbot') return 4;
    return 0;
  };

  const getTabTitle = () => {
    const currentRoute = segments[segments.length - 1];
    if (currentRoute === 'home') return 'HOME';
    if (currentRoute === 'checkin') return 'CHECK-IN';
    if (currentRoute === 'meds') return 'MEDICATIONS';
    if (currentRoute === 'profile') return 'PROFILE';
    if (currentRoute === 'chatbot') return 'CHAT';
    return 'SWASTHYA';
  };

  const handleFabPress = () => {
    router.push('/(tabs)/chatbot' as any);
  };

  const activeTab = getActiveTab();
  const leftTabs = TAB_CONFIG.slice(0, 2);
  const rightTabs = TAB_CONFIG.slice(2, 4);

  const navBarAnim = useRef(new Animated.Value(activeTab === 4 ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(navBarAnim, {
      toValue: activeTab === 4 ? 0 : 1,
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const animateTabState = (tabIndex: number, isPressed: boolean) => {
    Animated.parallel([
      Animated.spring(tabScaleAnims[tabIndex], {
        toValue: isPressed ? 0.92 : 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(tabTextAnims[tabIndex], {
        toValue: isPressed ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getTextScale = (tabIndex: number) =>
    tabTextAnims[tabIndex].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavContainer}>
        <View style={styles.topNavBar}>
          {/* Left - Scan Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.leftButton}
          >
            <LinearGradient
              colors={[PRIMARY_COLOR, PRIMARY_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Center - Title Pill */}
          <View style={styles.centerPill}>
            <View style={styles.pillContent}>
              <View style={styles.blueDot} />
              <Text style={styles.pillText}>{getTabTitle()}</Text>
            </View>
          </View>

          {/* Right - Notification & Avatar */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconButton}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#374151" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarButton}
            >
              <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>I</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <Slot />
      
      {/* Bottom Navigation Bar */}
      <Animated.View 
        style={[
          styles.navContainer,
          {
            opacity: navBarAnim,
            transform: [
              {
                translateY: navBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [150, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={activeTab === 4 ? 'none' : 'auto'}
      >
        <View style={styles.navbar}>
          <View style={styles.navContent}>
            {leftTabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnims[idx] }] }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(tab.route as any)}
                    onPressIn={() => animateTabState(idx, true)}
                    onPressOut={() => animateTabState(idx, false)}
                    activeOpacity={0.7}
                    style={styles.navItem}
                  >
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                    ]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Animated.Text style={[
                      styles.navLabel, 
                      isActive && styles.activeNavLabel,
                      { transform: [{ scale: getTextScale(idx) }] }
                    ]}>
                      {tab.name}
                    </Animated.Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            <View style={styles.fabSpace} />

            {rightTabs.map((tab, idx) => {
              const isActive = activeTab === idx + 2;
              const tabIndex = idx + 2;
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnims[tabIndex] }] }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(tab.route as any)}
                    onPressIn={() => animateTabState(tabIndex, true)}
                    onPressOut={() => animateTabState(tabIndex, false)}
                    activeOpacity={0.7}
                    style={styles.navItem}
                  >
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                    ]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Animated.Text style={[
                      styles.navLabel, 
                      isActive && styles.activeNavLabel,
                      { transform: [{ scale: getTextScale(tabIndex) }] }
                    ]}>
                      {tab.name}
                    </Animated.Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFabPress}
          style={styles.fabOuter}
        >
          <View style={[
            styles.fabButton,
            activeTab === 4 && { backgroundColor: PRIMARY_COLOR }
          ]}>
            <Ionicons 
              name="chatbubble-ellipses" 
              size={30} 
              color={activeTab === 4 ? '#FFFFFF' : PRIMARY_COLOR} 
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top Nav Styles
  topNavContainer: {
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  leftButton: {
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPill: {
    flex: 1,
    marginHorizontal: 12,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY_COLOR,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#1F2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarButton: {
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Bottom Nav Styles
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