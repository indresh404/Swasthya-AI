// app/components/profile/RiskScoreCard.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated as RNAnimated } from 'react-native';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';

const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

const COLORS = {
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
};

interface RiskScoreCardProps {
  score: number;
  riskLevel: string;
  description?: string;
  factors?: { text: string; color: string }[];
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
}) => {
  const getColor = (value: number) => {
    if (value < 30) return COLORS.risk.low;
    if (value < 50) return COLORS.risk.moderate;
    if (value < 70) return COLORS.risk.elevated;
    return COLORS.risk.high;
  };

  const color = getColor(score);
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;
  const center = size / 2;
  const filledOffset = circumference - progress;

  const animatedValue = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      easing: (t) => t * t * (3 - 2 * t),
    }).start();
  }, []);

  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, filledOffset],
  });

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Progress Circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
          />
          {/* Center Text */}
          <G>
            <SvgText
              x={center}
              y={center - 10}
              textAnchor="middle"
              fontSize="28"
              fontWeight="bold"
              fill={COLORS.text.primary}
            >
              {score}
            </SvgText>
            <SvgText
              x={center}
              y={center + 18}
              textAnchor="middle"
              fontSize="11"
              fill={COLORS.text.secondary}
            >
              Risk Score
            </SvgText>
          </G>
        </Svg>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.riskStatus}>{riskLevel}</Text>
        <Text style={styles.riskDescription}>{description}</Text>
        <View style={styles.factorsContainer}>
          {factors.map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
              <Text style={styles.factorText}>{factor.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
  },
  riskStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  factorsContainer: {
    gap: 4,
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
});

export default RiskScoreCard;