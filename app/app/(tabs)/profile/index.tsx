// app/(tabs)/profile/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';

// Direct imports
import { ProfileToggle } from '@/components/profile/ProfileToggle';
import { ProfileTabContent } from '@/components/profile/ProfileTabContent';
import { FamilyTabContent } from '@/components/profile/FamilyTabContent';
import { RiskScoreCard } from '@/components/profile/RiskScoreCard';
import { HealthStatsCard } from '@/components/profile/HealthStatsCard';
import { AIInsightCard } from '@/components/profile/AIInsightCard';
import { HealthGraphCard } from '@/components/profile/HealthGraphCard';
import { MedicalInformationCard } from '@/components/profile/MedicalInformationCard';

const COLORS = {
  background: '#F9FAFB',
};

// Bottom bar height + safe area
const BOTTOM_BAR_HEIGHT = 120;

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [activeTab]);

  // Profile data for Indresh
  const profile = {
    name: 'Indresh',
    age: 20,
    gender: 'Male',
    phone: '+91 9324474812',
    risk_level: 'Moderate',
    health_id: 'SWASTHYA-IND-2024-001',
  };

  // Medical Information for Indresh
  const [medicalInfo, setMedicalInfo] = useState({
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

  const handleSaveQR = () => {
    console.log('QR saved');
  };

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

  const handleCopyFamilyCode = () => {
    console.log('Family code copied');
  };

  const handleSaveMedicalInfo = (info: any) => {
    setMedicalInfo(info);
    console.log('Medical info saved:', info);
  };

  // Risk factors data for Profile
  const profileRiskFactors = [
    { text: 'Chronic headache history', color: '#F59E0B' },
    { text: 'High stress levels', color: '#F59E0B' },
    { text: 'Regular exercise routine', color: '#10B981' },
  ];

  // Risk factors data for Family
  const familyRiskFactors = [
    { text: 'Family hypertension history', color: '#F59E0B' },
    { text: 'Shared headache patterns', color: '#F59E0B' },
    { text: 'Regular family check-ups', color: '#10B981' },
  ];

  // AI Insight summary for Indresh (Profile)
  const aiSummary = 
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  // AI Insight summary for Family
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
        {/* Profile Toggle - Profile/Family */}
        <ProfileToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <View key="profile-content">
            <ProfileTabContent
              profile={profile}
              qrValue={getQRValue()}
              onShareQR={handleShareQR}
              onSaveQR={handleSaveQR}
              getRiskColor={getRiskColor}
            />

            {/* Risk Score Card with Circular Gauge - Profile */}
            <RiskScoreCard
              key="profile-risk"
              score={58}
              riskLevel="Moderate Risk"
              description="Your health risk score is moderate. Regular monitoring and healthy habits are recommended."
              factors={profileRiskFactors}
            />

            {/* Health Stats - 3 Horizontal Cards */}
            <HealthStatsCard
              stats={[
                { icon: 'medical-outline', label: 'Records', value: '12', color: '#E8F1FE', iconColor: '#0474FC' },
                { icon: 'fitness-outline', label: 'Symptoms', value: '5', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'medkit-outline', label: 'Medications', value: '2', color: '#ECFDF5', iconColor: '#10B981' },
              ]}
            />

            {/* Medical Information Card */}
            <MedicalInformationCard
              initialInfo={medicalInfo}
              onSave={handleSaveMedicalInfo}
            />

            {/* Health Graph Card */}
            <HealthGraphCard />

            {/* AI Insights Card - Profile */}
            <AIInsightCard key="profile-ai" summaryText={aiSummary} />
          </View>
        )}

        {/* Family Tab Content */}
        {activeTab === 'family' && (
          <View key="family-content">
            <FamilyTabContent
              familyData={{
                family_name: 'Indresh Family',
                join_code: '123321cc',
              }}
              onCopyFamilyCode={handleCopyFamilyCode}
              onSetupFamily={() => router.push('/(onboarding)/family-setup')}
              membersCount={3}
              familyRiskLevel="Moderate"
              getRiskColor={getRiskColor}
            />

            {/* Risk Score Card with Circular Gauge - Family */}
            <RiskScoreCard
              key="family-risk"
              score={45}
              riskLevel="Moderate Risk"
              description="Your family health risk score is moderate. Shared symptoms and genetic factors are being monitored."
              factors={familyRiskFactors}
            />

            {/* Family Health Stats */}
            <HealthStatsCard
              stats={[
                { icon: 'people-outline', label: 'Members', value: '3', color: '#E0E7FF', iconColor: '#4F46E5' },
                { icon: 'fitness-outline', label: 'Conditions', value: '4', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'document-text-outline', label: 'Records', value: '18', color: '#E8F1FE', iconColor: '#0474FC' },
              ]}
            />

            {/* AI Insights Card - Family */}
            <AIInsightCard key="family-ai" summaryText={familyAISummary} />
          </View>
        )}

        {/* Extra bottom padding spacer */}
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
});