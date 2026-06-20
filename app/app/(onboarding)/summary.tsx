// app/(onboarding)/summary.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { useAuthStore } from '@/store/auth.store';
import { getPatientById, getFamilyByPatientId, savePatientProfile } from '@/services/auth.service';

const { height, width } = Dimensions.get('window');

export default function SummaryScreen() {
  const params = useLocalSearchParams<{ profileData?: string }>();
  const { patientId, phoneNumber, setSessionState } = useAuthStore();

  const [userName, setUserName] = useState('Indresh');
  const [userEmail, setUserEmail] = useState('indresh@example.com');
  const [familyDetails, setFamilyDetails] = useState<{ name: string; code: string } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  let profile = {
    full_name: 'Indresh',
    age: 20,
    gender: 'Male',
    blood_group: 'O+',
    height: '175cm',
    weight: '72kg',
    allergies: 'Penicillin',
    current_medication: 'None',
    chronic_diseases: 'Migraine, Anxiety',
    family_history: 'Father - Hypertension, Mother - Diabetes',
    smoking: 'Non-smoker',
    alcohol: 'Never',
    emergency_contact: '+91 9876543210',
    surgeries: 'None',
    vaccinations: 'COVID-19 (2 doses), Tetanus',
  };

  if (params.profileData) {
    try {
      profile = { ...profile, ...JSON.parse(params.profileData) };
    } catch (e) {
      console.warn('Error parsing profileData in onboarding summary', e);
    }
  }

  useEffect(() => {
    const loadProfileData = async () => {
      if (!patientId) {
        setIsLoadingData(false);
        return;
      }
      try {
        const patient = await getPatientById(patientId);
        if (patient) {
          setUserName(patient.name || 'Indresh');
          if (patient.email) setUserEmail(patient.email);
        }

        const family = await getFamilyByPatientId(patientId);
        if (family) {
          setFamilyDetails({
            name: family.family_name || 'Indresh Family',
            code: family.join_code || '',
          });
        }
      } catch (err) {
        console.warn('Failed to load profile details in summary', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadProfileData();
  }, [patientId]);

  const handleLaunch = async () => {
    setIsSaving(true);
    try {
      await savePatientProfile({
        patientId: patientId || 'skip-user-123',
        name: userName || profile.full_name,
        age: parseInt(String(profile.age), 10) || 20,
        gender: profile.gender || 'Male',
        phone: phoneNumber || '+91 9324474812',
      });

      setSessionState({
        hasProfile: true,
      });

      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error('Error launching app from summary', err);
      Alert.alert('Configuration Error', err.message || 'Failed to save health baseline. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoadingData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0474FC" />
        <Text style={[styles.successDesc, { marginTop: 12 }]}>Syncing health record...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />

      {/* Header with Back and Continue buttons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile Summary</Text>
        
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleLaunch} 
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#0474FC', '#0284C7']}
            style={styles.continueButtonGradient}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={40} color="#10B981" />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>Profile Verified</Text>
            <Text style={styles.successDesc}>
              Your health baseline is ready to sync
            </Text>
          </View>
        </View>

        {/* Personal & Family Information */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.val}>{userName || 'Indresh'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.val} numberOfLines={1}>{userEmail || 'indresh@example.com'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.val}>{phoneNumber || '+91 9324474812'}</Text>
            </View>
            {familyDetails && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Family Group</Text>
                <Text style={styles.val} numberOfLines={1}>{familyDetails.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Baseline Metrics */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Vitals & Metrics</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Age / Gender</Text>
              <Text style={styles.val}>{profile.age} yrs • {profile.gender}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Height / Weight</Text>
              <Text style={styles.val}>{profile.height} / {profile.weight}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.val}>{profile.blood_group}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Allergies</Text>
              <Text style={styles.val} numberOfLines={1}>{profile.allergies || 'None'}</Text>
            </View>
          </View>
        </View>

        {/* Clinical Background - 3x3 Grid */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Clinical History</Text>
          <View style={styles.clinicalGrid}>
            {/* Row 1: Medications, Conditions, Surgeries */}
            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="medkit-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.clinicalLabel}>Medications</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.current_medication || 'None'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="pulse" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.clinicalLabel}>Conditions</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.chronic_diseases || 'None'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="bandage-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.clinicalLabel}>Surgeries</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.surgeries || 'None'}</Text>
            </View>

            {/* Row 2: Vaccinations, Family History, Allergies */}
            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="shield-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.clinicalLabel}>Vaccinations</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.vaccinations || 'Up to date'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="people-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.clinicalLabel}>Family History</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.family_history || 'None'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.clinicalLabel}>Allergies</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.allergies || 'None'}</Text>
            </View>

            {/* Row 3: Smoking, Alcohol, Emergency Contact */}
            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Ionicons name="warning-outline" size={20} color="#EC4899" />
              </View>
              <Text style={styles.clinicalLabel}>Smoking</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.smoking || 'Non-smoker'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(251, 146, 60, 0.15)' }]}>
                <Ionicons name="wine-outline" size={20} color="#FB923C" />
              </View>
              <Text style={styles.clinicalLabel}>Alcohol</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.alcohol || 'Never'}</Text>
            </View>

            <View style={styles.clinicalItem}>
              <View style={[styles.clinicalIcon, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                <Ionicons name="call-outline" size={20} color="#34D399" />
              </View>
              <Text style={styles.clinicalLabel}>Emergency</Text>
              <Text style={styles.clinicalVal} numberOfLines={2}>{profile.emergency_contact || 'None'}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Launch Button */}
        <TouchableOpacity
          style={[styles.launchButton, isSaving && styles.launchButtonDisabled]}
          onPress={handleLaunch}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0474FC', '#0284C7']}
            style={styles.launchButtonGradient}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.launchButtonText}>Launch Swasthya AI</Text>
                <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 8 : 52,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  successCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    marginBottom: 2,
  },
  successDesc: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  summarySection: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0474FC',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '47%',
  },
  label: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  val: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    marginTop: 2,
  },
  clinicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  clinicalItem: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  clinicalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  clinicalLabel: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_500Medium',
    fontSize: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  clinicalVal: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  launchButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  launchButtonDisabled: {
    opacity: 0.6,
  },
  launchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  launchButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});