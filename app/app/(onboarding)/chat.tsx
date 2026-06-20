// app/(onboarding)/chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { getPatientById } from '@/services/auth.service';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuestionStep {
  key: string;
  question: string;
  placeholder: string;
  chips: string[];
  fieldParser: (input: string) => Partial<ProfileData>;
}

interface ProfileData {
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  height: string;
  weight: string;
  allergies: string;
  current_medication: string;
  chronic_diseases: string;
  family_history: string;
  smoking: string;
  alcohol: string;
  emergency_contact: string;
  surgeries: string;
  vaccinations: string;
}

const { width } = Dimensions.get('window');

export default function OnboardingChatScreen() {
  const { patientId, setSessionState } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    full_name: 'Indresh',
    age: 20,
    gender: 'Male',
    blood_group: 'O+',
    height: '175cm',
    weight: '72kg',
    allergies: 'None',
    current_medication: 'None',
    chronic_diseases: 'None',
    family_history: 'None',
    smoking: 'Non-smoker',
    alcohol: 'Never',
    emergency_contact: 'None',
    surgeries: 'None',
    vaccinations: 'Up to date',
  });

  const steps: QuestionStep[] = [
    {
      key: 'age_gender',
      question: "Hello! Welcome to Swasthya AI. 👋 Let's configure your health profile. To start, what is your age and gender?",
      placeholder: "e.g., 25 years, Female",
      chips: ['24, Male', '28, Female', '30, Other'],
      fieldParser: (input) => {
        const ageMatch = input.match(/\d+/);
        const age = ageMatch ? parseInt(ageMatch[0], 10) : 24;
        let gender = 'Male';
        if (input.toLowerCase().includes('female')) gender = 'Female';
        else if (input.toLowerCase().includes('other')) gender = 'Other';
        return { age, gender };
      },
    },
    {
      key: 'height_weight',
      question: "Great! Next, could you tell me your height (e.g., in cm) and weight (e.g., in kg)?",
      placeholder: "e.g., 170 cm, 65 kg",
      chips: ['170 cm, 60 kg', '175 cm, 70 kg', '180 cm, 80 kg'],
      fieldParser: (input) => {
        const heightMatch = input.match(/(\d+)\s*(cm|ft|in)?/i);
        const weightMatch = input.match(/(\d+)\s*(kg|lbs)?/i);
        return {
          height: heightMatch ? heightMatch[0] : '175cm',
          weight: weightMatch ? weightMatch[0] : '72kg',
        };
      },
    },
    {
      key: 'blood_allergies',
      question: "Understood. What is your Blood Group, and do you have any drug or food allergies?",
      placeholder: "e.g., B+, No allergies",
      chips: ['O+, No allergies', 'A+, Penicillin allergy', 'B+, None'],
      fieldParser: (input) => {
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        let blood_group = 'O+';
        for (const bg of bloodGroups) {
          if (input.toUpperCase().includes(bg)) {
            blood_group = bg;
            break;
          }
        }
        let allergies = 'None';
        if (input.toLowerCase().includes('allergy') || input.toLowerCase().includes('allergies')) {
          allergies = input;
        }
        return { blood_group, allergies };
      },
    },
    {
      key: 'chronic_meds',
      question: "Do you have any chronic conditions (like Diabetes, Hypertension) or take daily medications?",
      placeholder: "e.g., Hypertension, Metformin 500mg daily",
      chips: ['None', 'Diabetes, Metformin', 'Hypertension, Amlodipine'],
      fieldParser: (input) => {
        if (input.toLowerCase().trim() === 'none' || input.toLowerCase().includes('skip')) {
          return { chronic_diseases: 'None', current_medication: 'None' };
        }
        let chronic_diseases = 'None';
        let current_medication = 'None';
        if (input.toLowerCase().includes('diabetes')) chronic_diseases = 'Diabetes';
        else if (input.toLowerCase().includes('hypertension') || input.toLowerCase().includes('bp')) chronic_diseases = 'Hypertension';
        else chronic_diseases = input;

        if (input.toLowerCase().includes('metformin') || input.toLowerCase().includes('amlodipine') || input.includes('mg')) {
          current_medication = input;
        }
        return { chronic_diseases, current_medication };
      },
    },
    {
      key: 'surgeries_vaccinations',
      question: "Lastly, have you had any major surgeries in the past, and are your vaccinations up to date?",
      placeholder: "e.g., Appendectomy in 2024, fully vaccinated",
      chips: ['No surgeries, up to date', 'No surgeries, missing some', 'Appendectomy, up to date'],
      fieldParser: (input) => {
        let surgeries = 'None';
        let vaccinations = 'Up to date';
        if (input.toLowerCase().includes('appendectomy')) surgeries = 'Appendectomy';
        else if (input.toLowerCase().includes('surgery') || input.toLowerCase().includes('operation')) surgeries = input;

        if (input.toLowerCase().includes('missing') || input.toLowerCase().includes('not up to date')) {
          vaccinations = 'Needs updates';
        }
        return { surgeries, vaccinations };
      },
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-bot',
      text: steps[0].question,
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (patientId) {
      getPatientById(patientId).then((record) => {
        if (record && record.name) {
          setProfileData(prev => ({ ...prev, full_name: record.name }));
        }
      }).catch(err => console.log('Error loading patient name in chat', err));
    }
  }, [patientId]);

  const addBotReply = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const handleSend = (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    Keyboard.dismiss();

    const activeStep = steps[currentStep];
    const parsedFields = activeStep.fieldParser(trimmed);
    const updatedData = { ...profileData, ...parsedFields };
    setProfileData(updatedData);

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
      setTimeout(() => addBotReply(steps[nextStepIndex].question), 300);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-done`,
            text: "Excellent! Your health profile is now configured. Let's verify your details in the Summary.",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => {
          router.push({
            pathname: '/(onboarding)/summary',
            params: { profileData: JSON.stringify(updatedData) },
          });
        }, 1500);
      }, 800);
    }
  };

  const handleSkipAll = () => {
    const fakeProfileData = {
      full_name: 'Indresh',
      age: 20,
      gender: 'Male',
      blood_group: 'O+',
      height: '175cm',
      weight: '72kg',
      allergies: 'Penicillin',
      current_medication: 'None',
      chronic_diseases: 'Migraine, Anxiety',
      family_history: 'None',
      smoking: 'Non-smoker',
      alcohol: 'Never',
      emergency_contact: 'None',
      surgeries: 'None',
      vaccinations: 'COVID-19, Tetanus',
    };
    
    setSessionState({
      hasProfile: true,
    });
    
    router.push({
      pathname: '/(onboarding)/summary',
      params: { profileData: JSON.stringify(fakeProfileData) },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleChipPress = (chip: string) => {
    handleSend(chip);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />
      
      {/* Header with Back Button and Skip All */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.botIcon}>
            <Ionicons name="medical" size={18} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Swasthya Assistant</Text>
            <Text style={styles.headerSubtitle}>Step 3 of 4</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.skipAllBtn} onPress={handleSkipAll} activeOpacity={0.7}>
          <Text style={styles.skipAllText}>Skip All</Text>
          <Ionicons name="arrow-forward" size={14} color="#8AA0BC" />
        </TouchableOpacity>
      </View>

      {/* Messages list - with extra padding at bottom when keyboard is visible */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          keyboardVisible && styles.listContentWithKeyboard
        ]}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrapper, item.isUser ? styles.userWrapper : styles.botWrapper]}>
            {!item.isUser && (
              <View style={styles.bubbleAvatar}>
                <Ionicons name="pulse" size={16} color="#FFFFFF" />
              </View>
            )}
            <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.bubbleAvatar}>
            <Ionicons name="pulse" size={16} color="#FFFFFF" />
          </View>
          <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.bubbleText, { marginLeft: 8 }]}>Typing health profile...</Text>
          </View>
        </View>
      )}

      {/* Skip Card Button - Skip and Continue */}
      <TouchableOpacity style={styles.skipCard} onPress={handleSkipAll} activeOpacity={0.9}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.skipCardGradient}
        >
          <View style={styles.skipCardIcon}>
            <Ionicons name="arrow-forward-circle" size={24} color="#cb0505" />
          </View>
          <View style={styles.skipCardTextContainer}>
            <Text style={styles.skipCardTitle}>Skip & Continue</Text>
            <Text style={styles.skipCardSubtitle}>Skip all questions and go to summary</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#e42b1d" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Suggestions Chips */}
      <View style={styles.chipsContainer}>
        <View style={styles.chipsScroll}>
          {steps[currentStep].chips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chip}
              onPress={() => handleChipPress(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom input bar - with proper keyboard handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={steps[currentStep].placeholder}
            placeholderTextColor="#8AA0BC"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => handleSend()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
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
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  botIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0474FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  headerSubtitle: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  skipAllText: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 20,
  },
  listContentWithKeyboard: {
    paddingBottom: 120,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  botWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0474FC',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsContainer: {
    paddingVertical: 8,
    backgroundColor: '#07111f',
  },
  chipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0474FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skip Card Styles
  skipCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#f25106',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skipCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  skipCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skipCardTextContainer: {
    flex: 1,
  },
  skipCardTitle: {
    color: '#b91010',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  skipCardSubtitle: {
    color: '#8AA0BC',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },
});