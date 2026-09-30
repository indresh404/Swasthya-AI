// components/chatbot/VoiceVisualizer.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type VoiceState = 'listening' | 'thinking' | 'speaking' | 'paused' | 'idle';

interface VoiceVisualizerProps {
  voiceState: VoiceState;
  onMicPress?: () => void;
  statusText?: string;
  size?: number;
}

const STATE_THEME: Record<
  VoiceState,
  {
    gradient: [string, string, string];
    primaryColor: string;
    secondaryColor: string;
    glowColor: string;
    icon: keyof typeof Ionicons.glyphMap;
    defaultLabel: string;
    sublabel: string;
    rotateDuration: number;
  }
> = {
  listening: {
    gradient: ['#38BDF8', '#005DFF', '#1E40AF'],
    primaryColor: '#38BDF8',
    secondaryColor: '#005DFF',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    icon: 'mic',
    defaultLabel: 'Listening...',
    sublabel: 'Speak now, Swasthya AI is listening',
    rotateDuration: 3500,
  },
  thinking: {
    gradient: ['#C084FC', '#9333EA', '#581C87'],
    primaryColor: '#C084FC',
    secondaryColor: '#9333EA',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    icon: 'sync',
    defaultLabel: 'Thinking...',
    sublabel: 'Synthesizing health insights & symptoms',
    rotateDuration: 2000,
  },
  speaking: {
    gradient: ['#34D399', '#059669', '#064E3B'],
    primaryColor: '#34D399',
    secondaryColor: '#059669',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    icon: 'volume-high',
    defaultLabel: 'Speaking...',
    sublabel: 'Swasthya Voice AI is responding',
    rotateDuration: 4000,
  },
  paused: {
    gradient: ['#64748B', '#475569', '#334155'],
    primaryColor: '#64748B',
    secondaryColor: '#475569',
    glowColor: 'rgba(100, 116, 139, 0.2)',
    icon: 'pause',
    defaultLabel: 'Paused',
    sublabel: 'Tap to resume voice interaction',
    rotateDuration: 7000,
  },
  idle: {
    gradient: ['#005DFF', '#1E40AF', '#0F172A'],
    primaryColor: '#38BDF8',
    secondaryColor: '#005DFF',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    icon: 'mic',
    defaultLabel: 'Tap to Speak',
    sublabel: 'Voice assistant ready',
    rotateDuration: 5000,
  },
};

// Animated staggered letter wave for "Listening...", "Thinking...", "Speaking..."
export const AnimatedLetterWave: React.FC<{ text: string; color?: string; voiceState: VoiceState }> = ({
  text,
  color,
  voiceState,
}) => {
  const letters = text.split('');
  const letterAnims = useRef<Animated.Value[]>([]).current;
  const theme = STATE_THEME[voiceState] || STATE_THEME.listening;
  const targetColor = color || theme.primaryColor;

  if (letterAnims.length !== letters.length) {
    letterAnims.length = 0;
    letters.forEach(() => {
      letterAnims.push(new Animated.Value(0));
    });
  }

  useEffect(() => {
    const animations = letterAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 90),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 450,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((letters.length - index) * 90 + 300),
        ])
      );
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((a) => a.stop());
    };
  }, [text, voiceState]);

  return (
    <View style={styles.letterWaveRow}>
      {letters.map((char, index) => {
        const anim = letterAnims[index] || new Animated.Value(0);
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -7],
        });
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.18],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.55, 1],
        });

        return (
          <Animated.Text
            key={`${char}-${index}`}
            style={[
              styles.letterWaveText,
              {
                color: '#FFFFFF',
                opacity,
                transform: [{ translateY }, { scale }],
                textShadowColor: targetColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              },
            ]}
          >
            {char === ' ' ? '\u00A0' : char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  voiceState,
  onMicPress,
  statusText,
  size = 230,
}) => {
  const theme = STATE_THEME[voiceState] || STATE_THEME.listening;

  // Rotation animation for orbital ring
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateReverseAnim = useRef(new Animated.Value(0)).current;

  // Pulse & Wave animations
  const wave1Scale = useRef(new Animated.Value(1)).current;
  const wave1Opacity = useRef(new Animated.Value(0.4)).current;
  const wave2Scale = useRef(new Animated.Value(1)).current;
  const wave2Opacity = useRef(new Animated.Value(0.3)).current;
  const wave3Scale = useRef(new Animated.Value(1)).current;
  const wave3Opacity = useRef(new Animated.Value(0.2)).current;

  // Equalizer soundbar animations
  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.5)).current;
  const bar3Anim = useRef(new Animated.Value(0.8)).current;
  const bar4Anim = useRef(new Animated.Value(0.4)).current;
  const bar5Anim = useRef(new Animated.Value(0.6)).current;

  // Core pulse
  const coreScale = useRef(new Animated.Value(1)).current;

  // Orbit rotation loop
  useEffect(() => {
    rotateAnim.setValue(0);
    rotateReverseAnim.setValue(0);

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: theme.rotateDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const rotateReverseLoop = Animated.loop(
      Animated.timing(rotateReverseAnim, {
        toValue: 1,
        duration: theme.rotateDuration * 1.35,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    rotateLoop.start();
    rotateReverseLoop.start();

    return () => {
      rotateLoop.stop();
      rotateReverseLoop.stop();
    };
  }, [voiceState]);

  // Audio wave expansion loop
  useEffect(() => {
    let wavesAnimation: Animated.CompositeAnimation | null = null;

    if (voiceState === 'listening' || voiceState === 'speaking') {
      const createWave = (scaleVal: Animated.Value, opacityVal: Animated.Value, delay: number, maxScale: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(scaleVal, {
                toValue: maxScale,
                duration: 1800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(opacityVal, {
                toValue: 0,
                duration: 1800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleVal, { toValue: 1, duration: 0, useNativeDriver: true }),
              Animated.timing(opacityVal, { toValue: 0.5, duration: 0, useNativeDriver: true }),
            ]),
          ])
        );
      };

      wavesAnimation = Animated.parallel([
        createWave(wave1Scale, wave1Opacity, 0, 1.45),
        createWave(wave2Scale, wave2Opacity, 450, 1.75),
        createWave(wave3Scale, wave3Opacity, 900, 2.1),
      ]);

      wavesAnimation.start();
    } else {
      wave1Scale.setValue(1);
      wave1Opacity.setValue(0.15);
      wave2Scale.setValue(1);
      wave2Opacity.setValue(0.1);
      wave3Scale.setValue(1);
      wave3Opacity.setValue(0.05);
    }

    return () => {
      if (wavesAnimation) wavesAnimation.stop();
    };
  }, [voiceState]);

  // Equalizer soundbars loop for speaking / listening
  useEffect(() => {
    let barAnimation: Animated.CompositeAnimation | null = null;

    const animateBar = (barVal: Animated.Value, duration: number, minVal: number, maxVal: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(barVal, {
            toValue: maxVal,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(barVal, {
            toValue: minVal,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    if (voiceState === 'speaking') {
      barAnimation = Animated.parallel([
        animateBar(bar1Anim, 260, 0.2, 1.4),
        animateBar(bar2Anim, 340, 0.3, 1.8),
        animateBar(bar3Anim, 210, 0.4, 2.0),
        animateBar(bar4Anim, 390, 0.25, 1.7),
        animateBar(bar5Anim, 290, 0.35, 1.5),
      ]);
      barAnimation.start();
    } else if (voiceState === 'listening') {
      barAnimation = Animated.parallel([
        animateBar(bar1Anim, 450, 0.3, 1.0),
        animateBar(bar2Anim, 520, 0.4, 1.3),
        animateBar(bar3Anim, 380, 0.5, 1.5),
        animateBar(bar4Anim, 480, 0.3, 1.2),
        animateBar(bar5Anim, 410, 0.4, 1.1),
      ]);
      barAnimation.start();
    } else {
      bar1Anim.setValue(0.3);
      bar2Anim.setValue(0.5);
      bar3Anim.setValue(0.8);
      bar4Anim.setValue(0.4);
      bar5Anim.setValue(0.6);
    }

    return () => {
      if (barAnimation) barAnimation.stop();
    };
  }, [voiceState]);

  // Core button pulsation
  useEffect(() => {
    let coreAnim: Animated.CompositeAnimation | null = null;
    if (voiceState === 'listening' || voiceState === 'speaking') {
      coreAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(coreScale, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coreScale, {
            toValue: 1.0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      coreAnim.start();
    } else {
      coreScale.setValue(1);
    }
    return () => {
      if (coreAnim) coreAnim.stop();
    };
  }, [voiceState]);

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '450deg'],
  });

  const spinReverseInterpolation = rotateReverseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['450deg', '90deg'],
  });

  const displayTitle = statusText || theme.defaultLabel;

  return (
    <View style={styles.container}>
      {/* Visualizer Anchor Area */}
      <View style={[styles.visualizerBox, { width: size, height: size }]}>
        {/* Layer 1: Outermost Expanding Audio Wave */}
        <Animated.View
          style={[
            styles.waveCircle,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              borderColor: theme.secondaryColor,
              opacity: wave3Opacity,
              transform: [{ scale: wave3Scale }],
            },
          ]}
        />

        {/* Layer 2: Middle Expanding Audio Wave */}
        <Animated.View
          style={[
            styles.waveCircle,
            {
              width: size * 0.74,
              height: size * 0.74,
              borderRadius: (size * 0.74) / 2,
              borderColor: theme.primaryColor,
              opacity: wave2Opacity,
              transform: [{ scale: wave2Scale }],
            },
          ]}
        />

        {/* Layer 3: Glowing Orbital Rotating Ring with Multi-Layer Shadow */}
        <Animated.View
          style={[
            styles.orbitalRing,
            {
              width: size * 0.8,
              height: size * 0.8,
              borderRadius: (size * 0.8) / 2,
              borderColor: theme.primaryColor,
              shadowColor: theme.primaryColor,
              transform: [{ rotate: spinInterpolation }],
            },
          ]}
        >
          <View
            style={[
              styles.orbitalDot,
              {
                backgroundColor: theme.primaryColor,
                top: -4,
                left: (size * 0.8) / 2 - 4,
              },
            ]}
          />
          <View
            style={[
              styles.orbitalDot,
              {
                backgroundColor: theme.secondaryColor,
                bottom: -4,
                left: (size * 0.8) / 2 - 4,
              },
            ]}
          />
        </Animated.View>

        {/* Layer 4: Inner Counter-Rotating Gradient Ring */}
        <Animated.View
          style={[
            styles.orbitalInnerRing,
            {
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: (size * 0.65) / 2,
              borderColor: theme.secondaryColor,
              shadowColor: theme.secondaryColor,
              transform: [{ rotate: spinReverseInterpolation }],
            },
          ]}
        >
          <View
            style={[
              styles.orbitalDotSmall,
              {
                backgroundColor: '#FFFFFF',
                right: -3,
                top: (size * 0.65) / 2 - 3,
              },
            ]}
          />
        </Animated.View>

        {/* Layer 5: Center Interactive Core Button with Dynamic Gradient */}
        <TouchableOpacity
          onPress={onMicPress}
          activeOpacity={0.85}
          style={styles.centerTouchable}
        >
          <Animated.View
            style={[
              styles.coreButtonWrapper,
              {
                shadowColor: theme.primaryColor,
                transform: [{ scale: coreScale }],
              },
            ]}
          >
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coreGradient}
            >
              {/* Mic / Voice Icon */}
              <Ionicons
                name={theme.icon}
                size={34}
                color="#FFFFFF"
                style={styles.coreIcon}
              />

              {/* Soundbar Equalizer inside the Core */}
              {(voiceState === 'speaking' || voiceState === 'listening') && (
                <View style={styles.soundbarRow}>
                  <Animated.View
                    style={[
                      styles.soundbar,
                      {
                        transform: [{ scaleY: bar1Anim }],
                        backgroundColor: '#FFFFFF',
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.soundbar,
                      {
                        transform: [{ scaleY: bar2Anim }],
                        backgroundColor: '#E0F2FE',
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.soundbar,
                      {
                        transform: [{ scaleY: bar3Anim }],
                        backgroundColor: '#FFFFFF',
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.soundbar,
                      {
                        transform: [{ scaleY: bar4Anim }],
                        backgroundColor: '#E0F2FE',
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.soundbar,
                      {
                        transform: [{ scaleY: bar5Anim }],
                        backgroundColor: '#FFFFFF',
                      },
                    ]}
                  />
                </View>
              )}

              {/* Neural Thinking Dots inside Core */}
              {voiceState === 'thinking' && (
                <View style={styles.thinkingDotsRow}>
                  <View style={[styles.thinkingDot, { backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.thinkingDot, { backgroundColor: '#FDE047' }]} />
                  <View style={[styles.thinkingDot, { backgroundColor: '#FFFFFF' }]} />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Animated Letter Wave Title: "Listening...", "Thinking...", "Speaking..." */}
      <View style={styles.textContainer}>
        <AnimatedLetterWave
          text={displayTitle}
          color={theme.primaryColor}
          voiceState={voiceState}
        />
        <Text style={styles.sublabelText}>{theme.sublabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  visualizerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveCircle: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  orbitalRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  orbitalInnerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  orbitalDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  orbitalDotSmall: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  centerTouchable: {
    zIndex: 30,
  },
  coreButtonWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 14,
  },
  coreGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  coreIcon: {
    marginTop: -2,
  },
  soundbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 4,
    height: 14,
  },
  soundbar: {
    width: 3,
    height: 10,
    borderRadius: 2,
  },
  thinkingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  thinkingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  letterWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  letterWaveText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sublabelText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
