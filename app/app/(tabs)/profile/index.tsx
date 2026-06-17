// app/(tabs)/profile/index.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ProfileToggle,
  ProfileTabContent,
  FamilyTabContent,
  RiskScoreCard,
  HealthStatsCard,
  AIInsightCard,
} from '@/components/profile';

const COLORS = {
  background: '#F9FAFB',
};

// Bottom bar height + safe area
const BOTTOM_BAR_HEIGHT = 120;

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');

  // Profile data for Indresh
  const profile = {
    name: 'Indresh',
    age: 20,
    gender: 'Male',
    phone: '+91 9324474812',
    risk_level: 'Moderate',
    health_id: 'SWASTHYA-IND-2024-001',
  };

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

  // Risk factors data
  const riskFactors = [
    { text: 'Chronic headache history', color: '#F59E0B' },
    { text: 'High stress levels', color: '#F59E0B' },
    { text: 'Regular exercise routine', color: '#10B981' },
  ];

  // AI Insight summary for Indresh
  const aiSummary = 
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Toggle - Profile/Family */}
        <ProfileToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <>
            <ProfileTabContent
              profile={profile}
              qrValue={getQRValue()}
              onShareQR={handleShareQR}
              onSaveQR={handleSaveQR}
              getRiskColor={getRiskColor}
            />

            {/* Risk Score Card with Circular Gauge */}
            <RiskScoreCard
              score={58}
              riskLevel="Moderate Risk"
              description="Your health risk score is moderate. Regular monitoring and healthy habits are recommended."
              factors={riskFactors}
            />

            {/* Health Stats - 3 Horizontal Cards */}
            <HealthStatsCard
              stats={[
                { icon: 'medical-outline', label: 'Records', value: '12', color: '#E8F1FE', iconColor: '#0474FC' },
                { icon: 'fitness-outline', label: 'Symptoms', value: '5', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'medkit-outline', label: 'Medications', value: '2', color: '#ECFDF5', iconColor: '#10B981' },
              ]}
            />

            {/* AI Insights Card */}
            <AIInsightCard summaryText={aiSummary} />
          </>
        )}

        {/* Family Tab Content */}
        {activeTab === 'family' && (
          <FamilyTabContent
            familyData={{
              family_name: 'Indresh Family',
              join_code: '123321cc',
            }}
            onCopyFamilyCode={handleCopyFamilyCode}
            onSetupFamily={() => router.push('/(onboarding)/family-setup')}
            membersCount={3}
            familyRiskLevel="Low"
            getRiskColor={getRiskColor}
          />
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