// app/components/profile/RiskScoreCard.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Svg, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SIZE = Math.min(width * 0.3, 140);
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
const CENTER = SIZE / 2;

// Semi-circle only (180 degrees)
const SEMI_CIRCUMFERENCE = CIRCUMFERENCE * 0.5;
const START_ANGLE = 180; // Start from left

const COLORS = {
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
};

// Create Animated Circle component with Reanimated
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Factor {
  text: string;
  color: string;
}

interface RiskScoreCardProps {
  score: number;
  riskLevel: string;
  description?: string;
  factors?: Factor[];
  onLongPress?: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score = 58,
  riskLevel = 'Moderate Risk',
  description = 'Your health risk score is moderate. Regular monitoring and healthy habits are recommended.',
  factors = [
    { text: 'Chronic headache history', color: '#F59E0B' },
    { text: 'High stress levels', color: '#F59E0B' },
    { text: 'Regular exercise routine', color: '#10B981' },
  ],
  onLongPress,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reanimated shared values
  const progress = useSharedValue(0);
  const glowAngle = useSharedValue(START_ANGLE);
  const pulseValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);

  const getColor = (value: number) => {
    if (value < 30) return COLORS.risk.low;
    if (value < 50) return COLORS.risk.moderate;
    if (value < 70) return COLORS.risk.elevated;
    return COLORS.risk.high;
  };

  const color = getColor(score);

  // 1. Animated props for progress ring
  const progressAnimatedProps = useAnimatedProps(() => {
    const currentProgress = (progress.value / 100) * SEMI_CIRCUMFERENCE;
    const offset = SEMI_CIRCUMFERENCE - currentProgress;
    return {
      strokeDashoffset: offset,
    };
  });

  // 2. Animated props for glow dot position
  const glowDotProps = useAnimatedProps(() => {
    const angleRad = (glowAngle.value * Math.PI) / 180;
    const x = CENTER + RADIUS * Math.cos(angleRad);
    const y = CENTER + RADIUS * Math.sin(angleRad);
    return {
      cx: x,
      cy: y,
    };
  });

  // 3. Animated props for pulse ring
  const pulseAnimatedProps = useAnimatedProps(() => ({
    opacity: pulseValue.value * 0.15,
    r: RADIUS + pulseValue.value * 4,
  }));

  // 4. Animated style for scale
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // 5. Animate score counter using setInterval
  const animateScore = (target: number) => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setDisplayScore(Math.round(current));

      if (step >= steps) {
        setDisplayScore(target);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, duration / steps);

    return intervalRef.current;
  };

  const startAnimation = () => {
    if (isAnimating || hasAnimated) return;

    setIsAnimating(true);
    setDisplayScore(0);
    setHasAnimated(true);
    progress.value = 0;
    glowAngle.value = START_ANGLE;
    pulseValue.value = 1;

    // Animate progress ring from 0 to target score
    progress.value = withTiming(score, {
      duration: 2000,
      easing: Easing.out(Easing.quad),
    });

    // Animate glow angle from start to target position
    const targetAngle = START_ANGLE + (score / 100) * 180;
    glowAngle.value = withTiming(targetAngle, {
      duration: 2000,
      easing: Easing.out(Easing.quad),
    });

    // Animate score counter using setInterval
    animateScore(score);

    // Pulse on completion
    timeoutRef.current = setTimeout(() => {
      pulseValue.value = withSequence(
        withTiming(1.4, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
      setIsAnimating(false);
    }, 2100);
  };

  // Run animation only once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array - runs only once

  const handlePress = () => {
    if (isAnimating) return;
    // Reset and replay
    setHasAnimated(false);
    setDisplayScore(0);
    progress.value = 0;
    glowAngle.value = START_ANGLE;
    pulseValue.value = 1;
    startAnimation();
  };

  const handlePressIn = () => {
    scaleValue.value = withTiming(0.96, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handleLongPress = () => {
    setShowDetails(prev => !prev);
    if (onLongPress) onLongPress();
  };

  const getRiskLabel = () => {
    if (score < 30) return { label: 'Low Risk', color: COLORS.risk.low };
    if (score < 50) return { label: 'Moderate Risk', color: COLORS.risk.moderate };
    if (score < 70) return { label: 'Elevated Risk', color: COLORS.risk.elevated };
    return { label: 'High Risk', color: COLORS.risk.high };
  };

  const riskLabel = getRiskLabel();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.gaugeContainer}>
          <Svg width={SIZE} height={SIZE * 0.65} viewBox={`0 0 ${SIZE} ${SIZE * 0.65}`}>
            <Defs>
              <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={COLORS.risk.low} />
                <Stop offset="33%" stopColor={COLORS.risk.moderate} />
                <Stop offset="66%" stopColor={COLORS.risk.elevated} />
                <Stop offset="100%" stopColor={COLORS.risk.high} />
              </LinearGradient>
            </Defs>

            {/* Background Semi-Circle */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#E5E7EB"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${SEMI_CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${START_ANGLE}, ${CENTER}, ${CENTER})`}
            />

            {/* Progress Semi-Circle - Animated */}
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="url(#progressGradient)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${SEMI_CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              animatedProps={progressAnimatedProps}
              strokeLinecap="round"
              transform={`rotate(${START_ANGLE}, ${CENTER}, ${CENTER})`}
            />

            {/* Glow Dot - Travels along the arc */}
            <AnimatedCircle
              r={5}
              fill={color}
              opacity={0.9}
              animatedProps={glowDotProps}
            />

            {/* Glow Ring behind the dot */}
            <AnimatedCircle
              r={10}
              fill={color}
              opacity={0.2}
              animatedProps={glowDotProps}
            />

            {/* Completion Pulse Ring */}
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS + 4}
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeDasharray={`${SEMI_CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              animatedProps={pulseAnimatedProps}
              transform={`rotate(${START_ANGLE}, ${CENTER}, ${CENTER})`}
            />

            {/* Center Score */}
            <G>
              <SvgText
                x={CENTER}
                y={CENTER - 8}
                textAnchor="middle"
                fontSize={Math.min(SIZE * 0.2, 24)}
                fontWeight="800"
                fill={COLORS.text.primary}
                letterSpacing="0.5"
              >
                {displayScore}
              </SvgText>
              <SvgText
                x={CENTER}
                y={CENTER + 16}
                textAnchor="middle"
                fontSize={Math.min(SIZE * 0.08, 10)}
                fontWeight="500"
                fill={COLORS.text.secondary}
                letterSpacing="0.8"
              >
                RISK SCORE
              </SvgText>
            </G>
          </Svg>

          {/* Risk Level Label */}
          <View style={styles.riskLabelContainer}>
            <View style={[styles.riskDot, { backgroundColor: riskLabel.color }]} />
            <Text style={[styles.riskLabelText, { color: riskLabel.color }]}>
              {riskLabel.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.riskDescription}>{description}</Text>

          {showDetails ? (
            <View style={styles.factorsContainer}>
              {factors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
                  <Text style={styles.factorText}>{factor.text}</Text>
                </View>
              ))}
              <View style={styles.hintText}>
                <Text style={styles.hintTextStyle}>Tap to replay animation</Text>
              </View>
            </View>
          ) : (
            <View style={styles.factorsPreview}>
              {factors.slice(0, 2).map((factor, index) => (
                <View key={index} style={styles.factorPreviewItem}>
                  <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
                  <Text style={styles.factorPreviewText}>{factor.text}</Text>
                </View>
              ))}
              {factors.length > 2 && (
                <Text style={styles.moreText}>+{factors.length - 2} more</Text>
              )}
              <View style={styles.hintText}>
                <Text style={styles.hintTextStyle}>Long press for details</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 130,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  riskLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskLabelText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    flex: 1,
  },
  riskDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  factorsContainer: {
    gap: 4,
    marginTop: 2,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  factorText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  factorsPreview: {
    gap: 3,
  },
  factorPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  factorPreviewText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  moreText: {
    fontSize: 10,
    color: COLORS.text.light,
    marginTop: 2,
  },
  hintText: {
    marginTop: 4,
  },
  hintTextStyle: {
    fontSize: 9,
    color: COLORS.text.light,
    letterSpacing: 0.5,
  },
});

export default RiskScoreCard;