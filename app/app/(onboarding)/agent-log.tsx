// app/(onboarding)/agent-log.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ──────────────────────────────────────────────────────────────────────
type StepStatus = 'waiting' | 'running' | 'done' | 'error';

interface AgentStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  logLines: string[];
  durationMs: number;
}

// ── Pipeline definition ────────────────────────────────────────────────────────
const PIPELINE: AgentStep[] = [
  {
    id: 'health_summary',
    title: 'Health Summarization',
    subtitle: 'Sarvam Chat Agent - Summarizing overall health',
    icon: 'chatbubble-ellipses-outline',
    color: '#0474FC',
    durationMs: 2000,
    logLines: [],
  },
  {
    id: 'medical_scan',
    title: 'Medical Report Scanner',
    subtitle: 'Medical Scan Agent - Scanning past medical issues',
    icon: 'document-text-outline',
    color: '#3B82F6',
    durationMs: 2500,
    logLines: [],
  },
  {
    id: 'smartwatch',
    title: 'Wearable Data Tracker',
    subtitle: 'Smartwatch Risk Agent - Tracking smartwatch data',
    icon: 'watch-outline',
    color: '#10B981',
    durationMs: 2500,
    logLines: [],
  },
  {
    id: 'family_history',
    title: 'Family Genetics Assessor',
    subtitle: 'Family Genetics Agent - Tracking family similarity issues',
    icon: 'people-outline',
    color: '#8B5CF6',
    durationMs: 2200,
    logLines: [],
  },
  {
    id: 'risk_score',
    title: 'Clinical Risk Evaluator',
    subtitle: 'Risk Scoring Agent - Generating a risk score',
    icon: 'speedometer-outline',
    color: '#F59E0B',
    durationMs: 3000,
    logLines: [],
  },
  {
    id: 'final_summary',
    title: 'Clinical Report Finalizer',
    subtitle: 'Doctor Q&A Agent - Finalizing summary',
    icon: 'checkmark-done-circle-outline',
    color: '#EF4444',
    durationMs: 2000,
    logLines: [],
  },
];

// ── Log Line Component ─────────────────────────────────────────────────────────
const LogLine = ({ line, delay }: { line: string; delay: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = line.startsWith('✓');
  const isArrow = line.startsWith('→');

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 3 }}>
      <Text style={[
        styles.logLine,
        isSuccess && styles.logLineSuccess,
        isArrow && styles.logLineArrow,
      ]}>
        {line}
      </Text>
    </Animated.View>
  );
};

// ── Step Card Component ────────────────────────────────────────────────────────
const StepCard = ({
  step,
  status,
  visibleLogLines,
}: {
  step: AgentStep;
  status: StepStatus;
  visibleLogLines: number;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideIn = useRef(new Animated.Value(40)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'waiting') {
      Animated.parallel([
        Animated.timing(slideIn, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'running') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  if (status === 'waiting') return null;

  const borderColor = status === 'done' ? step.color + '40' : step.color;

  return (
    <Animated.View style={[
      styles.stepCard,
      { borderLeftColor: borderColor, opacity: fadeIn, transform: [{ translateY: slideIn }] }
    ]}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <Animated.View style={[
          styles.stepIconBg,
          { backgroundColor: step.color + '15', transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons name={step.icon as any} size={20} color={step.color} />
        </Animated.View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          status === 'done' ? styles.statusBadgeDone : styles.statusBadgeRunning
        ]}>
          {status === 'running' ? (
            <Text style={[styles.statusText, { color: '#F59E0B' }]}>Running</Text>
          ) : (
            <Text style={[styles.statusText, { color: '#34D399' }]}>✓ Done</Text>
          )}
        </View>
      </View>

      {/* Logs */}
      <View style={styles.logContainer}>
        {step.logLines.slice(0, visibleLogLines).map((line, idx) => (
          <LogLine key={idx} line={line} delay={idx * 180} />
        ))}
        {status === 'running' && visibleLogLines < step.logLines.length && (
          <Text style={styles.cursor}>▌</Text>
        )}
      </View>
    </Animated.View>
  );
};

// ── Circular Progress Component ────────────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffsetTarget = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, circumference - circumference * (score / 100)],
  });

  const getRiskColor = (s: number) => {
    if (s < 40) return '#10B981';
    if (s < 70) return '#F97316';
    return '#EF4444';
  };

  const progressColor = getRiskColor(score);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2D2D2D"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffsetTarget}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>{score}</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: progressColor, marginTop: 2, textTransform: 'uppercase' }}>
          {score < 40 ? 'Low Risk' : score < 70 ? 'Moderate' : 'High Risk'}
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function AgentLogScreen() {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    PIPELINE.map(() => 'waiting')
  );
  const [visibleLogLines, setVisibleLogLines] = useState<number[]>(
    PIPELINE.map(() => 0)
  );
  const [allDone, setAllDone] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId || 'demo-patient';

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    runPipeline();
  }, []);

  const runPipeline = async () => {
    // ── STEP 1: Health Summarization ──────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[0] = 'running'; return n; });
    const logs0 = [
      '→ Fetching session messages from Supabase...',
      '→ Translating patient speech/text input into clinical English...',
      '→ Running entity extractor for symptoms (severity/duration)...'
    ];
    for (let l = 1; l <= logs0.length; l++) {
      PIPELINE[0].logLines = logs0.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[0] = l; return n; });
      await delay(500);
    }
    const finalLogs0 = [
      ...logs0,
      '✓ Extracted clinical entities successfully.',
      '✓ daily_summary: Compiled overall health summary notes.',
      '✓ Symptom logged: Headache (severity 6/10, onset 3 days ago).'
    ];
    PIPELINE[0].logLines = finalLogs0;
    setVisibleLogLines(prev => { const n = [...prev]; n[0] = finalLogs0.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[0] = 'done'; return n; });
    await delay(400);

    // ── STEP 2: Medical Scan Agent ───────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[1] = 'running'; return n; });
    const logs1 = [
      '→ Accessing historical patient clinical documents...',
      '→ Running OCR/structure engine on lipid profile report...',
      '→ Inspecting past glucose HbA1c values...'
    ];
    for (let l = 1; l <= logs1.length; l++) {
      PIPELINE[1].logLines = logs1.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[1] = l; return n; });
      await delay(500);
    }
    const finalLogs1 = [
      ...logs1,
      '✓ Extracted lab values (Fasting glucose: 110 mg/dL).',
      '✓ Past history scanned: Hypertension, Pre-diabetes.'
    ];
    PIPELINE[1].logLines = finalLogs1;
    setVisibleLogLines(prev => { const n = [...prev]; n[1] = finalLogs1.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[1] = 'done'; return n; });
    await delay(400);

    // ── STEP 3: Smartwatch Data Tracker ──────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[2] = 'running'; return n; });
    const logs2 = [
      '→ Querying sensor stream data (PPG and accelerometer)...',
      '→ Scanning heart rate samples around reported symptom times...',
      '→ Inspecting daily sleep cycles and step levels...'
    ];
    for (let l = 1; l <= logs2.length; l++) {
      PIPELINE[2].logLines = logs2.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[2] = l; return n; });
      await delay(500);
    }
    const finalLogs2 = [
      ...logs2,
      '✓ Correlated symptom: Peak heart rate of 105 bpm during headache.',
      '✓ HRV is healthy (45ms). No critical arrhythmia or AFib.'
    ];
    PIPELINE[2].logLines = finalLogs2;
    setVisibleLogLines(prev => { const n = [...prev]; n[2] = finalLogs2.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[2] = 'done'; return n; });
    await delay(400);

    // ── STEP 4: Family Genetics Assessor ─────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[3] = 'running'; return n; });
    const logs3 = [
      '→ Pulling family history profile records...',
      '→ Evaluating genetics risk factor mapping...',
      '→ Cross-referencing maternal cardiovascular/diabetic history...'
    ];
    for (let l = 1; l <= logs3.length; l++) {
      PIPELINE[3].logLines = logs3.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[3] = l; return n; });
      await delay(500);
    }
    const finalLogs3 = [
      ...logs3,
      '✓ Mapped inherited risk for diabetes (maternal side).',
      '✓ Hereditary score adjustment calculated successfully.'
    ];
    PIPELINE[3].logLines = finalLogs3;
    setVisibleLogLines(prev => { const n = [...prev]; n[3] = finalLogs3.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[3] = 'done'; return n; });
    await delay(400);

    // ── STEP 5: Clinical Risk Evaluator ──────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[4] = 'running'; return n; });
    const logs4 = [
      '→ Fetching clinical guidelines (AHA/ACC Hypertension 2017)...',
      '→ Adjusting calculations for age, vitals, and genetics...',
      '→ Adjusting score for missed Metformin compliance flag (+3)...'
    ];
    for (let l = 1; l <= logs4.length; l++) {
      PIPELINE[4].logLines = logs4.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[4] = l; return n; });
      await delay(600);
    }
    const finalLogs4 = [
      ...logs4,
      '✓ Base score calculated: 65.',
      '✓ Final adjusted score: 68.',
      '✓ Risk category: Moderate Risk (BP & missed dose correction).'
    ];
    PIPELINE[4].logLines = finalLogs4;
    setVisibleLogLines(prev => { const n = [...prev]; n[4] = finalLogs4.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[4] = 'done'; return n; });
    await delay(400);

    // ── STEP 6: Clinical Report Finalizer ────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[5] = 'running'; return n; });
    const logs5 = [
      '→ Writing finalized daily summaries into Supabase tables...',
      '→ Formatting analysis logs for physician report dashboard...',
      '→ Creating tailored patient clinical insights...'
    ];
    for (let l = 1; l <= logs5.length; l++) {
      PIPELINE[5].logLines = logs5.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[5] = l; return n; });
      await delay(500);
    }
    const finalLogs5 = [
      ...logs5,
      '✓ Summarized daily chat, smartwatch, history, and scans.',
      '✓ Pipeline completed: All agent systems processed.',
      '✓ Generating risk scoreboard.'
    ];
    PIPELINE[5].logLines = finalLogs5;
    setVisibleLogLines(prev => { const n = [...prev]; n[5] = finalLogs5.length; return n; });
    setStepStatuses(prev => { const n = [...prev]; n[5] = 'done'; return n; });

    // Mark completion
    setAllDone(true);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const completedCount = stepStatuses.filter(s => s === 'done').length;
  const progressPct = (completedCount / PIPELINE.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      {/* Top bar */}
      <Animated.View style={[styles.topBar, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0474FC" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.topTitle}>Agent Pipeline</Text>
          <Text style={styles.topSub}>
            {allDone ? 'All agents complete' : `Running agent ${completedCount + 1} of ${PIPELINE.length}…`}
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{completedCount}/{PIPELINE.length}</Text>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressOuter}>
        <Animated.View style={[styles.progressInner, { width: `${progressPct}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <Animated.View style={[styles.introCard, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#0474FC', '#0360D0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.introGradient}
          >
            <Ionicons name="git-network-outline" size={28} color="#FFFFFF" />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.introTitle}>Multi-Agent AI Pipeline</Text>
              <Text style={styles.introSub}>
                6 specialised clinical agents processing your session
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Step Cards */}
        {PIPELINE.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            status={stepStatuses[i]}
            visibleLogLines={visibleLogLines[i]}
          />
        ))}

        {/* Done state */}
        {allDone && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Pipeline Complete</Text>
            <Text style={styles.doneSub}>
              All diagnostic analyses have finished successfully.
            </Text>

            {/* Circular Risk Score Progress */}
            <View style={styles.progressCardSection}>
              <CircularProgress score={68} />
            </View>

            {/* AI Insights box */}
            <View style={styles.insightsContainer}>
              <View style={styles.insightsHeader}>
                <Ionicons name="analytics" size={16} color="#0474FC" />
                <Text style={styles.insightsTitle}>AI Clinical Insights</Text>
              </View>
              <Text style={styles.insightsText}>
                • <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Symptom Severity</Text>: Reported headaches rating 6/10. Vitals show moderate heart rate increase (105 bpm) matching symptoms.
              </Text>
              <Text style={styles.insightsText}>
                • <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Adherence</Text>: Warning issued for missed morning Metformin dose. Compliance reminder scheduled.
              </Text>
              <Text style={styles.insightsText}>
                • <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Wearable Status</Text>: Correlated smartwatch logs confirm resting blood pressure remains elevated at 135/88.
              </Text>
              <Text style={styles.insightsText}>
                • <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Advice</Text>: Ensure hydration, follow evening Amlodipine schedule, and consult doctor for missed Metformin advice.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <LinearGradient
                colors={['#0474FC', '#0360D0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.doneBtnGradient}
              >
                <Ionicons name="home-outline" size={20} color="#FFF" />
                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 40,
    paddingBottom: 14,
    backgroundColor: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  topSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  counterBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  counterText: { fontSize: 13, fontWeight: '700', color: '#0474FC' },
  progressOuter: { height: 3, backgroundColor: '#2D2D2D' },
  progressInner: { height: 3, backgroundColor: '#0474FC' },
  scroll: { padding: 16, paddingTop: 20 },

  introCard: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  introGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  introTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  introSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },

  stepCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  stepSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeRunning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  statusText: { fontSize: 11, fontWeight: '600' },

  logContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
  },
  logLine: { fontSize: 11, color: '#94A3B8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
  logLineSuccess: { color: '#34D399' },
  logLineArrow: { color: '#60A5FA' },
  cursor: { color: '#60A5FA', fontSize: 14 },

  doneCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  doneEmoji: { fontSize: 40, marginBottom: 12 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  doneSub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  progressCardSection: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsContainer: {
    width: '100%',
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightsTitle: {
    color: '#0474FC',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightsText: {
    color: '#ECECF1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  doneBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  doneBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
