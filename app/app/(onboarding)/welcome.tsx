// app/(onboarding)/welcome.tsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export default function WelcomeScreen() {
  const handleStart = () => {
    router.push('/(onboarding)/medical-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />
      <LinearGradient
        colors={['#07111f', '#0B1E36']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBg}>
              <Ionicons name="shield-checkmark" size={60} color="#0474FC" />
            </View>
            <Text style={styles.brandName}>Swasthya AI</Text>
            <Text style={styles.tagline}>Your Intelligent Clinical Companion</Text>
          </View>

          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Secure & Professional</Text>
            <Text style={styles.introText}>
              {"Let's configure your medical profile. This information remains secure and is used by our AI to track your symptoms, detect risk levels, and compile clinical summaries."}
            </Text>
            
            <View style={styles.features}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Dynamic symptom duration tracking</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Hereditary & history analysis</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Secure, offline-first data vault</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.8}>
            <LinearGradient
              colors={['#0474FC', '#0284C7']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Setup Medical Profile</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: SPACING.md,
  },
  brandName: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: 32,
  },
  tagline: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: 4,
  },
  introCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  introTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.xs,
  },
  introText: {
    color: COLORS.gray[300],
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  features: {
    gap: SPACING.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
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
