// app/(onboarding)/summary.tsx
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export default function SummaryScreen() {
  const params = useLocalSearchParams<{ profileData?: string }>();
  
  let profile = {
    full_name: 'Rahul Kumar',
    age: 24,
    gender: 'Male',
    blood_group: 'O+',
    height: '175cm',
    weight: '70kg',
    allergies: 'None',
    current_medication: 'None',
    chronic_diseases: 'None',
    family_history: 'None',
    smoking: 'Non-smoker',
    alcohol: 'Never',
    emergency_contact: 'None',
  };

  if (params.profileData) {
    try {
      profile = { ...profile, ...JSON.parse(params.profileData) };
    } catch (e) {
      console.warn('Error parsing profileData in onboarding summary', e);
    }
  }

  const handleLaunch = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Configuration Ready</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Medical Vault Configured</Text>
          <Text style={styles.successDesc}>
            Your health baseline is now securely encrypted on our clinical servers.
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Baseline Metrics</Text>
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Patient Name</Text>
              <Text style={styles.val}>{profile.full_name}</Text>
            </View>
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
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Clinical Background</Text>

          <View style={styles.list}>
            <View style={styles.listItem}>
              <Ionicons name="warning-outline" size={18} color="#EF4444" />
              <View>
                <Text style={styles.listLabel}>Allergies</Text>
                <Text style={styles.listVal}>{profile.allergies}</Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="medkit-outline" size={18} color="#3B82F6" />
              <View>
                <Text style={styles.listLabel}>Active Medications</Text>
                <Text style={styles.listVal}>{profile.current_medication}</Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="pulse" size={18} color="#8B5CF6" />
              <View>
                <Text style={styles.listLabel}>Chronic Diseases</Text>
                <Text style={styles.listVal}>{profile.chronic_diseases}</Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="people-outline" size={18} color="#10B981" />
              <View>
                <Text style={styles.listLabel}>Family Medical History</Text>
                <Text style={styles.listVal}>{profile.family_history}</Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="call-outline" size={18} color="#F59E0B" />
              <View>
                <Text style={styles.listLabel}>Emergency Contact</Text>
                <Text style={styles.listVal}>{profile.emergency_contact}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLaunch} activeOpacity={0.8}>
          <LinearGradient
            colors={['#0474FC', '#0284C7']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Launch Swasthya AI</Text>
            <Ionicons name="rocket-outline" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  successCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  successTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: 6,
  },
  successDesc: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  summarySection: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    color: '#0474FC',
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gridItem: {
    width: '46%',
  },
  label: {
    color: COLORS.gray[500],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  val: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: 2,
  },
  list: {
    gap: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listLabel: {
    color: COLORS.gray[500],
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  listVal: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: 1,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
});
