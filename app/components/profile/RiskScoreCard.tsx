// app/components/profile/RiskScoreCard.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  LayoutAnimation,
  Platform,
  Pressable,
} from 'react-native';
import { Svg, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor} from 'react-native-reanimated';


const { width } = Dimensions.get('window');
const SIZE = Math.min(width * 0.35, 150); // Slightly larger for better readability
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
const CENTER = SIZE / 2;

const SEMI_CIRCUMFERENCE = CIRCUMFERENCE * 0.5;
const START_ANGLE = 180;

const COLORS = {
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#4B5563', // Darkened slightly for better contrast
    light: '#9CA3AF'},
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444'},
  track: '#F3F4F6', // Softer track color
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Factor {
  text: string;
  color: string;
}

interface RiskScoreCardProps {
  score?: number;
  riskLevel?: string;
  description?: string;
  factors?: Factor[];
  onLongPress?: () => void;
  timestamp?: string;
  nextAssessment?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score = 58,
  description = 'Your health risk score is moderate. Regular monitoring and healthy habits are recommended.',
  factors = [
    { text: 'Chronic headache history', color: COLORS.risk.moderate },
    { text: 'High stress levels', color: COLORS.risk.moderate },
    { text: 'Regular exercise routine', color: COLORS.risk.low },
    { text: 'Family cardiovascular history', color: COLORS.risk.high },
    { text: 'Sedentary lifestyle', color: COLORS.risk.elevated },
  ],
  onLongPress,
  timestamp = 'Last updated: Today, 2:30 PM',
  nextAssessment = 'Next assessment: In 14 days',
  trend = 'stable'}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Reanimated Shared Values
  const progress = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const pulseValue = useSharedValue(1);

  // Helper to determine active color
  const getColor = (value: number) => {
    if (value < 30) return COLORS.risk.low;
    if (value < 50) return COLORS.risk.moderate;
    if (value < 70) return COLORS.risk.elevated;
    return COLORS.risk.high;
  };

  const activeColor = getColor(score);

  useEffect(() => {
    // Mount Animation
    progress.value = withDelay(
      300,
      withTiming(score, {
        duration: 2000,
        easing: Easing.bezier(0.25, 1, 0.5, 1), // Smoother, more natural easing curve
      })
    );

    pulseValue.value = withDelay(
      2300,
      withSequence(
        withTiming(1.3, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) })
      )
    );
  }, [score, progress, pulseValue]);

  // UI-Thread Text Animation (Eliminates setInterval completely)
  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(progress.value)}`} as any; // Cast to any to bypass strict TS type for the 'text' prop trick on TextInput
  });

  const progressAnimatedProps = useAnimatedProps(() => {
    const currentProgress = (progress.value / 100) * SEMI_CIRCUMFERENCE;
    return {
      strokeDashoffset: SEMI_CIRCUMFERENCE - currentProgress};
  });

  const glowDotProps = useAnimatedProps(() => {
    const angleRad = ((START_ANGLE + (progress.value / 100) * 180) * Math.PI) / 180;
    return {
      cx: CENTER + RADIUS * Math.cos(angleRad),
      cy: CENTER + RADIUS * Math.sin(angleRad)};
  });

  const pulseAnimatedProps = useAnimatedProps(() => ({
    opacity: pulseValue.value > 1 ? 0.2 : 0,
    r: RADIUS + (pulseValue.value - 1) * 20}));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]}));

  const handlePressIn = () => {
    scaleValue.value = withTiming(0.97, { duration: 150 });
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 200, easing: Easing.bounce });
  };

  const handleLongPress = () => {
    // Smoothly expand/collapse the layout native to the platform
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDetails((prev) => !prev);
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
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={400} // Slightly faster recognition
      style={[styles.container, animatedCardStyle]}
    >
      <View style={styles.contentRow}>
        {/* Left: Gauge */}
        <View style={styles.gaugeWrapper}>
          <Svg width={SIZE} height={SIZE * 0.6} viewBox={`0 0 ${SIZE} ${SIZE * 0.6}`}>
            <Defs>
              <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={COLORS.risk.low} />
                <Stop offset="40%" stopColor={COLORS.risk.moderate} />
                <Stop offset="70%" stopColor={COLORS.risk.elevated} />
                <Stop offset="100%" stopColor={COLORS.risk.high} />
              </LinearGradient>
            </Defs>

            {/* Background Track */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={COLORS.track}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${SEMI_CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${START_ANGLE}, ${CENTER}, ${CENTER})`}
            />

            {/* Animated Progress */}
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

            {/* Completion Pulse */}
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              fill="none"
              stroke={activeColor}
              strokeWidth={2}
              animatedProps={pulseAnimatedProps}
            />

            {/* Leading Glow Dot */}
            <AnimatedCircle r={STROKE_WIDTH / 2.5} fill="#FFF" animatedProps={glowDotProps} />
            <AnimatedCircle r={STROKE_WIDTH} fill={activeColor} opacity={0.3} animatedProps={glowDotProps} />
          </Svg>

          {/* Absolute Centered Text Wrapper to perfectly align the TextInput */}
          <View style={styles.scoreTextContainer}>
            <AnimatedTextInput
              underlineColorAndroid="transparent"
              editable={false}
              animatedProps={animatedTextProps}
              style={styles.scoreText}
            />
            <Text style={styles.scoreLabel}>RISK SCORE</Text>
          </View>

          {/* Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.riskBadge, { backgroundColor: `${riskLabel.color}15` }]}>
              <View style={[styles.riskDot, { backgroundColor: riskLabel.color }]} />
              <Text style={[styles.riskBadgeText, { color: riskLabel.color }]}>
                {riskLabel.label}
              </Text>
              <Text style={[styles.trendIcon, { color: riskLabel.color }]}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Details */}
        <View style={styles.detailsWrapper}>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.factorsList}>
            {(showDetails ? factors : factors.slice(0, 2)).map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
                <Text style={styles.factorText} numberOfLines={showDetails ? 2 : 1}>
                  {factor.text}
                </Text>
              </View>
            ))}

            {!showDetails && factors.length > 2 && (
              <Text style={styles.moreText}>+{factors.length - 2} more</Text>
            )}
          </View>
        </View>
      </View>

      {/* Expanded Metadata Footer */}
      {showDetails && (
        <View style={styles.footer}>
          <View style={styles.divider} />
          <View style={styles.footerRow}>
            <Text style={styles.metadataText}>{timestamp}</Text>
            <Text style={styles.metadataText}>{nextAssessment}</Text>
          </View>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 20,
    padding: 20,
    borderRadius: 24, // Rounder, modern shape
    ...Platform.select({
      ios: {
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16},
      android: {
        elevation: 4}})},
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16},
  gaugeWrapper: {
    alignItems: 'center',
    width: SIZE},
  scoreTextContainer: {
    position: 'absolute',
    top: SIZE * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'},
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlign: 'center'},
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.light,
    letterSpacing: 1,
    marginTop: -2},
  badgeContainer: {
    marginTop: -4},
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6},
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3},
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3},
  trendIcon: {
    fontSize: 12,
    fontWeight: '800'},
  detailsWrapper: {
    flex: 1,
    paddingTop: 4},
  descriptionText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 12},
  factorsList: {
    gap: 6},
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3},
  factorText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1},
  moreText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.light,
    marginTop: 2,
    marginLeft: 14},
  footer: {
    marginTop: 16},
  divider: {
    height: 1,
    backgroundColor: COLORS.track,
    marginBottom: 12},
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  metadataText: {
    fontSize: 11,
    color: COLORS.text.light,
    fontWeight: '500'}});

export default RiskScoreCard;