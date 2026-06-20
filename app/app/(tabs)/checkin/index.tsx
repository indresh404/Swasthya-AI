// app/(tabs)/checkin/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
  FlatList,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Svg, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useCheckin } from '../../context/CheckinContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#0474FC',
  primaryDark: '#0360D0',
  primaryLight: '#E8F1FE',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  ai: '#8B5CF6',
  aiLight: '#EDE9FE',
  card: '#FFFFFF',
  background: '#F8FAFC',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    light: '#94A3B8',
  },
  border: '#E2E8F0',
};

// --- ANIMATED PROGRESS RING ---
const AnimatedProgressRing = ({ progress, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 600,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [progress]);

  const animatedStrokeDashoffset = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.primary} />
            <Stop offset="100%" stopColor="#00E5FF" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.progressPercentText}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- OPTION CHIP ---
const OptionChip = React.memo(({ option, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionChip,
        isSelected ? styles.optionChipSelected : styles.optionChipUnselected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
        {option}
      </Text>
    </TouchableOpacity>
  );
});

// --- QUESTION CARD ---
const QuestionCard = React.memo(({ 
  question, 
  onAnswer, 
  selectedAnswer, 
  onRemove,
  index,
  isActive,
}) => {
  const opacity = useSharedValue(isActive ? 0 : 0);
  const translateY = useSharedValue(isActive ? 30 : 0);
  const scale = useSharedValue(isActive ? 0.95 : 1);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      scale.value = withSpring(1, { damping: 20, stiffness: 100 });
    } else {
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
    }
  }, [isActive]);

  const handleAnswer = (answer: string) => {
    onAnswer(question.id, answer);
    
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.95, { duration: 300 });
    translateY.value = withTiming(-20, { duration: 300 });
    
    setTimeout(() => {
      onRemove(question.id);
    }, 350);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const isAI = question?.asked_by === 'ai';

  return (
    <Animated.View style={[styles.questionCard, animatedStyle, isActive && styles.activeCard]}>
      <View style={styles.questionHeader}>
        <View style={[styles.tagBadge, { backgroundColor: isAI ? COLORS.aiLight : COLORS.successLight }]}>
          <Ionicons name={isAI ? 'sparkles' : 'medkit'} size={12} color={isAI ? COLORS.ai : COLORS.success} />
          <Text style={[styles.tagText, { color: isAI ? COLORS.ai : COLORS.success }]}>
            {isAI ? 'AI Agent' : 'Doctor Request'}
          </Text>
        </View>
        {index !== undefined && (
          <Text style={styles.questionNumber}>#{index + 1}</Text>
        )}
      </View>

      <Text style={styles.questionText}>{question.question_text}</Text>

      <View style={styles.optionsWrapper}>
        {question.options.map((option: string) => (
          <OptionChip
            key={option}
            option={option}
            isSelected={selectedAnswer === option}
            onPress={() => handleAnswer(option)}
          />
        ))}
      </View>
    </Animated.View>
  );
});

// --- EMPTY STATE ---
const EmptyState = () => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.emptyState, animatedStyle]}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="checkmark-done-circle" size={64} color={COLORS.success} />
      </View>
      <Text style={styles.emptyStateTitle}>🎉 All check-ins completed</Text>
      <Text style={styles.emptyStateSubtitle}>
        Waiting for new questions from AI or your doctor...
      </Text>
      <ActivityIndicator 
        size="small" 
        color={COLORS.primary} 
        style={{ marginTop: 16 }}
      />
    </Animated.View>
  );
};

export default function CheckinScreen() {
  const {
    pendingQuestions,
    completedQuestions,
    selectedAnswers,
    isLoading,
    handleAnswer,
    handleRemoveQuestion,
    getProgress,
  } = useCheckin();

  const flatListRef = useRef<FlatList>(null);
  const { progress, completed, total } = getProgress();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Render item for FlatList
  const renderItem = useCallback(({ item, index }) => {
    const isActive = index === 0;
    return (
      <QuestionCard
        question={item}
        onAnswer={handleAnswer}
        selectedAnswer={selectedAnswers[item.id] || ''}
        onRemove={handleRemoveQuestion}
        index={index}
        isActive={isActive}
      />
    );
  }, [handleAnswer, handleRemoveQuestion, selectedAnswers]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const showEmptyState = !isLoading && pendingQuestions.length === 0 && completedQuestions.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.greetingText}>{getGreeting()}, Indresh</Text>
          </View>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color={COLORS.warning} />
            <Text style={styles.streakCount}>7</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <AnimatedProgressRing progress={progress} />
            <View style={styles.progressDetails}>
              <Text style={styles.progressTitle}>Daily Check-in</Text>
              <Text style={styles.progressSubtitle}>
                {completed} of {total} completed today
              </Text>
              
              {progress === 1 && total > 0 ? (
                <View style={styles.statusBadgeComplete}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <Text style={styles.statusTextComplete}>✓ All Done</Text>
                </View>
              ) : pendingQuestions.length > 0 ? (
                <View style={styles.statusBadgePending}>
                  <Ionicons name="time" size={14} color={COLORS.warning} />
                  <Text style={styles.statusTextPending}>
                    {pendingQuestions.length} remaining
                  </Text>
                </View>
              ) : (
                <View style={styles.statusBadgeComplete}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <Text style={styles.statusTextComplete}>✓ Ready</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Question List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : (
          <>
            {pendingQuestions.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={pendingQuestions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
                ListHeaderComponent={
                  <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>
                      {pendingQuestions.length} Questions
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Answer them one by one
                    </Text>
                  </View>
                }
              />
            ) : showEmptyState ? (
              <EmptyState />
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: COLORS.text.light, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 2 
  },
  greetingText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: COLORS.text.primary, 
    letterSpacing: -0.5 
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  streakCount: { fontSize: 14, fontWeight: '700', color: COLORS.warning },

  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringWrapper: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  progressPercentText: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: COLORS.text.primary, 
    textAlign: 'center',
  },
  progressDetails: { flex: 1 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  progressSubtitle: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 8 },
  statusBadgeComplete: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.successLight, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    gap: 4 
  },
  statusTextComplete: { fontSize: 11, fontWeight: '600', color: COLORS.success },
  statusBadgePending: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.warningLight, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    gap: 4 
  },
  statusTextPending: { fontSize: 11, fontWeight: '600', color: COLORS.warning },

  listContent: {
    paddingBottom: 150,
  },
  listHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  activeCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    gap: 4 
  },
  tagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  questionText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    lineHeight: 24, 
    marginBottom: 16 
  },
  optionsWrapper: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionChipUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
  },
  optionChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionChipText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  optionChipTextSelected: { color: COLORS.primaryDark },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginTop: 20,
    minHeight: 300,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  loadingContainer: { gap: 12, marginTop: 12 },
  skeletonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    height: 160,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});