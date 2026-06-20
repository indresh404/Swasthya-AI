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
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const COLORS = {
  background: '#F9FAFB',
  primary: '#0474FC',
  primaryDark: '#0360D0',
  primaryLight: '#E8F1FE',
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
  divider: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
};

const BOTTOM_BAR_HEIGHT = isWeb ? 40 : 120;

// Custom Logout Alert Component
const LogoutAlert = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertGradientIcon}
              >
                <Ionicons name="log-out-outline" size={32} color="#FFFFFF" />
              </LinearGradient>
              
              <Text style={styles.alertTitle}>🚪 Logout</Text>
              <Text style={styles.alertMessage}>
                Are you sure you want to logout? You will need to login again to access your health data.
              </Text>

              <View style={styles.alertButtons}>
                <TouchableOpacity style={styles.alertCancelBtn} onPress={onCancel}>
                  <Text style={styles.alertCancelText}>Stay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.alertConfirmBtn} onPress={onConfirm}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.alertConfirmGradient}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.alertConfirmText}>Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Custom Delete Contact Alert Component
const DeleteContactAlert = ({ visible, name, onConfirm, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertGradientIcon}
              >
                <Ionicons name="trash-outline" size={32} color="#FFFFFF" />
              </LinearGradient>
              
              <Text style={styles.alertTitle}>🗑️ Remove Contact</Text>
              <Text style={styles.alertMessage}>
                Are you sure you want to remove "{name}" from emergency contacts?
              </Text>

              <View style={styles.alertButtons}>
                <TouchableOpacity style={styles.alertCancelBtn} onPress={onCancel}>
                  <Text style={styles.alertCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.alertConfirmBtn} onPress={onConfirm}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.alertConfirmGradient}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.alertConfirmText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Custom Success Alert Component
const SuccessAlert = ({ visible, title, message, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onConfirm}>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <LinearGradient
                colors={[COLORS.success, '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertGradientIcon}
              >
                <Ionicons name="checkmark-outline" size={32} color="#FFFFFF" />
              </LinearGradient>
              
              <Text style={styles.alertTitle}>{title}</Text>
              <Text style={styles.alertMessage}>{message}</Text>

              <TouchableOpacity style={styles.alertSingleBtn} onPress={onConfirm}>
                <LinearGradient
                  colors={[COLORS.success, '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.alertSingleGradient}
                >
                  <Text style={styles.alertConfirmText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState('');
  const [deleteContactName, setDeleteContactName] = useState('');
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 'doc_1', name: 'Dr. Satish Gupta', specialty: 'Cardiologist', phone: '+91 98765 43210' },
    { id: 'doc_2', name: 'Dr. Priya Sharma', specialty: 'Neurologist', phone: '+91 98765 43211' },
  ]);

  const familyMembers = [
    { 
      id: 'm_1', 
      name: 'Indresh', 
      age: 20, 
      relationship: 'Father', 
      risk: 'Moderate', 
      phone: '+91 9324474812' 
    },
    { 
      id: 'm_2', 
      name: 'Monish', 
      age: 65, 
      relationship: 'Grandfather', 
      risk: 'Low', 
      phone: '+91 9372962545' 
    },
    { 
      id: 'm_3', 
      name: 'Divya', 
      age: 42, 
      relationship: 'Mother', 
      risk: 'Low', 
      phone: '+91 7559302315' 
    },
    { 
      id: 'm_4', 
      name: 'Ankita', 
      age: 10, 
      relationship: 'Child', 
      risk: 'Low', 
      phone: '+91 9970206614' 
    },
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

  const handleAddEmergencyContact = (contact: any) => {
    const newContact = {
      id: `doc_${Date.now()}`,
      ...contact,
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
    showSuccessAlert('✅ Contact Added', `"${contact.name}" has been added to emergency contacts`);
  };

  const showDeleteAlert = (id: string, name: string) => {
    setDeleteContactId(id);
    setDeleteContactName(name);
    setDeleteAlertVisible(true);
  };

  const handleDeleteEmergencyContact = () => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== deleteContactId));
    setDeleteAlertVisible(false);
    showSuccessAlert('✅ Contact Removed', `"${deleteContactName}" has been removed from emergency contacts`);
  };

  const showSuccessAlert = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessAlertVisible(true);
  };

  const showLogoutAlert = () => {
    setLogoutAlertVisible(true);
  };

  const handleLogout = () => {
    setLogoutAlertVisible(false);
    console.log('Logging out...');
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
    "Swasthya AI has analyzed your family health patterns. Your family shows overall stable health trends with some shared symptoms. Your grandfather has mild age-related concerns, while your mother and child are in good health. Regular family health monitoring is recommended. Family adherence rate is 82%.";

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
          <View key="profile-content" style={styles.contentWrapper}>
            {/* 1. Profile Header with QR */}
            <ProfileTabContent
              profile={profile}
              qrValue={getQRValue()}
              onShareQR={handleShareQR}
              onSaveQR={handleSaveQR}
              getRiskColor={getRiskColor}
            />

            {/* 2. Risk Score */}
            <RiskScoreCard
              score={58}
              riskLevel="Moderate Risk"
              description="Your health risk score is moderate. Regular monitoring and healthy habits are recommended."
              factors={profileRiskFactors}
            />

            {/* 3. Health Stats */}
            <HealthStatsCard
              stats={[
                { icon: 'medical-outline', label: 'Records', value: '12', color: '#E8F1FE', iconColor: '#0474FC' },
                { icon: 'fitness-outline', label: 'Symptoms', value: '5', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'medkit-outline', label: 'Medications', value: '2', color: '#ECFDF5', iconColor: '#10B981' },
              ]}
            />

            {/* 4. Health Network Graph */}
            <HealthGraphCard />

            {/* 5. AI Insight */}
            <AIInsightCard summaryText={aiSummary} />

            {/* 6. Medical Information */}
            <MedicalInformationCard initialInfo={medicalInfo} onSave={handleSaveMedicalInfo} />

            {/* 7. Emergency Contacts */}
            <QuickEmergencyCard
              contacts={emergencyContacts}
              onAddContact={handleAddEmergencyContact}
              onDeleteContact={showDeleteAlert}
            />
          </View>
        ) : (
          <View key="family-content" style={styles.contentWrapper}>
            {/* 1. Family Header with QR */}
            <FamilyTabContent
              familyData={{ family_name: 'Indresh Family', join_code: '123321cc' }}
              onCopyFamilyCode={handleCopyFamilyCode}
              onSetupFamily={() => router.push('/(onboarding)/family-setup')}
              membersCount={4}
              familyRiskLevel="Moderate"
              getRiskColor={getRiskColor}
            />

            {/* 2. Risk Score */}
            <RiskScoreCard
              score={45}
              riskLevel="Moderate Risk"
              description="Your family health risk score is moderate. Shared symptoms and genetic factors are being monitored."
              factors={familyRiskFactors}
            />

            {/* 3. Health Stats */}
            <HealthStatsCard
              stats={[
                { icon: 'people-outline', label: 'Members', value: '4', color: '#E0E7FF', iconColor: '#4F46E5' },
                { icon: 'fitness-outline', label: 'Conditions', value: '4', color: '#FEE2E2', iconColor: '#EF4444' },
                { icon: 'document-text-outline', label: 'Records', value: '18', color: '#E8F1FE', iconColor: '#0474FC' },
              ]}
            />

            {/* 4. Family Members List */}
            <FamilyMembersList members={familyMembers} />

            {/* 5. AI Insight */}
            <AIInsightCard summaryText={familyAISummary} />
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={showLogoutAlert}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Logout Alert */}
      <LogoutAlert
        visible={logoutAlertVisible}
        onConfirm={handleLogout}
        onCancel={() => setLogoutAlertVisible(false)}
      />

      {/* Delete Contact Alert */}
      <DeleteContactAlert
        visible={deleteAlertVisible}
        name={deleteContactName}
        onConfirm={handleDeleteEmergencyContact}
        onCancel={() => setDeleteAlertVisible(false)}
      />

      {/* Success Alert */}
      <SuccessAlert
        visible={successAlertVisible}
        title={successTitle}
        message={successMessage}
        onConfirm={() => setSuccessAlertVisible(false)}
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
  contentContainer: {
    paddingBottom: 30,
  },
  contentWrapper: {
    paddingHorizontal: isWeb ? Math.max(16, (SCREEN_WIDTH - 600) / 2) : 0,
    maxWidth: isWeb ? 600 : undefined,
    alignSelf: isWeb ? 'center' : undefined,
    width: '100%',
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
    marginHorizontal: isWeb ? Math.max(16, (SCREEN_WIDTH - 600) / 2) : 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    maxWidth: isWeb ? 600 : undefined,
    alignSelf: isWeb ? 'center' : undefined,
    width: isWeb ? '100%' : undefined,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  alertGradientIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  alertCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  alertConfirmBtn: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  alertConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertSingleBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertSingleGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});