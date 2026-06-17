// app/(tabs)/profile/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  Share,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import all components
import {
  ProfileToggle,
  ProfileTabContent,
  FamilyTabContent,
  RiskScoreCard,
  HealthStatsCard,
  AIInsightCard,
  HealthGraphCard,
  MedicalInformationCard,
  QuickEmergencyCard,
  FamilyMembersList,
} from '@/components/profile';

const COLORS = {
  background: '#F9FAFB',
};

const BOTTOM_BAR_HEIGHT = 120;

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeTab]);

  // Profile data
  const profile = {
    name: 'Indresh',
    age: 20,
    gender: 'Male',
    phone: '+91 9324474812',
    risk_level: 'Moderate',
    health_id: 'SWASTHYA-IND-2024-001',
  };

  const [medicalInfo] = useState({
    age: '20',
    gender: 'Male',
    weight: '72',
    height: '175',
    bloodType: 'O+',
    allergies: 'Penicillin',
    bloodPressure: '120/80',
    heartRate: '72',
    oxygenLevel: '98',
    surgeries: 'None',
    chronicConditions: 'Migraine, Anxiety',
    vaccinations: 'COVID-19, Tetanus',
  });

  const emergencyContacts = [
    { id: 'doc_1', name: 'Dr. Satish Gupta', specialty: 'Cardiologist', phone: '+91 98765 43210' },
    { id: 'doc_2', name: 'Dr. Priya Sharma', specialty: 'Neurologist', phone: '+91 98765 43211' },
  ];

  const familyMembers = [
    { id: 'm_1', name: 'Raj Kumar', age: 45, relationship: 'Father', risk: 'Moderate', phone: '+91 98765 43212' },
    { id: 'm_2', name: 'Priya', age: 22, relationship: 'Sister', risk: 'Low', phone: '+91 98765 43213' },
    { id: 'm_3', name: 'Sunita', age: 42, relationship: 'Mother', risk: 'Low', phone: '+91 98765 43214' },
  ];

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `My Health ID: ${profile.health_id} - Scan to view medical summary`,
        title: 'Share Health ID',
      });
    } catch {
      console.log('Could not share QR code');
    }
  };

  const handleSaveQR = () => console.log('QR saved');

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'elevated': return '#F97316';
      case 'high': return '#EF4444';
      default: return '#10B981';
    }
  };

  const getQRValue = () => `SWASTHYA_HEALTH_ID:${profile.health_id}`;

  const handleCopyFamilyCode = () => console.log('Family code copied');
  const handleSaveMedicalInfo = (info: any) => console.log('Medical info saved:', info);
  const handleAddEmergencyContact = (contact: any) => console.log('Add contact:', contact);

  const handleDeleteEmergencyContact = (id: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => console.log('Delete:', id) },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logging out...') },
      ]
    );
  };

  const profileRiskFactors = [
    { text: 'Chronic headache history', color: '#F59E0B' },
    { text: 'High stress levels', color: '#F59E0B' },
    { text: 'Regular exercise routine', color: '#10B981' },
  ];

  const familyRiskFactors = [
    { text: 'Family hypertension history', color: '#F59E0B' },
    { text: 'Shared headache patterns', color: '#F59E0B' },
    { text: 'Regular family check-ups', color: '#10B981' },
  ];

  const aiSummary =
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  const familyAISummary =
    "Swasthya AI has analyzed your family health patterns. Your family shows overall stable health trends with some shared symptoms. Your father has elevated blood pressure risks, while your sister shares similar headache patterns. Regular family health monitoring is recommended. Family adherence rate is 78%.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' ? (
          <View key="profile-content">
            <ProfileTabContent
              profile={profile}
              qrValue={getQRValue()}
              onShareQR={handleShareQR}
              onSaveQR={handleSaveQR}
              getRiskColor={getRiskColor}
            />

            <RiskScoreCard
              score={58}
              riskLevel="Moderate Risk"
              description="Your health risk score is moderate. Regular monitoring and healthy habits are recommended."
              factors={profileRiskFactors}
            />

            <HealthStatsCard
              stats={[
                { icon: 'medical-outline', label: 'Records', value: '12', color: '#E8F1FE', iconColor: '#0474FC' },
                { icon: 'fitness-outline', label: 'Symptoms', value: '5', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'medkit-outline', label: 'Medications', value: '2', color: '#ECFDF5', iconColor: '#10B981' },
              ]}
            />

            <MedicalInformationCard initialInfo={medicalInfo} onSave={handleSaveMedicalInfo} />

            <QuickEmergencyCard
              contacts={emergencyContacts}
              onAddContact={handleAddEmergencyContact}
              onDeleteContact={handleDeleteEmergencyContact}
            />

            <HealthGraphCard />

            <AIInsightCard summaryText={aiSummary} />
          </View>
        ) : (
          <View key="family-content">
            <FamilyTabContent
              familyData={{ family_name: 'Indresh Family', join_code: '123321cc' }}
              onCopyFamilyCode={handleCopyFamilyCode}
              onSetupFamily={() => router.push('/(onboarding)/family-setup')}
              membersCount={3}
              familyRiskLevel="Moderate"
              getRiskColor={getRiskColor}
            />

            <RiskScoreCard
              score={45}
              riskLevel="Moderate Risk"
              description="Your family health risk score is moderate. Shared symptoms and genetic factors are being monitored."
              factors={familyRiskFactors}
            />

            <HealthStatsCard
              stats={[
                { icon: 'people-outline', label: 'Members', value: '3', color: '#E0E7FF', iconColor: '#4F46E5' },
                { icon: 'fitness-outline', label: 'Conditions', value: '4', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'document-text-outline', label: 'Records', value: '18', color: '#E8F1FE', iconColor: '#0474FC' },
              ]}
            />

            <FamilyMembersList members={familyMembers} />

            <AIInsightCard summaryText={familyAISummary} />
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  contentContainer: {
    paddingBottom: 30,
  },
  bottomSpacer: {
    height: BOTTOM_BAR_HEIGHT,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});