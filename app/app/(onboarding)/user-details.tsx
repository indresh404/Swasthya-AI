import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentPatient, normalizePhone } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { CustomAlertModal } from '@/components/profile/CustomAlertModal';

import { COLORS, STYLES } from '../../constants/Colors';
import { supabase } from '@/services/supabaseClient';
export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { patientId, phoneNumber: storedPhone } = useAuthStore();

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info' | 'confirm'>('info');
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' | 'confirm' = 'info',
    onConfirm: (() => void) | null = null
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setOnAlertConfirm(() => onConfirm);
    setAlertVisible(true);
  };

  // UI states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Refs for input focus management
  const ageInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  const weightInputRef = useRef<TextInput>(null);
  const heightInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const initialPhone = normalizePhone(params.phone || storedPhone || '');
    if (initialPhone) {
      setPhoneNumber(initialPhone);
    }

    const hydrateExistingProfile = async () => {
      try {
        const patient = patientId ? await getCurrentPatient() : null;
        if (!patient) return;

        setName(patient.name || '');
        setAge(patient.age ? String(patient.age) : '');
        setPhoneNumber(patient.phone || initialPhone);
        setGender(patient.gender || null);

        // Fetch weight and height from medical_information
        const { data: medData } = await supabase
          .from('medical_information')
          .select('weight, height')
          .eq('patient_id', patient.id)
          .maybeSingle();

        if (medData) {
          setWeight(medData.weight || '');
          setHeight(medData.height || '');
        }
      } catch (error) {
        console.error('Failed to hydrate patient profile', error);
      }
    };

    void hydrateExistingProfile();
  }, [params.phone, patientId, storedPhone]);

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showAlert(
          'Permission Required',
          'Please enable location permissions to automatically detect your location.',
          'warning'
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationParts = [];

        if (address.city) locationParts.push(address.city);
        if (address.district) locationParts.push(address.district);
        if (address.region) locationParts.push(address.region);

        const locationString = locationParts.join(', ');

        if (locationString) {
          setLocation(locationString);
          // Clear location error if any
          if (errors.location) {
            setErrors({ ...errors, location: '' });
          }
        } else {
          showAlert('Info', 'Could not determine your city/region. Please enter manually.', 'info');
        }
      } else {
        showAlert('Info', 'Could not determine your location. Please enter manually.', 'info');
      }
    } catch (error) {
      console.error('Location error:', error);
      showAlert(
        'Location Error',
        'Unable to get your location. Please check your GPS and try again, or enter manually.',
        'error'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Check if Google user
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const checkUserProvider = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.app_metadata?.provider === 'google' || !session?.user?.phone) {
          setIsGoogleUser(true);
        }
      } catch {}
    };
    checkUserProvider();
  }, []);

  // Validate individual field
  const validateField = (fieldName: string, value: string | null) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value?.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.name = 'Name must be less than 50 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'age':
        if (!value?.trim()) {
          newErrors.age = 'Age is required';
        } else {
          const ageNum = parseInt(value);
          if (isNaN(ageNum)) {
            newErrors.age = 'Please enter a valid number';
          } else if (ageNum < 1 || ageNum > 120) {
            newErrors.age = 'Please enter a valid age (1-120)';
          } else {
            delete newErrors.age;
          }
        }
        break;

      case 'phoneNumber':
        if (isGoogleUser && !value?.trim()) {
          delete newErrors.phoneNumber;
        } else if (!value?.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value.trim())) {
            newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
          } else {
            delete newErrors.phoneNumber;
          }
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = 'Please select your gender';
        } else {
          delete newErrors.gender;
        }
        break;

      case 'location':
        if (!value?.trim()) {
          newErrors.location = 'Location is required';
        } else if (value.trim().length < 2) {
          newErrors.location = 'Please enter a valid location';
        } else {
          delete newErrors.location;
        }
        break;

      case 'weight':
        if (!value?.trim()) {
          newErrors.weight = 'Weight is required';
        } else {
          const wNum = parseFloat(value);
          if (isNaN(wNum)) {
            newErrors.weight = 'Please enter a valid weight';
          } else if (wNum < 10 || wNum > 300) {
            newErrors.weight = 'Weight must be between 10 and 300 kg';
          } else {
            delete newErrors.weight;
          }
        }
        break;

      case 'height':
        if (!value?.trim()) {
          newErrors.height = 'Height is required';
        } else {
          const hNum = parseInt(value);
          if (isNaN(hNum)) {
            newErrors.height = 'Please enter a valid height';
          } else if (hNum < 50 || hNum > 250) {
            newErrors.height = 'Height must be between 50 and 250 cm';
          } else {
            delete newErrors.height;
          }
        }
        break;
    }

    setErrors(newErrors);
  };

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Age validation
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
        newErrors.age = 'Please enter a valid number';
      } else if (ageNum < 1 || ageNum > 120) {
        newErrors.age = 'Please enter a valid age (1-120)';
      }
    }

    // Phone number validation
    if (isGoogleUser && !phoneNumber.trim()) {
      // Optional for Google users
    } else if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
    }

    // Gender validation
    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Location validation
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    } else if (location.trim().length < 2) {
      newErrors.location = 'Please enter a valid location';
    }

    // Weight validation
    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else {
      const wNum = parseFloat(weight);
      if (isNaN(wNum) || wNum < 10 || wNum > 300) {
        newErrors.weight = 'Weight must be between 10 and 300 kg';
      }
    }

    // Height validation
    if (!height.trim()) {
      newErrors.height = 'Height is required';
    } else {
      const hNum = parseInt(height);
      if (isNaN(hNum) || hNum < 50 || hNum > 250) {
        newErrors.height = 'Height must be between 50 and 250 cm';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    showAlert(
      'Exit Onboarding',
      'Are you sure you want to go back? This will sign you out.',
      'confirm',
      () => {
        const authStore = useAuthStore.getState();
        authStore.logout();
        router.replace('/(auth)/login');
      }
    );
  };

  const handleContinue = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      age: true,
      phoneNumber: true,
      gender: true,
      location: true
    });

    if (validateForm()) {
      saveProfile();
    }
  };


  const saveProfile = async () => {
    const authStore = useAuthStore.getState();
    const resolvedId = authStore.userId || patientId;

    if (!resolvedId) {
      showAlert('Error', 'Session expired. Please log in again.', 'error');
      return;
    }

    const userPhone = phoneNumber ? normalizePhone(phoneNumber) : null;
    if (!isGoogleUser && !userPhone) {
      showAlert('Error', 'Invalid phone number', 'error');
      return;
    }

    setIsSaving(true);
    try {
      console.log('=== Saving User Profile ===');
      console.log('Id:', resolvedId, 'Phone:', userPhone, 'Name:', name, 'Age:', age, 'Gender:', gender);

      // Upsert user profile to Supabase
      const profilePayload = {
        id: resolvedId,
        full_name: name.trim(),
        age: parseInt(age),
        phone_number: userPhone || null,
        gender: gender,
        location: location.trim(),
      };

      const { data, error } = await supabase
        .from('patients')
        .upsert(profilePayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }

      const savedData = data || profilePayload;

      // Upsert medical details to Supabase
      const { error: medError } = await supabase
        .from('medical_information')
        .upsert({
          patient_id: resolvedId,
          weight: weight.trim(),
          height: height.trim(),
          updated_at: new Date().toISOString(),
        });

      if (medError) {
        console.error('Supabase medical details upsert error:', medError);
        throw medError;
      }

      // Check if user is part of a family group
      const { getFamilyByPatientId } = require('@/services/auth.service');
      const family = await getFamilyByPatientId(resolvedId);

      // Update auth store with resolved details
      authStore.setSessionState({
        userId: resolvedId,
        patientId: resolvedId,
        phoneNumber: userPhone || null,
        isLoggedIn: true,
        hasProfile: true,
        hasFamilyGroup: Boolean(family),
      });

      // Save user session for persistence
      const { saveUserSession } = await import('@/services/auth.service');
      await saveUserSession(userPhone || '', resolvedId);

      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

      // Save patient profile payload to AsyncStorage
      await AsyncStorage.setItem(`user_profile_${resolvedId}`, JSON.stringify(savedData));
      if (userPhone) {
        await AsyncStorage.setItem(`user_profile_${userPhone}`, JSON.stringify(savedData));
      }

      // Save complete medical details to AsyncStorage locally (so Profile tab gets it instantly)
      const mappedMed = {
        age: age.toString(),
        gender: gender,
        weight: weight.trim(),
        height: height.trim(),
        bloodType: '',
        allergies: '',
        bloodPressure: '',
        heartRate: '',
        oxygenLevel: '',
        surgeries: '',
        chronicConditions: '',
        vaccinations: '',
      };
      await AsyncStorage.setItem(`medical_info_${resolvedId}`, JSON.stringify(mappedMed));

      console.log('Profile saved successfully, user ID:', resolvedId);
      setIsSaving(false);
      router.push('/(onboarding)/family-setup');
    } catch (error: any) {
      console.error('Save profile error:', error);
      showAlert('Error', error.message || 'An unexpected error occurred while saving your profile', 'error');
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    const phoneValid = isGoogleUser 
      ? (!phoneNumber.trim() || normalizePhone(phoneNumber).length === 10)
      : (phoneNumber.trim() && normalizePhone(phoneNumber).length === 10);

    return name.trim() &&
      age.trim() &&
      phoneValid &&
      gender &&
      location.trim() &&
      weight.trim() &&
      height.trim() &&
      !errors.name &&
      !errors.age &&
      !errors.phoneNumber &&
      !errors.gender &&
      !errors.location &&
      !errors.weight &&
      !errors.height;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text?.primary || '#1F2937'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Swasthya AI</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Progress Bar */}
          <View style={styles.topBar}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: '66%' }]} />
            </View>
            <Text style={styles.stepText}>Step 2 of 3</Text>
          </View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.subtitle}>
              This helps us personalise your health monitoring experience
            </Text>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formContainer}>

            {/* Full Name Field */}
            <View>
              <Text style={styles.label}>Full Name</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'name' && styles.inputContainerFocused,
                touched.name && errors.name && styles.inputContainerError
              ]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.text.muted}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setTouched({ ...touched, name: true });
                    validateField('name', text);
                  }}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => ageInputRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Age Field */}
            <View>
              <Text style={styles.label}>Age</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'age' && styles.inputContainerFocused,
                touched.age && errors.age && styles.inputContainerError
              ]}>
                <TextInput
                  ref={ageInputRef}
                  style={styles.textInput}
                  placeholder="Enter your age"
                  placeholderTextColor={COLORS.text.muted}
                  value={age}
                  onChangeText={(text) => {
                    setAge(text);
                    setTouched({ ...touched, age: true });
                    validateField('age', text);
                  }}
                  keyboardType="number-pad"
                  onFocus={() => setFocusedInput('age')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  maxLength={3}
                />
              </View>
              {touched.age && errors.age && (
                <Text style={styles.errorText}>{errors.age}</Text>
              )}
            </View>

            {/* Phone Number Field */}
            <View>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'phoneNumber' && styles.inputContainerFocused,
                touched.phoneNumber && errors.phoneNumber && styles.inputContainerError
              ]}>
                <TextInput
                  ref={phoneInputRef}
                  style={styles.textInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={COLORS.text.muted}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(normalizePhone(text));
                    setTouched({ ...touched, phoneNumber: true });
                    validateField('phoneNumber', normalizePhone(text));
                  }}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phoneNumber')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => locationInputRef.current?.focus()}
                  maxLength={10}
                />
              </View>
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* Gender Field */}
            <View>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderPill,
                      gender === g && styles.genderPillSelected,
                      touched.gender && errors.gender && !gender && styles.genderPillError
                    ]}
                    onPress={() => {
                      setGender(g);
                      const newTouched = { ...touched, gender: true };
                      setTouched(newTouched);
                      validateField('gender', g);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.genderPillText,
                      gender === g && styles.genderPillTextSelected
                    ]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {touched.gender && errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

            {/* Location Field */}
            <View>
              <Text style={styles.label}>Location</Text>
              <View style={[
                styles.locationWrapper,
                focusedInput === 'location' && styles.inputContainerFocused,
                touched.location && errors.location && styles.inputContainerError
              ]}>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    ref={locationInputRef}
                    style={[styles.textInput, styles.locationInput]}
                    placeholder="Location"
                    placeholderTextColor={COLORS.text.muted}
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      setTouched({ ...touched, location: true });
                      validateField('location', text);
                    }}
                    onFocus={() => setFocusedInput('location')}
                    onBlur={() => {
                      setFocusedInput(null);
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => weightInputRef.current?.focus()}
                  />
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                    disabled={isLoadingLocation}
                    activeOpacity={0.7}
                  >
                    {isLoadingLocation ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.locationButtonText}>📍</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {touched.location && errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
              <Text style={styles.locationHint}>
                Tap the 📍 button to automatically detect your current location
              </Text>
            </View>

            {/* Weight & Height Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Weight (kg)</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'weight' && styles.inputContainerFocused,
                  touched.weight && errors.weight && styles.inputContainerError
                ]}>
                  <TextInput
                    ref={weightInputRef}
                    style={styles.textInput}
                    placeholder="e.g. 70"
                    placeholderTextColor={COLORS.text.muted}
                    value={weight}
                    onChangeText={(text) => {
                      setWeight(text);
                      setTouched({ ...touched, weight: true });
                      validateField('weight', text);
                    }}
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput('weight')}
                    onBlur={() => setFocusedInput(null)}
                    returnKeyType="next"
                    onSubmitEditing={() => heightInputRef.current?.focus()}
                    maxLength={5}
                  />
                </View>
                {touched.weight && errors.weight && (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Height (cm)</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'height' && styles.inputContainerFocused,
                  touched.height && errors.height && styles.inputContainerError
                ]}>
                  <TextInput
                    ref={heightInputRef}
                    style={styles.textInput}
                    placeholder="e.g. 175"
                    placeholderTextColor={COLORS.text.muted}
                    value={height}
                    onChangeText={(text) => {
                      setHeight(text);
                      setTouched({ ...touched, height: true });
                      validateField('height', text);
                    }}
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput('height')}
                    onBlur={() => setFocusedInput(null)}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                    maxLength={3}
                  />
                </View>
                {touched.height && errors.height && (
                  <Text style={styles.errorText}>{errors.height}</Text>
                )}
              </View>
            </View>

          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                STYLES?.shadowPrimary,
                !isFormValid() && styles.primaryButtonDisabled
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isFormValid() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.white || '#FFFFFF'} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        onConfirm={onAlertConfirm || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface || '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 2,
    marginRight: 16,
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: COLORS.primary || '#007AFF',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.muted || '#6B7280',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text?.primary || '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text?.secondary || '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  formContainer: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text?.primary || '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary || '#007AFF',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.primary || '#1F2937',
    height: '100%',
    padding: 0,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  genderPill: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderPillSelected: {
    backgroundColor: COLORS.primary || '#007AFF',
    borderColor: COLORS.primary || '#007AFF',
  },
  genderPillError: {
    borderColor: '#FF3B30',
  },
  genderPillText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.secondary || '#6B7280',
  },
  genderPillTextSelected: {
    color: COLORS.white || '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  locationWrapper: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 22,
  },
  locationHint: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text?.muted || '#9CA3AF',
    marginTop: 6,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#007AFF',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text?.primary || '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
});
