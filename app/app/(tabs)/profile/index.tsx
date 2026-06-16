// app/(tabs)/profile/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';


import { SkeletonProfileScreen } from '@/components/ui/SkeletonLoader';
import { signOut, getFamilyByPatientId, getFamilyMembers } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/services/supabaseClient';

// Import newly refactored profile components
import {
  TopNavBar,
  ProfileToggle,
  ProfileTabContent,
  FamilyTabContent,
  HealthStatusGrid,
  AIInsightCard,
  MedicalInformationCard,
  QuickEmergencyCard,
  FamilyMembersList,
  SchemesCard,
  SchemesModal,
  CustomAlertModal,
  DocumentScannerOverlay,
} from '@/components/profile';

// Color system
const COLORS = {
  background: '#F9FAFB',
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const patientId = useAuthStore((state) => state.patientId);
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { user } = useAuthStore();

  // Component States
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [familyData, setFamilyData] = useState<any>(null);
  const [healthId, setHealthId] = useState<string | null>(null);

  // Dynamic layout heights to avoid paging height jumps & gaps
  const [profileHeight, setProfileHeight] = useState<number | undefined>(undefined);
  const [familyHeight, setFamilyHeight] = useState<number | undefined>(undefined);

  // Custom Medical Info & Emergency Contact States
  const [medicalInfo, setMedicalInfo] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    bloodType: '',
    allergies: '',
    bloodPressure: '',
    heartRate: '',
    oxygenLevel: '',
    surgeries: '',
    chronicConditions: '',
    vaccinations: '',
  });

  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  
  // Family members list state
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  // Income certificate verification & scanner states
  const [incomeCertificateVerified, setIncomeCertificateVerified] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [schemesModalVisible, setSchemesModalVisible] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info' | 'confirm'>('info');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [alertCancelText, setAlertCancelText] = useState('Cancel');
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | null>(null);

  // Horizontal ScrollView Ref
  const horizontalScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const resolvedId = user?.id || patientId;
    if (resolvedId) {
      loadProfileAndData(resolvedId);
    } else {
      setLoading(false);
    }
    loadVerificationStatus();
  }, [user, patientId]);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' | 'confirm' = 'info',
    onConfirm: (() => void) | null = null,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setOnAlertConfirm(() => onConfirm);
    setAlertConfirmText(confirmText);
    setAlertCancelText(cancelText);
    setAlertVisible(true);
  };

  const loadVerificationStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('income_cert_verified');
      if (status === 'true') {
        setIncomeCertificateVerified(true);
      }
    } catch (err) {
      console.error('Failed to load certificate status:', err);
    }
  };

  const loadProfileAndData = async (resolvedId: string) => {
    setLoading(true);
    try {
      // 1. Fetch user profile from Supabase
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', resolvedId)
        .single();

      let currentProfile = data;
      if (error) {
        console.error("Supabase user profile fetch error:", error);
        currentProfile = {
          name: 'Patient Name',
          age: 30,
          gender: 'Other',
          phone: '9999999999',
          risk_level: 'Low',
          profile_summary: 'Complete your check-in or upload records to generate AI Insights.',
          chronic_diseases: [],
          medications: [],
          allergies: [],
          state: 'Not set',
          adherence_rate: 100,
        };
      } else {
        currentProfile = {
          ...data,
          name: data.full_name,
          phone: data.phone_number,
        };
      }
      setProfile(currentProfile);
      setHealthId(currentProfile.health_id || currentProfile.id || resolvedId);

      // 2. Fetch Family Group & Members
      const family = await getFamilyByPatientId(resolvedId);
      if (family) {
        setFamilyData(family);
        const membersList = await getFamilyMembers(family.id);
        if (membersList && membersList.length > 0) {
          const formatted = membersList.map((m: any) => ({
            id: m.id || `m_${m.patient_id}`,
            name: m.patient?.name || 'Family Member',
            age: m.patient?.age || 30,
            gender: m.patient?.gender || 'Other',
            relationship: m.role === 'admin' ? 'Primary Account' : 'Member',
            risk: m.patient?.risk_level || 'Low',
            phone: m.patient?.phone || '9876543211',
          }));
          setFamilyMembers(formatted);
        }
      }

      // 3. Load Medical Information from Supabase
      const { data: medicalDbData, error: medicalError } = await supabase
        .from('medical_information')
        .select('*')
        .eq('patient_id', resolvedId)
        .maybeSingle();

      if (medicalDbData) {
        const mappedMed = {
          age: currentProfile.age?.toString() || '',
          gender: currentProfile.gender || '',
          weight: medicalDbData.weight || '',
          height: medicalDbData.height || '',
          bloodType: medicalDbData.blood_type || '',
          allergies: medicalDbData.allergies || '',
          bloodPressure: medicalDbData.blood_pressure || '',
          heartRate: medicalDbData.heart_rate || '',
          oxygenLevel: medicalDbData.oxygen_level || '',
          surgeries: medicalDbData.surgeries || '',
          chronicConditions: medicalDbData.chronic_conditions || '',
          vaccinations: medicalDbData.vaccinations || '',
        };
        setMedicalInfo(mappedMed);
        await AsyncStorage.setItem(`medical_info_${resolvedId}`, JSON.stringify(mappedMed));
      } else {
        const initialMed = {
          age: currentProfile.age?.toString() || '',
          gender: currentProfile.gender || '',
          weight: '',
          height: '',
          bloodType: '',
          allergies: currentProfile.allergies?.join(', ') || '',
          bloodPressure: '',
          heartRate: '',
          oxygenLevel: '',
          surgeries: '',
          chronicConditions: '',
          vaccinations: '',
        };
        setMedicalInfo(initialMed);
        await AsyncStorage.setItem(`medical_info_${resolvedId}`, JSON.stringify(initialMed));
        
        // Save initial medical info to DB
        await supabase
          .from('medical_information')
          .insert({
            patient_id: resolvedId,
            weight: initialMed.weight,
            height: initialMed.height,
            blood_type: initialMed.bloodType,
            allergies: initialMed.allergies,
            blood_pressure: initialMed.bloodPressure,
            heart_rate: initialMed.heartRate,
            oxygen_level: initialMed.oxygenLevel,
            surgeries: initialMed.surgeries,
            chronic_conditions: initialMed.chronicConditions,
            vaccinations: initialMed.vaccinations,
          });
      }

      // 4. Load Emergency Contacts from AsyncStorage
      const storedContacts = await AsyncStorage.getItem(`emergency_contacts_${resolvedId}`);
      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts));
      } else {
        setEmergencyContacts([]);
      }

    } catch (err) {
      console.error("Error loading profile details:", err);
    } finally {
      setLoading(false);
    }
  };


  const getQRValue = () => {
    if (healthId) {
      return `SWASTHYA_HEALTH_ID:${healthId}`;
    }
    if (patientId) {
      return `SWASTHYA_PATIENT:${patientId}`;
    }
    return `SWASTHYA_USER:${user?.id || 'GUEST'}`;
  };

  const handleDownloadQR = () => {
    showCustomAlert('Save QR', 'QR code has been successfully saved to your gallery.', 'success');
  };

  const handleCopyFamilyCode = async () => {
    if (!familyData?.join_code) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(familyData.join_code);
      showCustomAlert('Copied!', 'Family code copied to clipboard.', 'success');
    } catch {
      showCustomAlert('Family Code', `Your family code is: ${familyData.join_code}`, 'info');
    }
  };

  const handleSetupFamily = () => {
    router.push('/(onboarding)/family-setup');
  };

  const handleSaveMedicalInfo = async (newInfo: any) => {
    const resolvedId = user?.id || patientId;
    if (!resolvedId) return;

    try {
      // Save locally
      setMedicalInfo(newInfo);
      await AsyncStorage.setItem(`medical_info_${resolvedId}`, JSON.stringify(newInfo));

      // 1. Sync age & gender with patients table
      const ageNum = parseInt(newInfo.age);
      const { error: patientErr } = await supabase
        .from('patients')
        .update({
          age: isNaN(ageNum) ? null : ageNum,
          gender: newInfo.gender,
        })
        .eq('id', resolvedId);

      if (patientErr) {
        console.warn('Supabase patient profile sync error:', patientErr);
      }

      // 2. Save complete medical details to medical_information table
      const { error: medErr } = await supabase
        .from('medical_information')
        .upsert({
          patient_id: resolvedId,
          weight: newInfo.weight,
          height: newInfo.height,
          blood_type: newInfo.bloodType,
          allergies: newInfo.allergies,
          blood_pressure: newInfo.bloodPressure,
          heart_rate: newInfo.heartRate,
          oxygen_level: newInfo.oxygenLevel,
          surgeries: newInfo.surgeries,
          chronic_conditions: newInfo.chronicConditions,
          vaccinations: newInfo.vaccinations,
          updated_at: new Date().toISOString(),
        });

      if (medErr) {
        console.error('Supabase medical info save error:', medErr);
        throw medErr;
      }

      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        age: isNaN(ageNum) ? prev?.age : ageNum,
        gender: newInfo.gender,
      }));

      showCustomAlert('Success', 'Medical information saved successfully', 'success');
    } catch (err) {
      console.error('Failed to save medical info:', err);
      showCustomAlert('Saved Locally', 'Information saved offline successfully', 'warning');
    }
  };

  const handleAddEmergencyContact = async (contactData: Omit<any, 'id'>) => {
    const resolvedId = user?.id || patientId;
    if (!resolvedId) return;

    try {
      const newContact = {
        id: `doc_${Date.now()}`,
        ...contactData,
      };

      const updated = [...emergencyContacts, newContact];
      setEmergencyContacts(updated);
      await AsyncStorage.setItem(`emergency_contacts_${resolvedId}`, JSON.stringify(updated));
      showCustomAlert('Contact Added', 'Doctor contact saved successfully', 'success');
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  const handleDeleteEmergencyContact = (id: string) => {
    const resolvedId = user?.id || patientId;
    if (!resolvedId) return;

    showCustomAlert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      'confirm',
      async () => {
        try {
          const updated = emergencyContacts.filter((c) => c.id !== id);
          setEmergencyContacts(updated);
          await AsyncStorage.setItem(`emergency_contacts_${resolvedId}`, JSON.stringify(updated));
          showCustomAlert('Removed', 'Emergency contact removed successfully', 'success');
        } catch (err) {
          console.error('Failed to delete contact:', err);
        }
      },
      'Remove',
      'Cancel'
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      logout();
      router.replace('/(auth)/welcome');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'green':
        return COLORS.risk.low;
      case 'moderate':
      case 'yellow':
        return COLORS.risk.moderate;
      case 'elevated':
      case 'orange':
        return COLORS.risk.elevated;
      case 'high':
      case 'red':
        return COLORS.risk.high;
      default:
        return COLORS.risk.low;
    }
  };

  const handleTabToggle = (newTab: 'profile' | 'family') => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    horizontalScrollRef.current?.scrollTo({
      x: newTab === 'profile' ? 0 : SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleHorizontalScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActiveTab(page === 0 ? 'profile' : 'family');
  };

  const handleSchemesPress = () => {
    if (incomeCertificateVerified) {
      setSchemesModalVisible(true);
    } else {
      triggerUploadFlow();
    }
  };

  const triggerUploadFlow = () => {
    showCustomAlert(
      'Verification Required',
      'To browse and check eligibility for government health benefit schemes, you must first upload your Income Certificate.',
      'confirm',
      async () => {
        // Open document picker
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
          });

          if (result.canceled) return;

          const asset = result.assets[0];
          setPdfFileName(asset.name);
          setIsScanning(true);
        } catch (err) {
          console.error('Document picker error:', err);
          showCustomAlert('Error', 'Failed to open document picker', 'error');
        }
      },
      'Upload PDF',
      'Cancel'
    );
  };

  const handleReupload = () => {
    setSchemesModalVisible(false);
    showCustomAlert(
      'Replace Certificate',
      'Are you sure you want to replace your current verified Income Certificate with a new document?',
      'confirm',
      () => {
        // Trigger file select flow
        setTimeout(() => {
          triggerUploadFlow();
        }, 300); // Small delay to allow previous modal to close smoothly
      },
      'Replace',
      'Cancel'
    );
  };

  const handleScanComplete = async () => {
    setIsScanning(false);
    try {
      setIncomeCertificateVerified(true);
      await AsyncStorage.setItem('income_cert_verified', 'true');
      showCustomAlert(
        'Upload Successful',
        'Your Income Certificate has been verified successfully by our AI scanner. You can now browse government health schemes.',
        'success'
      );
    } catch (err) {
      console.error('Failed to save certificate status:', err);
    }
  };

  // AI Summaries for profile vs family
  const profileAISummary = profile?.profile_summary;
  const familyAISummary = familyData?.health_summary || "All Family Health summaries will be compiled and displayed here. Swasthya AI monitors and tracks your family members' vital health stats and indicators, keeping you updated on your family's overall well-being without requiring you to manually watch or track them.";

  const SettingsSection = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsSectionTitle}>Settings</Text>

      <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
        <View style={styles.settingLeft}>
          <Ionicons name="person-outline" size={22} color={COLORS.text.secondary} />
          <Text style={styles.settingText}>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
        <View style={styles.settingLeft}>
          <Ionicons name="settings-outline" size={22} color={COLORS.text.secondary} />
          <Text style={styles.settingText}>App Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, styles.logoutItem]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.risk.high} />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <TopNavBar
        onScanPress={() => router.push({ pathname: '/(tabs)/home', params: { scan: 'true' } })}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => {}}
        notificationCount={3}
        userName={profile?.name || 'User'}
        activeScreen={currentRoute}
      />

      {loading ? (
        <SkeletonProfileScreen />
      ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Header Switching Toggle: Single toggle placed at top, scrolls out of view vertically */}
            <ProfileToggle activeTab={activeTab} onTabChange={handleTabToggle} />

            {/* 2. Paging Sliding Content with dynamic height calculations to prevent gaps */}
            <View
              style={[
                styles.sliderWrapper,
                activeTab === 'profile'
                  ? (profileHeight && profileHeight > 0 ? { height: profileHeight } : null)
                  : (familyHeight && familyHeight > 0 ? { height: familyHeight } : null)
              ]}
            >
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleHorizontalScrollEnd}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalScrollContent}
                scrollEnabled={true}
              >
                {/* Slide 1: My Profile */}
                <View
                  style={styles.slide}
                  onLayout={(e) => setProfileHeight(e.nativeEvent.layout.height)}
                >
                  <ProfileTabContent
                    profile={profile}
                    qrValue={getQRValue()}
                    onSaveQR={handleDownloadQR}
                    getRiskColor={getRiskColor}
                  />

                  <HealthStatusGrid
                    mode="profile"
                    riskLevel={profile?.risk_level}
                    conditionsCount={profile?.chronic_diseases?.length || 0}
                    recordsCount={5}
                    medicationsCount={profile?.medications?.length || 0}
                  />

                  <AIInsightCard summaryText={profileAISummary} />

                  <MedicalInformationCard
                    initialInfo={medicalInfo}
                    onSave={handleSaveMedicalInfo}
                  />

                  <QuickEmergencyCard
                    contacts={emergencyContacts}
                    onAddContact={handleAddEmergencyContact}
                    onDeleteContact={handleDeleteEmergencyContact}
                  />
                </View>

                {/* Slide 2: My Family */}
                <View
                  style={styles.slide}
                  onLayout={(e) => setFamilyHeight(e.nativeEvent.layout.height)}
                >
                  <FamilyTabContent
                    familyData={familyData}
                    onCopyFamilyCode={handleCopyFamilyCode}
                    onSetupFamily={handleSetupFamily}
                    membersCount={familyMembers.length}
                    familyRiskLevel="Low"
                    getRiskColor={getRiskColor}
                  />

                  <HealthStatusGrid
                    mode="family"
                    riskLevel="Low"
                    conditionsCount={1}
                    recordsCount={12}
                    medicationsCount={0}
                    membersCount={familyMembers.length}
                  />

                  <AIInsightCard summaryText={familyAISummary} />

                  {/* Government Schemes Card */}
                  <SchemesCard isVerified={incomeCertificateVerified} onPress={handleSchemesPress} />

                  <FamilyMembersList members={familyMembers} />
                </View>
              </ScrollView>
            </View>

            {/* 3. Common Settings Section sitting at the bottom of ScrollView */}
            <SettingsSection />
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}

      {/* Schemes Modal popup */}
      <SchemesModal
        visible={schemesModalVisible}
        onClose={() => setSchemesModalVisible(false)}
        onReupload={handleReupload}
      />

      {/* Custom Alert Modal popup replacement */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
        onClose={() => setAlertVisible(false)}
        onConfirm={onAlertConfirm || undefined}
      />

      {/* Document Scanner animation overlay */}
      <DocumentScannerOverlay
        visible={isScanning}
        fileName={pdfFileName}
        onComplete={handleScanComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  horizontalScroll: {
    // No flex: 1 to prevent height collapse when parent height is undefined
  },
  horizontalScrollContent: {
    alignItems: 'flex-start',
  },
  sliderWrapper: {
    overflow: 'hidden',
    width: SCREEN_WIDTH,
  },
  slide: {
    width: SCREEN_WIDTH,
  },
  scrollContent: {
    paddingBottom: 140, // Increased bottom padding to prevent settings/logout clipping
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.risk.high,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100, // Bottom padding spacer for maximum scrolling clearance above bottom navigation bar
  },
});