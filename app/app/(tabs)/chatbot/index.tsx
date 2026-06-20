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
  NativeModules,
  ActivityIndicator,
  Animated,
  Dimensions,
  UIManager,
  LayoutAnimation,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import * as Speech from 'expo-speech';
import { supabase } from '@/services/supabaseClient';
import { backendService } from '@/services/backend.service';
import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';
import Voice from '@react-native-voice/voice';
import { LinearGradient } from 'expo-linear-gradient';
import { AgentLog } from '@/components/chatbot/AgentLog';
import { Camera } from 'expo-camera';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AgentThought {
  name: string;
  role: string;
  thought: string;
}

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  shortDate: string;
  overallSummary: string;
  agents: AgentThought[];
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    date: 'June 15, 2026',
    time: '10:30 PM',
    shortDate: '15 Jun',
    overallSummary: 'Reported headache (severity 6/10) and missed morning Metformin dose. Heart rate spiked to 105 bpm during symptoms.',
    agents: [
      { name: 'Sarvam Chat Agent', role: 'Conversational Front-end', thought: 'Handled user input in Hindi. Translated symptoms, validated severity, and escalated warnings on heart rate.' },
      { name: 'Check-in Agent', role: 'Daily Symptoms & Adherence', thought: 'Detected missing Metformin dose. Educated patient on diabetes adherence.' },
      { name: 'Smartwatch Risk Agent', role: 'Vitals & PPG Analysis', thought: 'Correlated headache onset with 105 bpm heart rate spike. No signs of critical arrhythmia.' },
      { name: 'Escalation Agent', role: 'Emergency & Triage', thought: 'Checked severity. Since pain was 6/10 and heart rate resolved, flagged for doctor review rather than emergency ER trigger.' },
      { name: 'Medicine Reminder Agent', role: 'Prescription Tracking', thought: 'Scheduled push notifications for evening Amlodipine. Verified patient confirmed ingestion at 8:00 PM.' }
    ]
  },
  {
    id: '2',
    date: 'June 14, 2026',
    time: '09:15 PM',
    shortDate: '14 Jun',
    overallSummary: 'Blood pressure was elevated at 135/88 mmHg. Complained of mild chest tightness which resolved after resting.',
    agents: [
      { name: 'Sarvam Chat Agent', role: 'Conversational Front-end', thought: 'Processed query about chest tightness. Prompted patient to rest and check BP.' },
      { name: 'Smartwatch Risk Agent', role: 'Vitals & PPG Analysis', thought: 'PPG sensor showed elevated peripheral resistance. Heart rate stable at 72 bpm.' },
      { name: 'Escalation Agent', role: 'Emergency & Triage', thought: 'Evaluated chest tightness. Advised emergency call if pain radiates or increases. Patient confirmed resolution after 5 min rest.' },
      { name: 'Doctor Q&A Agent', role: 'Clinical Liaison', thought: 'Synthesized symptoms into a query for Dr. Sharma regarding Amlodipine dosage adjustment.' }
    ]
  },
  {
    id: '3',
    date: 'June 13, 2026',
    time: '08:45 PM',
    shortDate: '13 Jun',
    overallSummary: 'A normal health day. Vitals within target ranges. Fasting glucose at 110 mg/dL. Walked 8,500 steps.',
    agents: [
      { name: 'Check-in Agent', role: 'Daily Symptoms & Adherence', thought: 'Logged fasting blood glucose of 110 mg/dL. Encouraged patient for keeping it under 125 mg/dL.' },
      { name: 'Medicine Reminder Agent', role: 'Prescription Tracking', thought: 'All daily medications (Metformin, Amlodipine, Vitamin D3) marked as taken on time.' },
      { name: 'Smartwatch Risk Agent', role: 'Vitals & PPG Analysis', thought: 'Steps: 8,500. Sleep: 7.5 hours. Heart rate variability (HRV) is healthy at 45ms.' }
    ]
  }
];

const VOICE_LOCALES = {
  'en-US': {
    label: 'English',
    greeting: "Hello! I am your health voice assistant. How are you feeling today?",
    listening: "Listening... Speak now!",
    thinking: "Thinking...",
    speaking: "Speaking...",
    unheard: "I didn't hear anything. Please try speaking again...",
    instruction: "Speak now, or use the shortcuts below",
    statusListening: "Listening...",
    suggestions: [
      "I have stomach pain since yesterday",
      "My chest feels tight and uneasy",
      "Should I take my medications now?"
    ],
    fallbackReplies: {
      bp: "Your blood pressure seems stable. Continue taking your medication as prescribed and monitor daily.",
      headache: "Headaches can be related to blood pressure fluctuations or dehydration. I've noted this down. How long have you felt this?",
      fatigue: "Fatigue can be linked to sleep deprivation or blood sugar levels. Are you getting 7-8 hours of sleep?",
      med: "Please ensure you take your medicines on time as per your doctor's prescription. Have you taken your dose today?",
      pain: "I'm sorry to hear that. Where is the pain located and how severe is it on a scale of 1 to 10?",
      default: "Thank you for sharing. I am logging this symptom in your health profile. Is there anything else?"
    }
  },
  'hi-IN': {
    label: 'हिंदी',
    greeting: "नमस्ते! मैं आपका स्वास्थ्य वॉइस असिस्टेंट हूँ। आज आप कैसा महसूस कर रहे हैं?",
    listening: "सुन रहा हूँ... बोलिए!",
    thinking: "सोच रहा हूँ...",
    speaking: "बोल रहा हूँ...",
    unheard: "मैंने कुछ नहीं सुना। कृपया फिर से बोलें...",
    instruction: "कृपया बोलें, या नीचे दिए गए शॉर्टकट्स का उपयोग करें",
    statusListening: "सुन रहा हूँ...",
    suggestions: [
      "मुझे कल से पेट में दर्द है",
      "मेरी छाती में खिंचाव महसूस हो रहा है",
      "क्या मुझे अपनी दवाएं अभी लेनी चाहिए?"
    ],
    fallbackReplies: {
      bp: "आपका रक्तचाप ठीक लग रहा है। अपनी दवाएं नियमित रूप से लेते रहें और समय-समय पर जांच करते रहें।",
      headache: "सिरदर्द रक्तचाप में उतार-चढ़ाव या निर्जलीकरण से जुड़ा हो सकता है। मैंने इस लक्षण को नोट कर लिया है। आप कब से ऐसा महसूस कर रहे हैं?",
      fatigue: "थकान मधुमेह या नींद की कमी के कारण हो सकती है। क्या आप 7-8 घंटे सो रहे हैं?",
      med: "याद रखें कि डॉक्टर के परामर्श के अनुसार दवाएं समय पर लें। क्या आपने आज की खुराक ले ली है?",
      pain: "मुझे यह सुनकर खेद है। दर्द कहां हो रहा है और यह कितना गंभीर है (1 से 10 के पैमाने पर)?",
      default: "साझा करने के लिए धन्यवाद। मैं इस जानकारी को आपके दैनिक स्वास्थ्य प्रोफाइल में दर्ज कर रहा हूं। क्या कोई अन्य लक्षण हैं?"
    }
  },
  'mr-IN': {
    label: 'मराठी',
    greeting: "नमस्कार! मी तुमचा स्वास्थ्या AI सहाय्यक आहे. आज तुम्हाला कसे वाटत आहे?",
    listening: "ऐकत आहे... बोला!",
    thinking: "विचार करत आहे...",
    speaking: "बोलत आहे...",
    unheard: "मला काही ऐकू आले नाही. कृपया पुन्हा बोला...",
    instruction: "कृपया बोला, किंवा खालील पर्यायांचा वापर करा",
    statusListening: "ऐकत आहे...",
    suggestions: [
      "माझ्या डोक्यात खूप दुखत आहे",
      "मला खूप थकवा जाणवत आहे",
      "मी माझी औषधे वेळेवर घेतली पाहिजेत का?"
    ],
    fallbackReplies: {
      bp: "तुमचा रक्तदाब स्थिर वाटत आहे. तुमची औषधे वेळेवर घेत राहा आणि नियमित तपासणी करा.",
      headache: "डोकेदुखी रक्तदाबातील बदलांमुळे किंवा डिहायड्रेशनमुळे असू शकते. मी हे नोंदवून घेतले आहे. तुम्हाला कधीपासून त्रास होत आहे?",
      fatigue: "थकवा अपुऱ्या झोपेमुळे किंवा साखरेच्या पातळीमुळे असू शकतो. तुम्ही ७-८ तास झोप घेत आहात का?",
      med: "कृपया तुमची औषधे डॉक्टरांच्या सल्ल्यानुसार वेळेवर घ्या. तुम्ही आजचे औषध घेतले आहे का?",
      pain: "हे ऐकून वाईट वाटले. वेदना कुठे होत आहेत आणि १ ते १० च्या स्केलवर ती किती तीव्र आहे?",
      default: "माहिती शेअर केल्याबद्दल धन्यवाद. मी हे तुमच्या आरोग्य प्रोफाइलमध्ये नोंदवत आहे. इतर काही लक्षणे आहेत का?"
    }
  },
  'gu-IN': {
    label: 'ગુજરાતી',
    greeting: "નમસ્તે! હું તમારો સ્વાસ્થ્ય AI સહાયક છું. આજે તમને કેવું લાગે છે?",
    listening: "સાંભળી રહ્યું છે... બોલો!",
    thinking: "વિચારી રહ્યું છે...",
    speaking: "બોલી રહ્યું છે...",
    unheard: "મને કંઈ સંભળાયું નથી. કૃપા કરીને ફરીથી બોલો...",
    instruction: "કૃપા કરીને બોલો, અથવા નીચેના શૉર્ટકટ્સનો ઉપયોગ કરો",
    statusListening: "સાંભળી રહ્યું છે...",
    suggestions: [
      "મને માથામાં દુખાવો થાય છે",
      "મને ખૂબ જ થાક લાગે છે",
      "શું મારે સવારની દવા લેવી જોઈએ?"
    ],
    fallbackReplies: {
      bp: "તમારું બ્લડ પ્રેશર સામાન્ય લાગે છે. તમારી દવાઓ નિયમિત લેતા રહો અને તપાસ કરતા રહો.",
      headache: "માથાનો દુખાવો બ્લડ પ્રેશરમાં ફેરફાર અથવા ડિહાઇડ્રેશનના કારણે હોઈ શકે છે. મેં આ નોંધી લીધું છે. તમે ક્યારથી આવું અનુભવો છો?",
      fatigue: "થાક અપૂરતી ઊંઘ અથવા બ્લડ સુગરના કારણે હોઈ શકે છે. શું તમે ૭-૮ કલાક ઊંઘો છો?",
      med: "કૃપા કરીને ડૉક્ટરના પ્રિસ્ક્રિપ્શન મુજબ તમારી દવાઓ સમયસર લો. શું તમે આજની દવા લીધી છે?",
      pain: "આ સાંભળીને દુઃխ થયું. દુખાવો ક્યાં થાય છે અને ૧ થી ૧૦ ના સ્કેલ પર કેટલો તીવ્ર છે?",
      default: "માહિતી શેર કરવા બદલ આભાર. હું આ તમારા હેલ્થ પ્રોફાઇલમાં નોંધી રહ્યો છું. શું અન્ય કોઈ લક્ષણો છે?"
    }
  },
  'ta-IN': {
    label: 'தமிழ்',
    greeting: "வணக்கம்! நான் உங்கள் சுவஸ்தியா AI உதவியாளர். இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    listening: "கேட்டுக்கொண்டிருக்கிறது... பேசுங்கள்!",
    thinking: "யோசித்துக் கொண்டிருக்கிறது...",
    speaking: "பேசிக்கொண்டிருக்கிறது...",
    unheard: "எனக்கு எதுவும் கேட்கவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்...",
    instruction: "பேசுங்கள், அல்லது கீழே உள்ள குறுக்குவழிகளைப் பயன்படுத்தவும்",
    statusListening: "கேட்டுக்கொண்டிருக்கிறது...",
    suggestions: [
      "எனக்கு தலைவலி இருக்கிறது",
      "எனக்கு மிகவும் சோர்வாக இருக்கிறது",
      "நான் காலை மருந்தை எடுத்துக்கொள்ள வேண்டுமா?"
    ],
    fallbackReplies: {
      bp: "உங்கள் இரத்த அழுத்தம் சீராக இருப்பது போல் தெரிகிறது. மருந்துகளைத் தவறாமல் உட்கொண்டு பரிசோதித்துக் கொள்ளுங்கள்.",
      headache: "தலைவலி இரத்த அழுத்த மாறுபாடுகள் அல்லது நீரிழப்பு காரணமாக இருக்கலாம். நான் இதை குறித்துக் கொள்கிறேன். எவ்வளவு காலமாக இந்த வலி உள்ளது?",
      fatigue: "சோர்வு தூக்கமின்மை அல்லது இரத்த சர்க்கரை அளவோடு தொடர்புடையதாக இருக்கலாம். நீங்கள் 7-8 மணிநேரம் தூங்குகிறீர்களா?",
      med: "மருத்துவர் பரிந்துரைத்தபடி உங்கள் மருந்துகளை சரியான நேரத்தில் உட்கொள்ளுங்கள். இன்றைய மருந்துகளை எடுத்துக்கொண்டீர்களா?",
      pain: "அதை கேட்க வருத்தமாக இருக்கிறது. வலி எங்கே இருக்கிறது, 1 முதல் 10 வரையிலான அளவில் எவ்வளவு தீவிரமாக உள்ளது?",
      default: "தகவலைப் பகிர்ந்தமைకు நன்றி. இதை உங்கள் சுகாதார சுயவிவரத்தில் பதிவு செய்கிறேன். வேறு ஏదేனும் அறிகுறிகள் உள்ளదా?"
    }
  },
  'te-IN': {
    label: 'తెలుగు',
    greeting: "నమస్తే! నేను మీ స్వస్థ్య AI సహాయకుడిని. ఈ రోజు మీకు ఎలా ఉంది?",
    listening: "వింటున్నాను... మాట్లాడండి!",
    thinking: "ఆలోచిస్తోంది...",
    speaking: "మాట్లాడుతోంది...",
    unheard: "నాకు ఏమీ వినిపించలేదు. దయచేసి మళ్లీ మాట్లాడండి...",
    instruction: "మాట్లాడండి, లేదా క్రింది సత్వరమార్గాలను ఉపయోగించండి",
    statusListening: "వింటున్నాను...",
    suggestions: [
      "నాకు తలనొప్పిగా ఉంది",
      "నేను చాలా అలసటగా ఉన్నాను",
      "నేను ఉదయం మందులు వేసుకోవాలా?"
    ],
    fallbackReplies: {
      bp: "మీ రక్తపోటు సాధారణంగానే ఉంది. మీ మందులను క్రమం తప్పకుండా వాడండి మరియు క్రమం తప్పకుండా పరీక్షించుకోండి.",
      headache: "తలనొప్పి రక్తపోటులో మార్పులు లేదా నిర్జలీకరణం వల్ల కావచ్చు. నేను ఈ లక్షణాన్ని నమోదు చేసుకున్నాను. మీకు ఎంతకాలంగా ఉంది?",
      fatigue: "అలసట నిద్రలేమి లేదా రక్తంలో చక్కెర స్థాయిల వల్ల కావచ్చు. మీరు రోజుకు 7-8 గంటలు నిద్రపోతున్నారా?",
      med: "దయచేసి మీ మందులను వైద్యుల సలహా మేరకు సమయానికి తీసుకోండి. ఈ రోజు మీ డోస్ తీసుకున్నారా?",
      pain: "అలా జరగడం బాధాకరం. నొప్పి ఎక్కడ వస్తోంది మరియు 1 నుండి 10 స్కేలులో ఎంత తీవ్రంగా ఉంది?",
      default: "సమాచారాన్ని పంచుకున్నందుకు ధన్యవాదాలు. నేను దీనిని మీ ఆరోగ్య ప్రొఫైల్లో నమోదు చేస్తున్నాను. ఇతర లక్షణాలు ఏమైనా ఉన్నాయా?"
    }
  }
};

export default function ChatScreen() {
  const isVoiceAvailable = Platform.OS !== 'web' && !!NativeModules.Voice;

  const requestMicPermission = async (): Promise<boolean> => {
    try {
      const { granted } = await Camera.requestMicrophonePermissionsAsync();
      return granted;
    } catch (err) {
      console.warn('Failed to request microphone permission:', err);
      return false;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Swasthya AI Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, patientId } = useAuthStore();
  const [userName, setUserName] = useState('User');
  const getLocaleConfig = () => {
    return (VOICE_LOCALES as any)[voiceLang] || VOICE_LOCALES['en-US'];
  };

  // History states
  const [showHistory, setShowHistory] = useState(false);
  const [showAgentLog, setShowAgentLog] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const voicePulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimerRef = useRef<any>(null);
  const phraseIndexRef = useRef(0);

  const mockPhrases = [
    "मुझे कल रात से सिरदर्द हो रहा है",
    "My chest feels a bit tight and uneasy",
    "क्या मुझे अपनी सुबह की दवा लेनी चाहिए?"
  ];

  // Pulse animation when recording
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(voicePulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      voicePulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording]);

  const handleVoicePress = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isRecording) {
      if (isVoiceAvailable) {
        try {
          await Voice.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
    } else {
      await requestMicPermission();
      setIsRecording(true);
      setInputText('');
      latestVoiceSpeechRef.current = '';

      let voiceStarted = false;
      if (isVoiceAvailable) {
        try {
          await Voice.start('hi-IN');
          voiceStarted = true;
        } catch (e) {
          console.error("Voice start error:", e);
        }
      }

      if (!voiceStarted) {
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = setTimeout(() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsRecording(false);
          const nextPhrase = mockPhrases[phraseIndexRef.current];
          setInputText(nextPhrase);
          phraseIndexRef.current = (phraseIndexRef.current + 1) % mockPhrases.length;
        }, 2500);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, []);

  // Voice-to-Voice states
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceState, setVoiceState] = useState<'listening' | 'thinking' | 'speaking' | 'paused'>('listening');
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'hi-IN' | 'mr-IN' | 'gu-IN' | 'ta-IN' | 'te-IN'>('en-US');
  const [voiceSubtitles, setVoiceSubtitles] = useState('Starting up...');
  const [voiceInputText, setVoiceInputText] = useState('');

  // Concentric circle animations
  const blobScale1 = useRef(new Animated.Value(1)).current;
  const blobScale2 = useRef(new Animated.Value(1)).current;
  const blobScale3 = useRef(new Animated.Value(1)).current;
  const blobOpacity1 = useRef(new Animated.Value(0.15)).current;
  const blobOpacity2 = useRef(new Animated.Value(0.1)).current;
  const blobOpacity3 = useRef(new Animated.Value(0.05)).current;

  const voiceInteractionTimer = useRef<any>(null);
  const latestVoiceSpeechRef = useRef('');

  // Register real speech-to-text listeners
  useEffect(() => {
    if (!isVoiceAvailable) return;

    Voice.onSpeechStart = () => {
      console.log('Voice recognition started');
    };
    Voice.onSpeechEnd = () => {
      console.log('Voice recognition ended');
      setIsRecording(false);

      if (voiceModeActive) {
        setTimeout(() => {
          const finalSpeech = latestVoiceSpeechRef.current.trim();
          if (finalSpeech) {
            processUserVoiceInput(finalSpeech);
          } else {
            setVoiceSubtitles(getLocaleConfig().unheard);
            setTimeout(() => {
              startListeningLoop();
            }, 1500);
          }
        }, 800);
      }
    };
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0];
        latestVoiceSpeechRef.current = transcript;
        if (voiceModeActive) {
          setVoiceSubtitles(transcript);
        } else {
          setInputText(transcript);
        }
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.error('Voice recognition error:', e);
      setIsRecording(false);
      if (voiceModeActive && voiceState === 'listening') {
        setTimeout(() => { startListeningLoop(); }, 1000);
      }
    };

    return () => {
      if (isVoiceAvailable) {
        Voice.destroy().then(() => {
          try {
            Voice.removeAllListeners();
          } catch (err) {
            console.error(err);
          }
        }).catch(err => console.error(err));
      }
    };
  }, [voiceModeActive, voiceState, voiceLang, isVoiceAvailable]);

  // Web Speech Recognition & Multilingual Fallback handlers
  const webSpeechRecRef = useRef<any>(null);

  const startVoiceCapture = async (lang: string): Promise<boolean> => {
    latestVoiceSpeechRef.current = '';
    
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          if (webSpeechRecRef.current) {
            webSpeechRecRef.current.abort();
          }
          const rec = new SpeechRecognition();
          rec.lang = lang;
          rec.continuous = false;
          rec.interimResults = false;
          
          rec.onstart = () => {
            console.log('Web speech recognition started');
            setVoiceState('listening');
          };
          
          rec.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Web speech result:', transcript);
            latestVoiceSpeechRef.current = transcript;
            setVoiceSubtitles(transcript);
          };
          
          rec.onerror = (event: any) => {
            console.error('Web speech error:', event);
            if (voiceModeActive && voiceState === 'listening') {
              setVoiceSubtitles(getLocaleConfig().unheard);
              setTimeout(() => { startListeningLoop(); }, 1500);
            }
          };
          
          rec.onend = () => {
            console.log('Web speech recognition ended');
            if (voiceModeActive) {
              const finalSpeech = latestVoiceSpeechRef.current.trim();
              if (finalSpeech) {
                processUserVoiceInput(finalSpeech);
              } else {
                setVoiceSubtitles(getLocaleConfig().unheard);
                setTimeout(() => { startListeningLoop(); }, 1500);
              }
            }
          };
          
          webSpeechRecRef.current = rec;
          rec.start();
          return true;
        } catch (err) {
          console.error("Web SpeechRecognition start error:", err);
        }
      }
    } else if (isVoiceAvailable) {
      try {
        await Voice.stop().catch(() => {});
        await Voice.start(lang);
        return true;
      } catch (e) {
        console.error("Native Voice start error:", e);
      }
    }
    return false;
  };

  const stopVoiceCapture = async () => {
    if (Platform.OS === 'web') {
      if (webSpeechRecRef.current) {
        webSpeechRecRef.current.stop();
      }
    } else if (isVoiceAvailable) {
      try {
        await Voice.stop().catch(() => {});
      } catch (e) {}
    }
  };

  const getMultilingualFallback = (input: string, lang: string): string => {
    const msg = input.toLowerCase();
    const config = (VOICE_LOCALES as any)[lang] || VOICE_LOCALES['en-US'];
    const r = config.fallbackReplies;
    
    if (msg.includes('blood pressure') || msg.includes('bp') || msg.includes('रक्तचाप') || msg.includes('बीपी') || msg.includes('રક્તચાપ') || msg.includes('இரத்த அழுத்தம்') || msg.includes('రక్తపోటు') || msg.includes('రక్త దాబ')) {
      return r.bp;
    }
    if (msg.includes('headache') || msg.includes('head') || msg.includes('सिरदर्द') || msg.includes('सिर दर्द') || msg.includes('डोकेदुखी') || msg.includes('માથાનો દુખાવો') || msg.includes('தலைவலி') || msg.includes('తలనొప్పి')) {
      return r.headache;
    }
    if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('energy') || msg.includes('थकान') || msg.includes('कमजोरी') || msg.includes('थकवा') || msg.includes('થાક') || msg.includes('சோர்வு') || msg.includes('అలసట')) {
      return r.fatigue;
    }
    if (msg.includes('medic') || msg.includes('tablet') || msg.includes('pill') || msg.includes('दवा') || msg.includes('गोली') || msg.includes('औषध') || msg.includes('દવા') || msg.includes('மருந்து') || msg.includes('మందు')) {
      return r.med;
    }
    if (msg.includes('pain') || msg.includes('hurt') || msg.includes('ache') || msg.includes('दर्द') || msg.includes('वेदना') || msg.includes('દુખાવો') || msg.includes('வலி') || msg.includes('నొప్పి')) {
      return r.pain;
    }
    return r.default;
  };

  // Concentric circle animation loops
  useEffect(() => {
    let animations: Animated.CompositeAnimation[] = [];

    if (voiceModeActive) {
      if (voiceState === 'listening') {
        const createPulse = (scaleVal: Animated.Value, opacityVal: Animated.Value, maxScale: number, baseOpacity: number, duration: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.parallel([
                Animated.timing(scaleVal, { toValue: maxScale, duration, useNativeDriver: true }),
                Animated.timing(opacityVal, { toValue: baseOpacity * 1.5, duration, useNativeDriver: true }),
              ]),
              Animated.parallel([
                Animated.timing(scaleVal, { toValue: 1, duration, useNativeDriver: true }),
                Animated.timing(opacityVal, { toValue: baseOpacity, duration, useNativeDriver: true }),
              ]),
            ])
          );
        };
        animations = [
          createPulse(blobScale1, blobOpacity1, 1.1, 0.2, 1200),
          createPulse(blobScale2, blobOpacity2, 1.15, 0.15, 1600),
          createPulse(blobScale3, blobOpacity3, 1.2, 0.08, 2000),
        ];
        animations.forEach(a => a.start());
      } else if (voiceState === 'thinking') {
        const createThinkPulse = (scaleVal: Animated.Value, opacityVal: Animated.Value, duration: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(scaleVal, { toValue: 1.08, duration, useNativeDriver: true }),
              Animated.timing(scaleVal, { toValue: 0.95, duration, useNativeDriver: true }),
            ])
          );
        };
        animations = [
          createThinkPulse(blobScale1, blobOpacity1, 400),
          createThinkPulse(blobScale2, blobOpacity2, 500),
          createThinkPulse(blobScale3, blobOpacity3, 600),
        ];
        animations.forEach(a => a.start());
      } else if (voiceState === 'speaking') {
        const createRipple = (scaleVal: Animated.Value, opacityVal: Animated.Value, maxScale: number, startOpacity: number, delay: number) => {
          scaleVal.setValue(1);
          opacityVal.setValue(startOpacity);
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.parallel([
                Animated.timing(scaleVal, { toValue: maxScale, duration: 1500, useNativeDriver: true }),
                Animated.timing(opacityVal, { toValue: 0, duration: 1500, useNativeDriver: true }),
              ]),
            ])
          );
        };
        animations = [
          createRipple(blobScale1, blobOpacity1, 1.5, 0.4, 0),
          createRipple(blobScale2, blobOpacity2, 1.8, 0.3, 400),
          createRipple(blobScale3, blobOpacity3, 2.1, 0.2, 800),
        ];
        animations.forEach(a => a.start());
      }
    }

    return () => {
      animations.forEach(a => a.stop());
      blobScale1.setValue(1);
      blobScale2.setValue(1);
      blobScale3.setValue(1);
      blobOpacity1.setValue(0.2);
      blobOpacity2.setValue(0.15);
      blobOpacity3.setValue(0.1);
    };
  }, [voiceModeActive, voiceState]);

  // Voice mode interaction loop
  useEffect(() => {
    if (voiceModeActive) {
      startVoiceGreeting();
    } else {
      Speech.stop();
      if (voiceInteractionTimer.current) clearTimeout(voiceInteractionTimer.current);
      stopVoiceCapture();
    }
    return () => {
      Speech.stop();
      if (voiceInteractionTimer.current) clearTimeout(voiceInteractionTimer.current);
      stopVoiceCapture();
    };
  }, [voiceModeActive, voiceLang]);

  const startVoiceGreeting = async () => {
    await stopVoiceCapture();
    await Speech.stop();
    if (voiceInteractionTimer.current) clearTimeout(voiceInteractionTimer.current);

    setVoiceState('speaking');
    const greeting = getLocaleConfig().greeting;
    setVoiceSubtitles(greeting);

    const systemMsg: Message = {
      id: 'greet-' + Date.now(),
      text: greeting,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMsg]);

    let speakDoneCalled = false;
    const handleSpeakDone = () => {
      if (speakDoneCalled) return;
      speakDoneCalled = true;
      if (voiceInteractionTimer.current) clearTimeout(voiceInteractionTimer.current);
      startListeningLoop();
    };

    const approxDuration = (greeting.length * 85) + 1200;
    voiceInteractionTimer.current = setTimeout(() => {
      console.log("Speech.speak greeting safety timeout fired");
      handleSpeakDone();
    }, approxDuration);

    Speech.speak(greeting, {
      language: voiceLang,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => { handleSpeakDone(); },
      onError: (e) => {
        console.error("Speech error:", e);
        handleSpeakDone();
      }
    });
  };

  const startListeningLoop = async () => {
    const hasMicPermission = await requestMicPermission();
    if (!hasMicPermission) {
      setVoiceSubtitles("Microphone permission is required for voice mode. Please enable microphone access in your settings.");
      setVoiceState('paused');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVoiceState('listening');
    setVoiceSubtitles(getLocaleConfig().listening);
    latestVoiceSpeechRef.current = '';

    const voiceStarted = await startVoiceCapture(voiceLang);

    if (!voiceStarted) {
      console.log("Speech recognition not available on this platform. Displaying manual fallback options.");
      setVoiceSubtitles("Speech recognition is not active on this device. You can type your query below or choose one of the suggestions.");
    }
  };

  const getFallbackReplyHindi = (input: string): string => {
    const msg = input.toLowerCase();
    if (msg.includes('blood pressure') || msg.includes('bp') || msg.includes('रक्तचाप') || msg.includes('बीपी')) {
      return 'आपका रक्तचाप ठीक लग रहा है। अपनी दवाएं नियमित रूप से लेते रहें और समय-समय पर जांच करते रहें।';
    }
    if (msg.includes('headache') || msg.includes('head') || msg.includes('सिरदर्द') || msg.includes('सिर दर्द')) {
      return 'सिरदर्द रक्तचाप में उतार-चढ़ाव या निर्जलीकरण से जुड़ा हो सकता है। मैंने इस लक्षण को नोट कर लिया है। आप कब से ऐसा महसूस कर रहे हैं?';
    }
    if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('थकान') || msg.includes('कमजोरी')) {
      return 'थकान मधुमेह या नींद की कमी के कारण हो सकती है। क्या आप 7-8 घंटे सो रहे हैं?';
    }
    if (msg.includes('medic') || msg.includes('tablet') || msg.includes('दवा') || msg.includes('गोली')) {
      return 'याद रखें कि डॉक्टर के परामर्श के अनुसार दवाएं समय पर लें। क्या आपने आज की खुराक ले ली है?';
    }
    if (msg.includes('दर्द') || msg.includes('pain') || msg.includes('तकलीफ')) {
      return 'मुझे यह सुनकर खेद है। दर्द कहां हो रहा है और यह कितना गंभीर है (1 से 10 के पैमाने पर)?';
    }
    return 'साझा करने के लिए धन्यवाद। मैं इस जानकारी को आपके दैनिक स्वास्थ्य प्रोफाइल में दर्ज कर रहा हूं। क्या कोई अन्य लक्षण हैं?';
  };

  const processUserVoiceInput = async (spokenText: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVoiceState('thinking');
    setVoiceSubtitles(spokenText);

    const userMessage: Message = {
      id: 'voice-user-' + Date.now(),
      text: spokenText,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const sessionId = 'session-' + (user?.id || 'patient-123');
    const context = {
      rolling_summary: "Voice conversation session",
      profile_summary: "Voice onboarding",
      last_7_summaries: [],
      active_medications: [],
      pending_doctor_questions: []
    };

    try {
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.MESSAGE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: user?.id || 'patient-123',
          session_id: sessionId,
          message: spokenText,
          patient_context: context,
        }),
      });
      if (!response.ok) throw new Error("Backend connection issue");
      const data = await response.json();
      const reply = data.bot_reply || getMultilingualFallback(spokenText, voiceLang);
      speakAIVoiceResponse(reply);
    } catch (e) {
      console.error(e);
      const fallback = getMultilingualFallback(spokenText, voiceLang);
      speakAIVoiceResponse(fallback);
    }
  };

  const speakAIVoiceResponse = (replyText: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVoiceState('speaking');
    setVoiceSubtitles(replyText);

    const aiMessage: Message = {
      id: 'voice-ai-' + Date.now(),
      text: replyText,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);

    let speakDoneCalled = false;
    const handleSpeakDone = () => {
      if (speakDoneCalled) return;
      speakDoneCalled = true;
      if (voiceInteractionTimer.current) clearTimeout(voiceInteractionTimer.current);
      startListeningLoop();
    };

    const approxDuration = (replyText.length * 85) + 1200;
    voiceInteractionTimer.current = setTimeout(() => {
      console.log("Speech.speak response safety timeout fired");
      handleSpeakDone();
    }, approxDuration);

    Speech.speak(replyText, {
      language: voiceLang,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => { handleSpeakDone(); },
      onError: (e) => {
        console.error(e);
        handleSpeakDone();
      }
    });
  };

  // Slide drawer animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showHistory ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [showHistory]);

  const toggleDayExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (user) {
      fetchUserName();
    }
  }, [user]);

  const fetchUserName = async () => {
    const { data } = await supabase
      .from('patients')
      .select('full_name')
      .eq('id', user?.id)
      .single();
    if (data?.full_name) setUserName(data.full_name);
  };

  const getUserInitials = () => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (user?.id) {
        const sessionId = 'session-' + user.id;
        fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.END_SESSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: user.id, session_id: sessionId })
        }).catch(e => console.error("End session error:", e));
      }
    };
  }, [user]);

  const getFallbackReply = (input: string): string => {
    const msg = input.toLowerCase();
    if (msg.includes('blood pressure') || msg.includes('bp')) return 'Your recent BP readings have been tracking around 118/76 — within normal range. Continue your Amlodipine as prescribed and monitor weekly.';
    if (msg.includes('headache') || msg.includes('head')) return 'Headaches can be linked to blood pressure fluctuations or dehydration. I\'ve noted this symptom. How long has this been going on?';
    if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('energy')) return 'Fatigue is a common concern with your conditions. Are you sleeping 7-8 hours? Let\'s also check if you\'ve missed any doses recently.';
    if (msg.includes('medic') || msg.includes('tablet') || msg.includes('pill')) return 'You have 3 active medications: Metformin 500mg (morning), Amlodipine 5mg (evening), Vitamin D3 (afternoon). Have you been taking them consistently?';
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return 'Hello! How are you feeling today? I\'m your AI health assistant — tell me about any symptoms, medications, or health concerns.';
    if (msg.includes('pain') || msg.includes('hurt') || msg.includes('ache')) return 'I understand you\'re experiencing pain. Can you tell me where exactly and rate it from 1-10? This helps me assess the severity.';
    if (msg.includes('sugar') || msg.includes('glucose') || msg.includes('diabet')) return 'Blood sugar management is key with your profile. Have you checked your levels today? Aim for fasting glucose below 126 mg/dL.';
    if (msg.includes('sleep') || msg.includes('insomnia')) return 'Sleep quality directly impacts your heart health and blood pressure. 7-8 hours is recommended. Any difficulty falling asleep or staying asleep?';
    return 'Thank you for sharing that. I\'m tracking this information to build your health profile. Can you tell me more, or is there a specific symptom you\'d like to discuss?';
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    const sessionId = 'session-' + (user?.id || 'patient-123');
    const context = {
      rolling_summary: "Initial onboarding conversation",
      profile_summary: "New patient onboarding",
      last_7_summaries: [],
      active_medications: [],
      pending_doctor_questions: []
    };

    fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.MESSAGE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: user?.id || 'patient-123',
        session_id: sessionId,
        message: currentInput,
        patient_context: context,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Backend connection issue");
        return res.json();
      })
      .then(data => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.bot_reply || getFallbackReply(currentInput),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      })
      .catch(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: getFallbackReply(currentInput),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      })
      .finally(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsLoading(false);
      });
  };

  const handleEndSession = async () => {
    setShowHistory(false);
    setShowAgentLog(true);
    // Execute backend call in background to prevent blocking during cold-starts
    backendService.endSession(
      user?.id || 'patient-123',
      messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
      ""
    ).catch(e => console.error("End session error in background:", e));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#0474FC" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{getUserInitials()}</Text>
        </View>
      )}
    </View>
  );

  const renderHistoryDrawer = () => {
    const translateX = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [screenWidth, 0],
    });

    return (
      <Animated.View
        style={[
          styles.historyDrawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.historySafeArea}>
          <View style={styles.historyHeader}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowHistory(false);
              }}
              style={styles.historyCloseButton}
            >
              <Ionicons name="arrow-back" size={24} color="#0474FC" />
            </TouchableOpacity>
            <Text style={styles.historyTitle}>Daily Health History</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.historyContent}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_HISTORY.map((item, index) => {
              const isExpanded = !!expandedDays[item.id];
              return (
                <View key={item.id} style={styles.timelineRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleDayExpand(item.id)}
                    style={[styles.historyCard, isExpanded && styles.historyCardExpanded]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardDateText}>{item.date} • {item.time}</Text>
                      <View style={styles.cardHeaderRight}>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color="#0474FC"
                        />
                      </View>
                    </View>

                    <Text style={styles.cardSummaryText}>{item.overallSummary}</Text>

                    {isExpanded && (
                      <View style={styles.expandedSection}>
                        <View style={styles.divider} />
                        <Text style={styles.agentSectionTitle}>Agent Diagnostics</Text>
                        
                        {item.agents.map((agent, aIdx) => (
                          <View key={aIdx} style={styles.agentThoughtRow}>
                            <View style={styles.agentHeader}>
                              <Ionicons name="hardware-chip-outline" size={14} color="#0474FC" />
                              <Text style={styles.agentName}>{agent.name}</Text>
                              <Text style={styles.agentRole}>({agent.role})</Text>
                            </View>
                            <Text style={styles.agentThoughtText}>{agent.thought}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.timelineRightCol}>
                    <View
                      style={[
                        styles.timelineLine,
                        index === 0 && styles.timelineLineFirst,
                        index === MOCK_HISTORY.length - 1 && styles.timelineLineLast,
                      ]}
                    />
                    <View style={styles.timelineNode}>
                      <View style={styles.timelineNodeInner} />
                    </View>
                    <Text style={styles.timelineDateBadge}>{item.shortDate}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.historyFooter}>
            <TouchableOpacity
              onPress={handleEndSession}
              style={styles.processButton}
            >
              <Text style={styles.processButtonText}>Process Session & Run Diagnostics</Text>
              <Ionicons name="analytics" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  const renderVoiceOverlay = () => {
    if (!voiceModeActive) return null;

    return (
      <LinearGradient colors={['#0B0F19', '#020408']} style={styles.voiceOverlay}>
        <SafeAreaView style={styles.voiceSafeArea}>
          <View style={styles.voiceOverlayHeader}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setVoiceModeActive(false);
              }}
              style={styles.voiceCloseButton}
            >
              <Ionicons name="close-circle" size={36} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.voiceHeaderTitle}>Voice Mode</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Horizontal Language Selector */}
          <View style={styles.langSelectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.langSelectorScroll}
            >
              {Object.entries(VOICE_LOCALES).map(([code, config]) => {
                const isSelected = voiceLang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setVoiceLang(code as any);
                    }}
                    style={[
                      styles.langChip,
                      isSelected && styles.langChipSelected
                    ]}
                  >
                    <Ionicons 
                      name="language" 
                      size={13} 
                      color={isSelected ? '#0F172A' : '#8AA0BC'} 
                      style={{ marginRight: 4 }} 
                    />
                    <Text style={[
                      styles.langChipText,
                      isSelected && styles.langChipTextSelected
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.voiceVisualizerContainer}>
            <View style={styles.blobAnchor}>
              <Animated.View
                style={[
                  styles.blobCircle,
                  styles.blobCircleOuter,
                  {
                    transform: [{ scale: blobScale3 }],
                    opacity: blobOpacity3,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.blobCircle,
                  styles.blobCircleMiddle,
                  {
                    transform: [{ scale: blobScale2 }],
                    opacity: blobOpacity2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.blobCircle,
                  styles.blobCircleInner,
                  {
                    transform: [{ scale: blobScale1 }],
                    opacity: blobOpacity1,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={async () => {
                  if (voiceState === 'listening') {
                    if (isVoiceAvailable || Platform.OS === 'web') {
                      await stopVoiceCapture();
                    } else {
                      // Manual selection fallback
                      const simulatedUserSayings = getLocaleConfig().suggestions;
                      const randomSaying = simulatedUserSayings[Math.floor(Math.random() * simulatedUserSayings.length)];
                      processUserVoiceInput(randomSaying);
                    }
                  }
                }}
                activeOpacity={0.8}
                style={styles.blobCoreWrapper}
              >
                <LinearGradient
                  colors={['#06B6D4', '#0474FC', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.blobCore}
                >
                  <Ionicons
                    name={
                      voiceState === 'listening'
                        ? 'mic'
                        : voiceState === 'thinking'
                        ? 'sync-outline'
                        : 'volume-high'
                    }
                    size={32}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.voiceStatusText}>
              {voiceState === 'listening'
                ? getLocaleConfig().statusListening
                : voiceState === 'thinking'
                ? getLocaleConfig().thinking
                : getLocaleConfig().speaking}
            </Text>
          </View>

          <View style={styles.voiceSubtitlesContainer}>
            <ScrollView
              style={styles.subtitlesScroll}
              contentContainerStyle={styles.subtitlesContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subtitlesText}>{voiceSubtitles}</Text>
            </ScrollView>
          </View>

          {/* Suggestion Chips and Manual Input Fallback */}
          {voiceState === 'listening' && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsScroll}
              >
                {getLocaleConfig().suggestions.map((suggestion: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      processUserVoiceInput(suggestion);
                    }}
                    style={styles.suggestionChip}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {voiceState === 'listening' && !isVoiceAvailable && Platform.OS !== 'web' && (
            <View style={styles.voiceInputRow}>
              <TextInput
                style={styles.voiceTextInput}
                placeholder="Type your symptoms/query..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={voiceInputText}
                onChangeText={setVoiceInputText}
                onSubmitEditing={() => {
                  if (voiceInputText.trim()) {
                    processUserVoiceInput(voiceInputText.trim());
                    setVoiceInputText('');
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (voiceInputText.trim()) {
                    processUserVoiceInput(voiceInputText.trim());
                    setVoiceInputText('');
                  }
                }}
                style={styles.voiceSendButton}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', paddingHorizontal: 20 }}>
              {voiceState === 'listening' 
                ? (isVoiceAvailable || Platform.OS === 'web' 
                    ? getLocaleConfig().instruction 
                    : "Speech recognition unavailable. Tap a suggestion above or type below.")
                : ''}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0474FC" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#0474FC" />
          </View>
          <Text style={styles.headerTitle}>Swasthya AI Assistant</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={async () => {
                Keyboard.dismiss();
                await requestMicPermission();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setVoiceModeActive(true);
              }}
              style={styles.headerActionButton}
            >
              <Ionicons name="headset" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowHistory(true);
              }}
              style={styles.historyButton}
            >
              <Ionicons name="time" size={16} color="#FFFFFF" />
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0474FC" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <Animated.View style={{ transform: [{ scale: voicePulseAnim }] }}>
            <TouchableOpacity
              onPress={handleVoicePress}
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={20}
                color={isRecording ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </Animated.View>

          <TextInput
            style={styles.input}
            placeholder={isRecording ? "Listening... Speak now!" : "Ask me anything about your health..."}
            placeholderTextColor={isRecording ? "#EF4444" : "#9CA3AF"}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isRecording && !isLoading}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading || isRecording}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading || isRecording) && styles.sendButtonDisabled
            ]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* History Drawer Overlay */}
      {renderHistoryDrawer()}

      {/* Voice Overlay */}
      {renderVoiceOverlay()}

      {/* Agent Log Overlay */}
      {showAgentLog && (
        <View style={StyleSheet.absoluteFillObject}>
          <AgentLog onClose={() => setShowAgentLog(false)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#171717',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 16,
    backgroundColor: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0474FC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#0474FC',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#212121',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#ECECF1',
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#171717',
  },
  loadingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 10,
    backgroundColor: '#171717',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#212121',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#212121',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Voice mode overlay styles
  voiceOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  voiceSafeArea: {
    flex: 1,
  },
  voiceOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 52,
    paddingBottom: 16,
  },
  voiceCloseButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  langSelectorContainer: {
    height: 48,
    marginVertical: 4,
  },
  langSelectorScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  langChipSelected: {
    backgroundColor: '#06B6D4',
    borderColor: '#22D3EE',
  },
  langChipText: {
    color: '#8AA0BC',
    fontSize: 12,
    fontWeight: '600',
  },
  langChipTextSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  suggestionsTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  voiceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  voiceTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: 40,
    paddingRight: 8,
  },
  voiceSendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceVisualizerContainer: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  blobAnchor: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blobCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobCircleOuter: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(147, 51, 234, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.12)',
  },
  blobCircleMiddle: {
    width: 170,
    height: 170,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.18)',
  },
  blobCircleInner: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  blobCoreWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
  },
  blobCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceStatusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 30,
    letterSpacing: 0.5,
  },
  voiceSubtitlesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: 20,
  },
  subtitlesScroll: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitlesContent: {
    padding: 16,
    alignItems: 'center',
  },
  subtitlesText: {
    color: '#ECECF1',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },

  // History Drawer styles
  historyDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    zIndex: 1000,
  },
  historySafeArea: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: Platform.OS === 'ios' ? 32 : 42,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  historyCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyContent: {
    padding: 16,
    paddingRight: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
    minHeight: 100,
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyCardExpanded: {
    borderColor: '#0474FC',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDateText: {
    color: '#0474FC',
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSummaryText: {
    color: '#ECECF1',
    fontSize: 14,
    lineHeight: 20,
  },
  expandedSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 12,
  },
  agentSectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentThoughtRow: {
    backgroundColor: '#171717',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0474FC',
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  agentName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  agentRole: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  agentThoughtText: {
    color: '#ECECF1',
    fontSize: 12.5,
    lineHeight: 18,
  },
  timelineRightCol: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#2D2D2D',
  },
  timelineLineFirst: {
    top: 24,
  },
  timelineLineLast: {
    bottom: '60%',
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A2E40',
    borderWidth: 2,
    borderColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    zIndex: 10,
  },
  timelineNodeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0474FC',
  },
  timelineDateBadge: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  historyFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    backgroundColor: '#121212',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0474FC',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});