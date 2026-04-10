// app/(auth)/otp.tsx
import { COLORS, TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { getPatientByPhone, normalizePhone } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const setSessionState = useAuthStore((state) => state.setSessionState);
  const params = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const phoneNumber = normalizePhone((params.phone as string) || '');
  const testOtp = params.testOtp as string || '';
  const formattedPhone = phoneNumber ? `+91 ${phoneNumber}` : '+91 XXXXX XXXXX';

  // Auto-fill test OTP if provided
  useEffect(() => {
    if (testOtp && testOtp.length === 6) {
      const otpDigits = testOtp.split('');
      setCode(otpDigits);
    }
  }, [testOtp]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (text !== '' && index === 5 && newCode.every(digit => digit !== '')) {
      setTimeout(() => {
        handleVerify();
      }, 100);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otpCode = code.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    try {
      // Check if OTP matches (always use test mode)
      if (testOtp && otpCode !== testOtp) {
        Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        setIsVerifying(false);
        return;
      }

      const existingPatient = await getPatientByPhone(phoneNumber);

      setSessionState({
        userId: `phone:${phoneNumber}`,
        patientId: existingPatient?.id ?? null,
        phoneNumber,
        hasProfile: Boolean(existingPatient),
        hasFamilyGroup: Boolean(existingPatient?.family_id),
      });

      if (existingPatient?.family_id) {
        router.replace('/(tabs)/home');
      } else if (existingPatient) {
        router.replace('/(onboarding)/family-setup');
      } else {
        router.replace({
          pathname: '/(onboarding)/user-details',
          params: { phone: phoneNumber },
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Verification Failed', error?.message || 'Invalid OTP. Please try again.');
      
      // Clear OTP on failure
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      // Generate new random OTP for resend
      const newTestOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setTimeout(() => {
        setTimer(30);
        Alert.alert('OTP Resent', `A new verification code has been sent to ${formattedPhone}`);
        setCode(['', '', '', '', '', '']);
        // Auto-fill new test OTP
        const otpDigits = newTestOtp.split('');
        setCode(otpDigits);
        inputs.current[0]?.focus();
        setIsResending(false);
        
        // Update the testOtp in params (for next verification)
        // This is handled by the new OTP being set in state
      }, 500);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backButtonBg}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary || '#2563EB'} />
            </View>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to
            </Text>
            <Text style={styles.phoneNumber}>{formattedPhone}</Text>
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.otpBoxWrapper}>
                <LinearGradient
                  colors={
                    focusedIndex === index || digit !== ''
                      ? ['#2563EB', '#3B82F6', '#60A5FA']
                      : ['#E2E8F0', '#E2E8F0', '#E2E8F0']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.otpGradientBorder}
                >
                  <View style={styles.otpInnerBox}>
                    <TextInput
                      ref={(ref) => { inputs.current[index] = ref; }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      selectTextOnFocus
                    />
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={isResending} activeOpacity={0.7}>
                {isResending ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }} />

          {/* Verify Button */}
          <TouchableOpacity onPress={handleVerify} activeOpacity={0.8} disabled={isVerifying}>
            <LinearGradient
              colors={['#2563EB', '#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyButton}
            >
              {isVerifying ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify</Text>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 50,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerSection: {
    marginBottom: 48,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  phoneNumber: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  otpBoxWrapper: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 55,
  },
  otpGradientBorder: {
    flex: 1,
    padding: 2,
    borderRadius: 12,
  },
  otpInnerBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBox: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#1E293B',
    padding: 0,
    margin: 0,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#64748B',
  },
  resendText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontWeight: '600',
    color: '#2563EB',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontWeight: '600',
  },
});
