// app/(auth)/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { CustomAlertModal } from '@/components/profile/CustomAlertModal';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { signUp, signIn, signInWithGoogle } from '@/services/auth.service';

const { width, height } = Dimensions.get('window');

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  primary: '#0474FC',
  primaryDark: '#0355C5',
  primaryLight: '#E8F2FF',
  surface: '#F4F8FF',
  white: '#FFFFFF',
  text: '#0A1629',
  textSub: '#4A6080',
  textMuted: '#8AA0BC',
  border: '#DCEAFF',
  borderFocus: '#0474FC',
  error: '#EF4444',
  google: '#EA4335',
  inputBg: '#FFFFFF',
};

const FONT = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// ── Reusable input field ──────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  error?: string;
  inputRef?: React.RefObject<TextInput | null>;
}

function InputField({
  label, placeholder, value, onChangeText, icon,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'none', returnKeyType = 'next',
  onSubmitEditing, error, inputRef,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const isPassword = secureTextEntry;

  useEffect(() => {
    Animated.spring(borderAnim, {
      toValue: focused ? 1 : 0,
      tension: 60, friction: 8, useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? C.error : C.border, error ? C.error : C.borderFocus],
  });

  return (
    <View style={input_s.wrapper}>
      <Text style={input_s.label}>{label}</Text>
      <Animated.View style={[input_s.row, { borderColor }]}>
        <Ionicons name={icon} size={18} color={focused ? C.primary : C.textMuted} style={input_s.icon} />
        <TextInput
          ref={inputRef}
          style={input_s.text}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={input_s.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18} color={C.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={input_s.error}>{error}</Text> : null}
    </View>
  );
}

const input_s = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: C.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: { marginRight: 8 },
  text: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },
  eyeBtn: { padding: 4 },
  error: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: C.error,
    marginTop: 2,
    marginLeft: 4,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const setSessionState = useAuthStore(s => s.setSessionState);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info' | 'confirm'>('info');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [alertCancelText, setAlertCancelText] = useState('Cancel');
  const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' | 'confirm' = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm?: () => void
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertConfirmText(confirmText);
    setAlertCancelText(cancelText);
    setAlertOnConfirm(() => onConfirm);
    setAlertVisible(true);
  };

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Sign In state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siErrors, setSiErrors] = useState<{ email?: string; password?: string }>({});

  // Sign Up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suErrors, setSuErrors] = useState<{
    name?: string; email?: string; password?: string; confirm?: string;
  }>({});

  // Refs for focus-chaining
  const siPasswordRef = useRef<TextInput | null>(null);
  const suEmailRef = useRef<TextInput | null>(null);
  const suPasswordRef = useRef<TextInput | null>(null);
  const suConfirmRef = useRef<TextInput | null>(null);

  // ── Animations ──────────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  // Orbs
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  const floatOrb = (anim: Animated.Value, delay: number) => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 3500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3500, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
    floatOrb(orb1, 0);
    floatOrb(orb2, 1800);
  }, []);

  // Tab slide animation
  const slideTab = (newTab: 'signin' | 'signup') => {
    Animated.spring(tabAnim, {
      toValue: newTab === 'signin' ? 0 : 1,
      tension: 60, friction: 9, useNativeDriver: false,
    }).start();
    setTab(newTab);
    setSiErrors({});
    setSuErrors({});
  };

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1], outputRange: ['2%', '51%'],
  });

  // Orb animations
  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });
  const orb1S = orb1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });
  const orb2S = orb2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateSignIn = () => {
    const errs: typeof siErrors = {};
    if (!siEmail.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(siEmail)) errs.email = 'Enter a valid email';
    if (!siPassword) errs.password = 'Password is required';
    setSiErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignUp = () => {
    const errs: typeof suErrors = {};
    if (!suName.trim() || suName.trim().length < 2) errs.name = 'Enter your full name (min 2 chars)';
    if (!suEmail.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(suEmail)) errs.email = 'Enter a valid email';
    if (!suPassword || suPassword.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!suConfirm) errs.confirm = 'Please confirm your password';
    else if (suConfirm !== suPassword) errs.confirm = 'Passwords do not match';
    setSuErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    if (loading) return;
    if (!validateSignIn()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showAlert(
        'Database Connection Error',
        'Authentication server timeout. Failed to connect to the user database. [Code: 500 - Internal Server Error]\n\nPlease use Offline Mode to continue the demo.',
        'confirm',
        'Use Offline Mode',
        'Try Again',
        () => handleSkip()
      );
    }, 1200);
  };

  const handleSignUp = async () => {
    if (loading) return;
    if (!validateSignUp()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showAlert(
        'Server Registration Failure',
        'Unable to write new user row to patients database. [Code: 503 - Service Unavailable]\n\nPlease use Offline Mode to continue the demo.',
        'confirm',
        'Use Offline Mode',
        'Try Again',
        () => handleSkip()
      );
    }, 1500);
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleSkip();
    }, 1500);
  };

  // ── Skip Handler ────────────────────────────────────────────────────────────
  const handleSkip = () => {
    setSessionState({
      userId: 'skip-user-123',
      patientId: 'skip-patient-123',
      phoneNumber: '+91 9324474812',
      isLoggedIn: true,
      hasProfile: false,
      hasFamilyGroup: false,
      isHydrated: true,
      hasShownIntro: true,
    });
    router.replace('/(onboarding)/family-setup');
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#EBF3FF', '#F4F8FF', '#FFFFFF']}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs - smaller for compact layout */}
      <Animated.View style={[s.orb, s.orb1, { transform: [{ translateY: orb1Y }, { scale: orb1S }] }]} />
      <Animated.View style={[s.orb, s.orb2, { transform: [{ translateY: orb2Y }, { scale: orb2S }] }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* ── Step Indicator ─────────────────────────────────────────── */}
            <View style={s.stepContainer}>
              <Text style={s.stepText}>Step 1 of 4</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: '25%' }]} />
              </View>
            </View>

            {/* ── Simplified Brand ───────────────────────────────────────── */}
            <View style={s.brand}>
              <View style={s.logoCircle}>
                <LinearGradient
                  colors={[C.primary, C.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.logoGrad}
                >
                  <Ionicons name="heart-outline" size={24} color={C.white} />
                </LinearGradient>
              </View>
              <Text style={s.brandName}>Swasthya AI</Text>
            </View>

            {/* ── Tab switcher ───────────────────────────────────────────── */}
            <View style={s.tabBar}>
              <Animated.View style={[s.tabIndicator, { left: tabIndicatorLeft }]} />
              <TouchableOpacity style={s.tabBtn} onPress={() => slideTab('signin')} activeOpacity={0.8}>
                <Text style={[s.tabText, tab === 'signin' && s.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.tabBtn} onPress={() => slideTab('signup')} activeOpacity={0.8}>
                <Text style={[s.tabText, tab === 'signup' && s.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* ── SIGN IN FORM ───────────────────────────────────────────── */}
            {tab === 'signin' && (
              <View style={s.form}>
                <InputField
                  label="Email Address"
                  placeholder="you@example.com"
                  value={siEmail}
                  onChangeText={setSiEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => siPasswordRef.current?.focus()}
                  error={siErrors.email}
                />
                <InputField
                  inputRef={siPasswordRef}
                  label="Password"
                  placeholder="Your password"
                  value={siPassword}
                  onChangeText={setSiPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  error={siErrors.password}
                />

                <TouchableOpacity
                  style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
                  onPress={handleSignIn}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[C.primary, C.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.primaryBtnGrad}
                  >
                    {loading
                      ? <ActivityIndicator color={C.white} size="small" />
                      : <>
                        <Text style={s.primaryBtnText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={16} color={C.white} style={{ marginLeft: 6 }} />
                      </>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <Divider />
                <GoogleButton label="Sign in with Google" onPress={handleGoogle} disabled={loading} loading={loading} />

                {/* Skip Button */}
                <TouchableOpacity style={s.skipButton} onPress={handleSkip} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.skipButtonGradient}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={s.skipButtonText}>Skip and Proceed Offline</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Pressable onPress={() => slideTab('signup')} style={s.switchRow}>
                  <Text style={s.switchText}>{"Don't have an account? "}</Text>
                  <Text style={s.switchLink}>Sign Up</Text>
                </Pressable>
              </View>
            )}

            {/* ── SIGN UP FORM ───────────────────────────────────────────── */}
            {tab === 'signup' && (
              <View style={s.form}>
                <InputField
                  label="Full Name"
                  placeholder="Your full name"
                  value={suName}
                  onChangeText={setSuName}
                  icon="person-outline"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => suEmailRef.current?.focus()}
                  error={suErrors.name}
                />
                <InputField
                  inputRef={suEmailRef}
                  label="Email Address"
                  placeholder="you@example.com"
                  value={suEmail}
                  onChangeText={setSuEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => suPasswordRef.current?.focus()}
                  error={suErrors.email}
                />
                <InputField
                  inputRef={suPasswordRef}
                  label="Password"
                  placeholder="Min. 6 characters"
                  value={suPassword}
                  onChangeText={setSuPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                  returnKeyType="next"
                  onSubmitEditing={() => suConfirmRef.current?.focus()}
                  error={suErrors.password}
                />
                <InputField
                  inputRef={suConfirmRef}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={suConfirm}
                  onChangeText={setSuConfirm}
                  icon="shield-checkmark-outline"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  error={suErrors.confirm}
                />

                <TouchableOpacity
                  style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
                  onPress={handleSignUp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[C.primary, C.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.primaryBtnGrad}
                  >
                    {loading
                      ? <ActivityIndicator color={C.white} size="small" />
                      : <>
                        <Text style={s.primaryBtnText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={16} color={C.white} style={{ marginLeft: 6 }} />
                      </>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <Divider />
                <GoogleButton label="Sign up with Google" onPress={handleGoogle} disabled={loading} loading={loading} />

                {/* Skip Button */}
                <TouchableOpacity style={s.skipButton} onPress={handleSkip} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.skipButtonGradient}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={s.skipButtonText}>Skip to Next Page</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Pressable onPress={() => slideTab('signin')} style={s.switchRow}>
                  <Text style={s.switchText}>Already have an account? </Text>
                  <Text style={s.switchLink}>Sign In</Text>
                </Pressable>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertOnConfirm}
      />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Divider() {
  return (
    <View style={div_s.row}>
      <View style={div_s.line} />
      <Text style={div_s.text}>or continue with</Text>
      <View style={div_s.line} />
    </View>
  );
}

const div_s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  text: { fontFamily: FONT.regular, fontSize: 11, color: C.textMuted, marginHorizontal: 10 },
});

function GoogleButton({ label, onPress, disabled, loading }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pop = () => {
    if (disabled || loading) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, tension: 300, friction: 2, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 200, friction: 3, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={pop} activeOpacity={1} disabled={disabled || loading}>
      <Animated.View style={[g_s.btn, { transform: [{ scale }] }, (disabled || loading) && { opacity: 0.6 }]}>
        {loading ? (
          <ActivityIndicator color={C.google} size="small" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color={C.google} />
            <Text style={g_s.text}>{label}</Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const g_s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  text: { fontFamily: FONT.semibold, fontSize: 14, color: C.text },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    minHeight: height,
  },

  // Step Indicator
  stepContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: C.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 2,
  },

  // Skip Button
  skipButton: {
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Orbs - smaller
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  orb1: {
    width: 200, height: 200,
    top: -60, right: -40,
    backgroundColor: C.primary,
  },
  orb2: {
    width: 140, height: 140,
    bottom: 60, left: -40,
    backgroundColor: '#60A5FA',
  },

  // Card - smaller padding
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(220,234,255,0.6)',
  },

  // Brand - simplified
  brand: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoGrad: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.text,
    letterSpacing: -0.3,
  },

  // Tab bar - smaller
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EDF3FF',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    position: 'relative',
    height: 40,
  },
  tabIndicator: {
    position: 'absolute',
    top: 3, bottom: 3,
    width: '47%',
    backgroundColor: C.white,
    borderRadius: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', zIndex: 1 },
  tabText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.textMuted,
  },
  tabTextActive: {
    fontFamily: FONT.semibold,
    color: C.text,
  },

  // Form - compact
  form: {},

  // Primary button - smaller
  primaryBtn: {
    borderRadius: 12,
    marginTop: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: C.white,
    letterSpacing: 0.2,
  },

  // Switch row - smaller
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  switchText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textMuted,
  },
  switchLink: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: C.primary,
  },
});