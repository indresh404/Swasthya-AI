// app/(onboarding)/medical-profile.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/config/supabase';
import { BACKEND_URL, API_VERSION } from '@/config/api';

interface QuestionDef {
  key: string;
  question: string;
  description: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  options?: string[];
}

const QUESTIONS: QuestionDef[] = [
  {
    key: 'full_name',
    question: 'What is your full name?',
    description: 'We will use this to address you on reports.',
    placeholder: 'Enter your name',
  },
  {
    key: 'age',
    question: 'How old are you?',
    description: 'Helps us analyze age-specific risk profiles.',
    placeholder: 'Enter age in years',
    keyboardType: 'numeric',
  },
  {
    key: 'gender',
    question: 'What is your gender?',
    description: 'Helps evaluate gender-specific health indices.',
    options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'],
  },
  {
    key: 'blood_group',
    question: 'What is your blood group?',
    description: 'Used for medical reports and emergency records.',
    options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'],
  },
  {
    key: 'height',
    question: 'What is your height?',
    description: 'Provide your height (e.g. 175cm or 5\'9").',
    placeholder: 'e.g. 175cm',
  },
  {
    key: 'weight',
    question: 'What is your weight?',
    description: 'Provide your weight (e.g. 70kg).',
    placeholder: 'e.g. 70kg',
  },
  {
    key: 'allergies',
    question: 'Do you have any allergies?',
    description: 'List any allergies (e.g. Penicillin, Peanuts, Dust) or type "None".',
    placeholder: 'e.g. Penicillin, Dust',
  },
  {
    key: 'current_medication',
    question: 'Current Medications',
    description: 'List medications and dosages you are currently taking regularly, or "None".',
    placeholder: 'e.g. Metformin 500mg, Amlodipine 5mg',
  },
  {
    key: 'chronic_diseases',
    question: 'Chronic Diseases',
    description: 'Do you have chronic issues (e.g. Hypertension, Diabetes, Asthma, Thyroid) or "None"?',
    placeholder: 'e.g. Diabetes, Hypertension',
  },
  {
    key: 'family_history',
    question: 'Family History',
    description: 'List any hereditary conditions (maternal/paternal sides, e.g. Heart Disease, Diabetes) or "None".',
    placeholder: 'e.g. Father: Heart Disease, Mother: Diabetes',
  },
  {
    key: 'smoking',
    question: 'Do you smoke?',
    description: 'Used for cardiovascular risk calculations.',
    options: ['Non-smoker', 'Active smoker', 'Former smoker'],
  },
  {
    key: 'alcohol',
    question: 'Do you consume alcohol?',
    description: 'Helps track health guidelines compliance.',
    options: ['Never', 'Occasionally', 'Socially', 'Regularly'],
  },
  {
    key: 'emergency_contact',
    question: 'Emergency Contact',
    description: 'Who should we contact in case of high-risk medical alerts? (Name & Phone)',
    placeholder: 'e.g. Priya Sharma (Wife) - 9876543210',
  },
];

export default function MedicalProfileScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    full_name: '',
    age: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    allergies: '',
    current_medication: '',
    chronic_diseases: '',
    family_history: '',
    smoking: '',
    alcohol: '',
    emergency_contact: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { setSessionState, user, patientId } = useAuthStore();

  const handleNext = () => {
    const key = QUESTIONS[currentStep].key;
    const val = formValues[key];

    if (!val || val.trim() === '') {
      Alert.alert('Response Required', 'Please answer the question before moving to the next step.');
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const updateVal = (text: string) => {
    const key = QUESTIONS[currentStep].key;
    setFormValues((prev) => ({ ...prev, [key]: text }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const userId = user?.id || patientId || 'demo-patient';

      const payload = {
        full_name: formValues.full_name,
        age: parseInt(formValues.age) || 0,
        gender: formValues.gender,
        blood_group: formValues.blood_group,
        height: formValues.height,
        weight: formValues.weight,
        allergies: formValues.allergies,
        current_medication: formValues.current_medication,
        chronic_diseases: formValues.chronic_diseases,
        family_history: formValues.family_history,
        smoking: formValues.smoking,
        alcohol: formValues.alcohol,
        emergency_contact: formValues.emergency_contact,
      };

      console.log('Saving profile payload to:', `${BACKEND_URL}${API_VERSION}/profile`);
      const response = await fetch(`${BACKEND_URL}${API_VERSION}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      console.log('Saved profile response:', resData);

      // Save onboarding complete in local storage and state
      setSessionState({ hasProfile: true, hasFamilyGroup: true, onboardingComplete: true });

      // Navigate to summary screen
      router.replace({
        pathname: '/(onboarding)/summary',
        params: { profileData: JSON.stringify(payload) }
      });
    } catch (e) {
      console.error('Error saving medical profile:', e);
      Alert.alert('Error Saving Profile', 'We had trouble saving your profile to the clinical server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progressPct = (currentStep + 1) / QUESTIONS.length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Onboarding</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar progress={progressPct} />
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {QUESTIONS.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.cardWrapper}>
            <QuestionCard
              question={currentQuestion.question}
              description={currentQuestion.description}
              value={formValues[currentQuestion.key]}
              onChangeText={updateVal}
              placeholder={currentQuestion.placeholder}
              keyboardType={currentQuestion.keyboardType}
              options={currentQuestion.options}
              onSelectOption={updateVal}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, isSaving && styles.disabledButton]} 
            onPress={handleNext}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.nextText}>
                  {currentStep === QUESTIONS.length - 1 ? 'Save & Complete' : 'Continue'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: 6,
  },
  progressText: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: 11,
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  cardWrapper: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#0474FC',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#1E3A8A',
  },
  nextText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
});
