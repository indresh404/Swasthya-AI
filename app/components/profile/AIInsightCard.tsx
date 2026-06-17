// app/components/profile/AIInsightCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AIInsightCardProps {
  summaryText?: string;
  onAnalysisComplete?: () => void;
}

// Skeleton Shimmer Component
const ShimmerSkeleton = ({ width: w, height, style }: any) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-w, w],
  });

  return (
    <View style={[{ width: w, height, overflow: 'hidden', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' }, style]}>
      <Animated.View
        style={{
          width: '50%',
          height: '100%',
          transform: [{ translateX }],
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />
    </View>
  );
};

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  summaryText,
  onAnalysisComplete,
}) => {
  const [state, setState] = useState<'idle' | 'loading' | 'thinking' | 'generating' | 'complete'>('idle');
  const [displayText, setDisplayText] = useState('');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [visibleInsights, setVisibleInsights] = useState<number[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [showConfidence, setShowConfidence] = useState(false);
  const [actionItems, setActionItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const confidenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AI Orb animation
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(0.3);

  // Insights data
  const insights = [
    {
      icon: '😴',
      title: 'Sleep Pattern Alert',
      text: 'Irregular sleep correlates with 78% of headache occurrences.',
      detail: 'Your sleep schedule varies by 3-4 hours daily. This disrupts your circadian rhythm and triggers headaches.',
      impact: 'Improving sleep consistency could reduce headaches by up to 60%',
      suggestion: 'Try to sleep and wake at the same time daily, even on weekends.',
      confidence: 94,
    },
    {
      icon: '🧘',
      title: 'Stress Management',
      text: 'Daily meditation could reduce anxiety by 45%.',
      detail: 'Your stress levels spike during exam periods and work deadlines.',
      impact: 'Regular meditation can lower cortisol levels and improve focus.',
      suggestion: 'Start with 5 minutes of guided meditation daily.',
      confidence: 88,
    },
    {
      icon: '🥗',
      title: 'Nutrition Impact',
      text: 'Regular meals could boost energy by 60%.',
      detail: 'You skip meals 3-4 times per week, leading to energy crashes.',
      impact: 'Maintaining regular meal times can stabilize blood sugar and energy.',
      suggestion: 'Set reminders for breakfast, lunch, and dinner.',
      confidence: 82,
    },
  ];

  const defaultSummary =
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  const displaySummary = summaryText || defaultSummary;

  // AI Thinking Steps
  const thinkingStepTexts = [
    '✓ Reading symptom history',
    '✓ Reviewing medications',
    '✓ Evaluating lifestyle patterns',
    '✓ Comparing family trends',
    '✓ Generating recommendations',
  ];

  // Action suggestions
  const actionSuggestions = [
    'Sleep before 11 PM',
    '15 min daily meditation',
    'Hydration target: 2.5L',
    'Reduce screen exposure at night',
  ];

  // Simulate text streaming
  const streamText = (text: string, speed = 30) => {
    let index = 0;
    setDisplayText('');

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    streamIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        const chunk = text.slice(index, index + Math.floor(Math.random() * 3) + 1);
        setDisplayText(prev => prev + chunk);
        index += chunk.length;
      } else {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setTimeout(() => {
          setState('complete');
          setHasAnalyzed(true);
          if (onAnalysisComplete) onAnalysisComplete();
        }, 500);
      }
    }, speed);
  };

  // Animate thinking steps
  const animateThinkingSteps = () => {
    let index = 0;
    setThinkingSteps([]);

    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
    }

    thinkingIntervalRef.current = setInterval(() => {
      if (index < thinkingStepTexts.length) {
        setThinkingSteps(prev => [...prev, thinkingStepTexts[index]]);
        index++;
      } else {
        if (thinkingIntervalRef.current) {
          clearInterval(thinkingIntervalRef.current);
          thinkingIntervalRef.current = null;
        }
        setTimeout(() => {
          setState('generating');
          streamText(displaySummary, 25);
          setTimeout(() => {
            insights.forEach((_, i) => {
              setTimeout(() => {
                setVisibleInsights(prev => [...prev, i]);
              }, i * 300);
            });
          }, 1000);
        }, 500);
      }
    }, 600);
  };

  // Animate action items
  useEffect(() => {
    if (state === 'complete') {
      setActionItems(actionSuggestions.map(text => ({ text, checked: false })));
      setShowConfidence(true);

      if (confidenceIntervalRef.current) {
        clearInterval(confidenceIntervalRef.current);
      }

      confidenceIntervalRef.current = setInterval(() => {
        setConfidence(prev => {
          const next = prev + 2;
          if (next >= 92) {
            if (confidenceIntervalRef.current) {
              clearInterval(confidenceIntervalRef.current);
              confidenceIntervalRef.current = null;
            }
            return 92;
          }
          return next;
        });
      }, 30);

      actionSuggestions.forEach((_, index) => {
        setTimeout(() => {
          setActionItems(prev =>
            prev.map((item, i) =>
              i === index ? { ...item, checked: true } : item
            )
          );
        }, 1500 + index * 400);
      });

      return () => {
        if (confidenceIntervalRef.current) {
          clearInterval(confidenceIntervalRef.current);
          confidenceIntervalRef.current = null;
        }
      };
    }
  }, [state]);

  // Animate orb
  useEffect(() => {
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    orbOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(orbScale);
      cancelAnimation(orbOpacity);
    };
  }, []);

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  // Pulse animation for idle state
  useEffect(() => {
    if (state === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [state]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      if (confidenceIntervalRef.current) {
        clearInterval(confidenceIntervalRef.current);
        confidenceIntervalRef.current = null;
      }
    };
  }, []);

  const handleAnalyze = () => {
    if (hasAnalyzed) return;
    setState('loading');

    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = setTimeout(() => {
      setState('thinking');
      animateThinkingSteps();
      loadingTimerRef.current = null;
    }, 2000);
  };

  const toggleInsight = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // Loading shimmer skeleton
  const renderLoading = () => (
    <View style={styles.contentContainer}>
      <View style={{ gap: 12 }}>
        <ShimmerSkeleton width={width * 0.5} height={20} />
        <ShimmerSkeleton width={width * 0.7} height={14} />
        <ShimmerSkeleton width={width * 0.65} height={14} />
        <View style={{ marginTop: 12, gap: 10 }}>
          <ShimmerSkeleton width={width * 0.8} height={40} />
          <ShimmerSkeleton width={width * 0.8} height={40} />
          <ShimmerSkeleton width={width * 0.8} height={40} />
        </View>
      </View>
      <View style={styles.loadingTextContainer}>
        <Text style={styles.loadingText}>Analyzing health patterns</Text>
        <Text style={styles.loadingDots}>...</Text>
      </View>
    </View>
  );

  // Thinking state
  const renderThinking = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.thinkingTitle}>🧠 AI Analyzing</Text>
      {thinkingSteps.map((step, index) => (
        <View key={index} style={styles.thinkingStep}>
          <Text style={styles.thinkingStepText}>{step}</Text>
        </View>
      ))}
    </View>
  );

  // Generating state
  const renderGenerating = () => (
    <View style={styles.contentContainer}>
      <View style={styles.generatingHeader}>
        <Text style={styles.generatingTitle}>🤖 AI Generating Insights</Text>
        <View style={styles.generatingDot}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
      <Text style={styles.generatingText}>{displayText}</Text>
      {displayText.length > 0 && (
        <View style={styles.generatingCursor}>
          <View style={styles.cursor} />
        </View>
      )}
    </View>
  );

  // Complete state with all insights
  const renderComplete = () => (
    <View style={styles.contentContainer}>
      {/* Summary */}
      <Text style={styles.summaryText}>{displaySummary}</Text>

      {/* Confidence Meter */}
      {showConfidence && (
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <Text style={styles.confidenceValue}>{Math.round(confidence)}%</Text>
          </View>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
          </View>
        </View>
      )}

      {/* Insights Cards */}
      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          visibleInsights.includes(index) && (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => toggleInsight(index)}
              style={[
                styles.insightCard,
                expandedCard === index && styles.insightCardExpanded,
              ]}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightIconWrapper}>
                  <Text style={styles.insightEmoji}>{insight.icon}</Text>
                </View>
                <View style={styles.insightTitleContainer}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceBadgeText}>{insight.confidence}%</Text>
                  </View>
                </View>
                <Ionicons
                  name={expandedCard === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9CA3AF"
                />
              </View>

              <Text style={styles.insightText}>{insight.text}</Text>

              {expandedCard === index && (
                <View style={styles.insightDetail}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📊 Why this matters</Text>
                    <Text style={styles.detailText}>{insight.detail}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>💡 Impact</Text>
                    <Text style={styles.detailText}>{insight.impact}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>✅ Suggested Action</Text>
                    <Text style={styles.detailText}>{insight.suggestion}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )
        ))}
      </View>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <View style={styles.actionContainer}>
          <Text style={styles.actionTitle}>🎯 Recommended Actions</Text>
          {actionItems.map((item, index) => (
            <View key={index} style={styles.actionItem}>
              {item.checked ? (
                <Ionicons name="checkmark-circle" size={20} color="#34D399" />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color="#6B7280" />
              )}
              <Text style={[styles.actionText, item.checked && styles.actionTextChecked]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Analysis Complete Badge */}
      <View style={styles.completeBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#34D399" />
        <Text style={styles.completeBadgeText}>✓ Analysis Complete</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={16} color="#34D399" />
        <Text style={styles.footerText}>AI analysis based on your recent health data</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ReAnimated.View style={[styles.orb, orbAnimatedStyle]} />
            <LinearGradient
              colors={['#60A5FA', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBg}
            >
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>AI Health Insights</Text>
          {hasAnalyzed && (
            <View style={styles.analyzedBadge}>
              <Text style={styles.analyzedBadgeText}>Analyzed</Text>
            </View>
          )}
        </View>

        {state === 'idle' && !hasAnalyzed && (
          <View style={styles.idleContainer}>
            <Text style={styles.idleText}>
              Get personalized health insights powered by AI.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAnalyze}
              style={styles.analyzeButton}
            >
              <LinearGradient
                colors={['#6366F1', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.analyzeGradient}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.analyzeText}>Analyze My Health</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {(state === 'loading' || state === 'thinking' || state === 'generating' || state === 'complete') && (
          <>
            {state === 'loading' && renderLoading()}
            {state === 'thinking' && renderThinking()}
            {state === 'generating' && renderGenerating()}
            {state === 'complete' && renderComplete()}
          </>
        )}

        {/* Show complete state if already analyzed */}
        {hasAnalyzed && state === 'idle' && renderComplete()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  orb: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    top: -10,
    left: -10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
  },
  analyzedBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  analyzedBadgeText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    gap: 12,
  },
  idleContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  idleText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzeButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  analyzeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  loadingDots: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  thinkingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#60A5FA',
    marginBottom: 8,
  },
  thinkingStep: {
    paddingVertical: 4,
  },
  thinkingStepText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  generatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  generatingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#60A5FA',
  },
  generatingDot: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.9 },
  generatingText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  generatingCursor: {
    flexDirection: 'row',
    marginTop: 2,
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: '#60A5FA',
    opacity: 0.8,
  },
  summaryText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 22,
    marginBottom: 4,
  },
  confidenceContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#60A5FA',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 2,
  },
  insightsContainer: {
    gap: 10,
    marginTop: 4,
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  insightCardExpanded: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightEmoji: {
    fontSize: 16,
  },
  insightTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceBadgeText: {
    fontSize: 9,
    color: '#60A5FA',
    fontWeight: '600',
  },
  insightText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginLeft: 42,
  },
  insightDetail: {
    marginTop: 8,
    marginLeft: 42,
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  detailSection: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60A5FA',
  },
  detailText: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  actionContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  actionTextChecked: {
    color: '#34D399',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  completeBadgeText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default AIInsightCard;