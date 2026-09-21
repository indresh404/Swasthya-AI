// app/(tabs)/home/index.tsx
import { BodyMapVisualization3D } from '@/components/bodymap/BodyMapVisualization3D';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BodyMapCard } from '@/components/home/BodyMapCard';
import { GovernmentSchemeCard } from '@/components/home/GovernmentSchemeCard';
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonHomeScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useSegments, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { backendService } from '@/services/backend.service';
import { supabase } from '@/services/supabaseClient';
import { useAuthStore } from '@/store/auth.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import profile components
import {
  RiskScoreCard as ProfileRiskScoreCard,
  HealthGraphCard,
  AIInsightCard,
} from '@/components/profile';

// Extraction Results Modal Component
const ExtractionResultsModal = ({ visible, data, onClose, loading }: any) => {
  if (!data && !loading) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Extraction Results</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#0474FC" style={{ marginVertical: 40 }} />
            ) : (
              <>
                <Text style={styles.resultSectionTitle}>Summary</Text>
                <Text style={styles.resultText}>{data?.summary || 'No summary available.'}</Text>

                {data?.medications?.length > 0 && (
                  <>
                    <Text style={styles.resultSectionTitle}>Medications</Text>
                    {data.medications.map((med: any, i: number) => (
                      <View key={i} style={styles.resultItem}>
                        <Text style={styles.resultItemTitle}>{med.name}</Text>
                        <Text style={styles.resultItemDesc}>{med.dosage} - {med.frequency}</Text>
                      </View>
                    ))}
                  </>
                )}

                {data?.conditions?.length > 0 && (
                  <>
                    <Text style={styles.resultSectionTitle}>Detected Conditions</Text>
                    {data.conditions.map((cond: any, i: number) => (
                      <View key={i} style={styles.resultItem}>
                        <Text style={styles.resultItemTitle}>{cond.condition}</Text>
                        <Text style={styles.resultItemDesc}>Status: {cond.status}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Prediction Card
const PredictionCard = () => {
  const [idx, setIdx] = useState(0);
  const predictions = [
    { day: 'Day 3', score: 32, label: 'Low', color: '#10B981', note: 'Mild upward trend detected — maintain medication schedule.' },
    { day: 'Day 5', score: 45, label: 'Moderate', color: '#F59E0B', note: 'Fatigue pattern may resurface — monitor sleep quality.' },
    { day: 'Day 7', score: 37, label: 'Low', color: '#10B981', note: 'Trajectory stabilising. Risk score projected to plateau.' },
  ];
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % predictions.length), 3000);
    return () => clearInterval(timer);
  }, []);
  const p = predictions[idx];
  return (
    <View style={styles.predCard}>
      <View style={styles.predHeader}>
        <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
        <Text style={styles.predTitle}>AI Risk Prediction</Text>
        <View style={[styles.predBadge, { backgroundColor: p.color + '20' }]}>
          <Text style={[styles.predBadgeText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>
      <View style={styles.predBody}>
        <View style={styles.predScoreBox}>
          <Text style={[styles.predScore, { color: p.color }]}>{p.score}</Text>
          <Text style={styles.predScoreLabel}>/{p.day}</Text>
        </View>
        <Text style={styles.predNote}>{p.note}</Text>
      </View>
      <View style={styles.predDots}>
        {predictions.map((_, i) => (
          <View key={i} style={[styles.predDot, i === idx && styles.predDotActive]} />
        ))}
      </View>
    </View>
  );
};

// Watch Simulator Card Component
const WatchSimulatorCard = ({ isAbnormal, setIsAbnormal }: { isAbnormal: boolean; setIsAbnormal: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98, sys: 120, dia: 80 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAbnormal((prev: boolean) => {
        const next = !prev;
        if (next) {
          setVitals({
            hr: Math.floor(Math.random() * (140 - 120) + 120),
            spo2: Math.floor(Math.random() * (92 - 85) + 85),
            sys: Math.floor(Math.random() * (160 - 140) + 140),
            dia: Math.floor(Math.random() * (100 - 90) + 90),
          });
        } else {
          setVitals({
            hr: Math.floor(Math.random() * (85 - 65) + 65),
            spo2: Math.floor(Math.random() * (100 - 96) + 96),
            sys: Math.floor(Math.random() * (125 - 110) + 110),
            dia: Math.floor(Math.random() * (80 - 70) + 70),
          });
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.newCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBg, { backgroundColor: isAbnormal ? '#FEE2E2' : '#E0E7FF' }]}>
            <Ionicons name="watch-outline" size={20} color={isAbnormal ? '#EF4444' : '#4F46E5'} />
          </View>
          <Text style={styles.cardTitle}>Live Smartwatch Vitals</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: isAbnormal ? '#FEE2E2' : '#DCFCE7' }]}>
          <Text style={[styles.riskBadgeText, { color: isAbnormal ? '#EF4444' : '#16A34A' }]}>
            {isAbnormal ? 'Abnormal' : 'Normal'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
        <View style={styles.vitalBox}>
          <Ionicons name="heart" size={18} color={isAbnormal ? '#EF4444' : '#EF4444'} />
          <Text style={styles.vitalValue}>{vitals.hr} <Text style={styles.vitalUnit}>bpm</Text></Text>
          <Text style={styles.vitalLabel}>Heart Rate</Text>
        </View>
        <View style={styles.vitalBox}>
          <Ionicons name="water" size={18} color="#0EA5E9" />
          <Text style={styles.vitalValue}>{vitals.spo2} <Text style={styles.vitalUnit}>%</Text></Text>
          <Text style={styles.vitalLabel}>SpO2</Text>
        </View>
        <View style={styles.vitalBox}>
          <Ionicons name="fitness" size={18} color="#8B5CF6" />
          <Text style={styles.vitalValue}>{vitals.sys}/{vitals.dia}</Text>
          <Text style={styles.vitalLabel}>BP</Text>
        </View>
      </View>
    </View>
  );
};

// Family AI Summary Card
const FamilySummaryCard = ({ familyData, familyMembers }: { familyData: any; familyMembers: any[] }) => {
  if (!familyData) {
    return (
      <View style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <Ionicons name="people-outline" size={20} color="#0474FC" />
          <Text style={styles.familyTitle}>Family Health Summary</Text>
        </View>
        <Text style={styles.familyInsight}>
          You are not currently in a family group. Set up your family in the Profile tab to enable family tracking and summaries.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.familyCard}>
      <View style={styles.familyHeader}>
        <Ionicons name="people-outline" size={20} color="#0474FC" />
        <Text style={styles.familyTitle}>{familyData.family_name || 'Family'} Summary</Text>
      </View>
      <Text style={styles.familyInsight}>
        🤖 {familyData.health_summary || 'No family health summary available.'}
      </Text>
      {familyMembers.map((m, i) => {
        const getRiskColor = (risk: string) => {
          const r = risk?.toLowerCase();
          if (r === 'high' || r === 'critical') return '#EF4444';
          if (r === 'elevated' || r === 'moderate') return '#F59E0B';
          return '#10B981';
        };
        const color = getRiskColor(m.risk);
        return (
          <View key={m.id || i} style={styles.familyMemberRow}>
            <View style={[styles.familyDot, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.familyMemberLabel}>{m.name} ({m.role})</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{m.healthSummary}</Text>
            </View>
            <Text style={[styles.familyTag, { color }]}>{m.risk}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Doctor Ranking List Component
const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Smith', spec: 'Cardiologist', rating: 4.9, exp: '15 Yrs Exp' },
  { id: '2', name: 'Dr. Anil Kumar', spec: 'General Physician', rating: 4.8, exp: '12 Yrs Exp' },
  { id: '3', name: 'Dr. Emily Chen', spec: 'Endocrinologist', rating: 4.7, exp: '9 Yrs Exp' },
];

const DoctorRankingCard = ({ isAbnormal }: { isAbnormal: boolean }) => {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const doctors = [...MOCK_DOCTORS];
  if (isAbnormal) {
    doctors.sort((a, b) => (a.spec === 'Cardiologist' ? -1 : 1));
  } else {
    doctors.sort((a, b) => a.id.localeCompare(b.id));
  }

  return (
    <View style={styles.newCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{isAbnormal ? 'Recommended Specialists' : 'Top Ranked Specialists'}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.docList}>
        {doctors.map((doc, index) => {
          const isFollowed = !!followed[doc.id];
          return (
            <View key={doc.id} style={[styles.docItem, index === doctors.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.docRank}>#{index + 1}</Text>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>{doc.name.replace('Dr. ', '').charAt(0)}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docSpec}>{doc.spec} • {doc.exp}</Text>
                <View style={styles.docRating}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.docRatingValue}>{doc.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.followBtn, isFollowed && styles.followingBtn]} 
                onPress={() => toggleFollow(doc.id)}
              >
                <Text style={[styles.followBtnText, isFollowed && styles.followingBtnText]}>
                  {isFollowed ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { user, patientId } = useAuthStore();
  const { scan } = useLocalSearchParams<{ scan?: string }>();
  const [profile, setProfile] = useState<any>({ name: 'Indresh' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [bodyMapVisible, setBodyMapVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractionModalVisible, setExtractionModalVisible] = useState(false);

  const hasShownIntro = useAuthStore((state) => state.hasShownIntro);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [familyData, setFamilyData] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  // Risk factors for profile
  const riskFactors = [
    { text: 'Chronic headache history', color: '#F59E0B' },
    { text: 'High stress levels', color: '#F59E0B' },
    { text: 'Regular exercise routine', color: '#10B981' },
  ];

  // AI Summary
  const aiSummary = 
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  useEffect(() => {
    const resolvedId = user?.id || patientId;
    if (resolvedId) {
      const loadAll = async () => {
        setIsDataLoading(true);
        await Promise.all([
          fetchProfile(),
          fetchFamilyData(resolvedId)
        ]);
        setIsDataLoading(false);
      };
      loadAll();
    } else {
      setIsDataLoading(false);
    }
  }, [user, patientId]);

  useEffect(() => {
    if (scan === 'true') {
      router.setParams({ scan: undefined });
      void handleScanReport();
    }
  }, [scan]);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const resolvedId = user?.id || patientId;
      if (!resolvedId || resolvedId.startsWith('skip-') || resolvedId === 'offline-user' || resolvedId === 'offline-patient') {
        setProfile({ 
          id: resolvedId || 'skip-patient-123', 
          name: 'Indresh Suresh', 
          full_name: 'Indresh Suresh', 
          age: 20, 
          gender: 'Male', 
          phone_number: '+91 9324474812' 
        });
        setIsLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', resolvedId)
        .single();

      if (error) throw error;
      
      const mappedProfile = {
        ...data,
        name: data?.full_name || 'Indresh',
      };
      setProfile(mappedProfile);
      console.log('✅ Profile name loaded:', mappedProfile.name);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ name: 'Indresh' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchFamilyData = async (resolvedId: string) => {
    try {
      if (!resolvedId || resolvedId.startsWith('skip-') || resolvedId === 'offline-user' || resolvedId === 'offline-patient') {
        setFamilyData({
          id: 'skip-family-123',
          family_name: 'Indresh Family',
          health_summary: 'Overall family health is stable. Elders have minor chronic conditions.',
        });
        setFamilyMembers([
          {
            id: 'm_1',
            name: 'Indresh Suresh',
            role: 'Self',
            risk: 'Moderate',
            gender: 'Male',
            healthSummary: 'Baseline health is stable. Moderate anxiety or headache symptoms recorded.',
          },
          {
            id: 'm_3',
            name: 'Monish',
            role: 'Grandfather (Family)',
            risk: 'Low',
            gender: 'Male',
            healthSummary: 'Maintains healthy blood pressure. Mild age-related fatigue.',
          },
          {
            id: 'm_4',
            name: 'Divya',
            role: 'Mother (Family)',
            risk: 'Low',
            gender: 'Female',
            healthSummary: 'Regular vitamin checkups complete. No acute symptoms.',
          },
          {
            id: 'm_5',
            name: 'Ankita',
            role: 'Child (Family)',
            risk: 'Low',
            gender: 'Female',
            healthSummary: 'Healthy growth metrics, fully vaccinated.',
          }
        ]);
        return;
      }

      const { data: memberRecord } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('patient_id', resolvedId)
        .maybeSingle();

      if (memberRecord?.family_id) {
        const { data: familyGroup } = await supabase
          .from('family_groups')
          .select('id, family_name, health_summary')
          .eq('id', memberRecord.family_id)
          .single();

        if (familyGroup) {
          setFamilyData(familyGroup);
        }

        const { data: membersList } = await supabase
          .from('family_members')
          .select(`
            id,
            role,
            health_summary,
            patient:patients (
              id,
              full_name,
              gender,
              risk_level
            )
          `)
          .eq('family_id', memberRecord.family_id);

        if (membersList) {
          const formatted = membersList.map((m: any) => ({
            id: m.id || `m_${m.patient?.id}`,
            name: m.patient?.full_name || 'Family Member',
            role: m.role || 'member',
            risk: m.patient?.risk_level || 'Low',
            gender: m.patient?.gender || 'Other',
            healthSummary: m.health_summary || 'Individual health summary for this member.',
          }));
          setFamilyMembers(formatted);
        }
      } else {
        setFamilyData(null);
        setFamilyMembers([]);
      }
    } catch (err) {
      console.error('Error fetching family data on home page:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const resolvedId = user?.id || patientId;
    if (resolvedId) {
      await Promise.all([
        fetchProfile(),
        fetchFamilyData(resolvedId)
      ]);
    }
    setRefreshing(false);
  };

  const handleIntroComplete = async () => {
    useAuthStore.setState({ hasShownIntro: true });
    const resolvedId = user?.id || patientId;
    if (resolvedId) {
      try {
        await AsyncStorage.setItem(`has_shown_intro_${resolvedId}`, 'true');
      } catch (e) {
        console.error('Failed to save intro state:', e);
      }
    }
  };

  const getFirstName = () => {
    if (profile?.name) return profile.name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Indresh';
  };

  const handleScanReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setExtracting(true);
      
      const response = await backendService.extractReport(
        file.uri,
        file.name,
        file.mimeType || 'application/pdf'
      );

      setExtracting(false);
      
      if (response && response.success) {
        setExtractedData(response.data);
        setExtractionModalVisible(true);
      } else {
        Alert.alert('Extraction Failed', 'Could not extract data from the report. Please try again with a clearer document.');
      }
    } catch (error) {
      setExtracting(false);
      console.error('Scan Error:', error);
      Alert.alert('Error', 'An unexpected error occurred while scanning.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {hasShownIntro ? (
        isDataLoading ? (
          <SkeletonHomeScreen />
        ) : (
          <>
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={styles.content}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeHeader}>
                    <View style={styles.shieldIcon}>
                      <Ionicons name="shield-checkmark" size={16} color="#0474FC" />
                    </View>
                    <Text style={styles.welcomeSubtitle}>CLINICAL HEALTH ID: #SW-9431</Text>
                  </View>
                  <Text style={styles.welcomeTitle}>Welcome back, {getFirstName()}</Text>
                  <Text style={styles.welcomeDescription}>Your individualized health intelligence hub is ready</Text>
                </View>

                {/* Risk Score Card - From Profile */}
                <ProfileRiskScoreCard
                  score={58}
                  riskLevel="Moderate Risk"
                  description="Your health risk score is moderate. Regular monitoring and healthy habits are recommended."
                  factors={riskFactors}
                />

                {/* Health Graph Card - From Profile */}
                <HealthGraphCard />

                {/* AI Insights Card - From Profile */}
                <AIInsightCard summaryText={aiSummary} />

                {/* Government Scheme Card */}
                <View style={{ marginHorizontal: 16 }}>
                  <GovernmentSchemeCard />
                </View>

                {/* 3D Body Map Card */}
                <View style={{ marginHorizontal: 16 }}>
                  <BodyMapCard onPress={() => setBodyMapVisible(true)} />
                </View>

                {/* Prediction Card */}
                <PredictionCard />

                {/* Family AI Summary Card */}
                <FamilySummaryCard familyData={familyData} familyMembers={familyMembers} />

                {/* Smartwatch Simulator Area */}
                <WatchSimulatorCard isAbnormal={isAbnormal} setIsAbnormal={setIsAbnormal} />

                {/* Doctor Ranking Area */}
                <DoctorRankingCard isAbnormal={isAbnormal} />
              </View>
            </ScrollView>

            {/* Body Map Modal */}
            <BodyMapVisualization3D
              visible={bodyMapVisible}
              onClose={() => setBodyMapVisible(false)}
            />

            {/* Extraction Results Modal */}
            <ExtractionResultsModal
              visible={extractionModalVisible}
              data={extractedData}
              onClose={() => setExtractionModalVisible(false)}
              loading={extracting}
            />

            {/* Loading Indicator for Extraction */}
            {extracting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0474FC" />
                <Text style={styles.loadingText}>Analyzing Report...</Text>
              </View>
            )}
          </>
        )
      ) : (
        <ScreenIntroGate
          loaderText="Loading your health dashboard..."
          loaderDuration={2500}
          introSource={require('../../../assets/lottie_animations/heart_animation.json')}
          introText="Tracking your heartbeat and getting everything ready"
          backgroundColor="#F9FAFB"
          onIntroComplete={handleIntroComplete}
        >
          <SkeletonHomeScreen />
        </ScreenIntroGate>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  shieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(4, 116, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0474FC',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Prediction Card
  predCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderLeftWidth: 3, borderLeftColor: '#8B5CF6' },
  predHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  predTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  predBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  predBadgeText: { fontSize: 12, fontWeight: '600' },
  predBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  predScoreBox: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  predScore: { fontSize: 36, fontWeight: '800' },
  predScoreLabel: { fontSize: 13, color: '#6B7280' },
  predNote: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  predDots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  predDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  predDotActive: { backgroundColor: '#8B5CF6', width: 18 },
  // Family Card
  familyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  familyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  familyTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  familyInsight: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 12, backgroundColor: '#F0F9FF', padding: 10, borderRadius: 10 },
  familyMemberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  familyDot: { width: 10, height: 10, borderRadius: 5 },
  familyMemberLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  familyTag: { fontSize: 12, fontWeight: '700' },
  // New Card Styles
  newCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0474FC',
  },
  docList: {
    gap: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  docRank: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
    width: 24,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0474FC',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  docSpec: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  docRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  docRatingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  vitalBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  vitalUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0474FC',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 78,
    marginLeft: 8,
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followingBtnText: {
    color: '#6B7280',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0474FC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    marginBottom: 20,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  resultText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  resultItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  resultItemDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#0474FC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});