// app/context/CheckinContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { LayoutAnimation, UIManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock API - Simulates backend question delivery
const MOCK_API = {
  initialQuestions: [
    { id: 'q1', question_text: 'How are you feeling today overall?', asked_by: 'ai', category: 'general', options: ['😊 Feeling Great', '😐 Okay', '😔 Not Good'] },
    { id: 'q2', question_text: 'Have you taken your medications today?', asked_by: 'doctor', category: 'medication', options: ['✅ Yes, all taken', '⏳ Some missed', '❌ Not yet'] },
    { id: 'q3', question_text: 'Any unusual symptoms today?', asked_by: 'ai', category: 'symptoms', options: ['✅ None', '🟡 Mild', '🟠 Moderate', '🔴 Severe'] },
    { id: 'q4', question_text: 'How was your sleep quality?', asked_by: 'doctor', category: 'sleep', options: ['⭐ Excellent', '👍 Good', '👎 Fair', '😴 Poor'] },
    { id: 'q5', question_text: 'Feeling stressed or anxious?', asked_by: 'ai', category: 'mental', options: ['😌 None', '😟 Mild', '😰 Moderate', '😱 High'] },
  ],
  
  simulateNewQuestion: () => {
    const newQuestions = [
      { id: `q${Date.now()}-1`, question_text: 'How is your appetite today?', asked_by: 'ai', category: 'nutrition', options: ['🍽️ Normal', '🍲 Reduced', '🍔 Increased'] },
      { id: `q${Date.now()}-2`, question_text: 'Have you exercised recently?', asked_by: 'doctor', category: 'lifestyle', options: ['🏃 Yes', '🚶 Light walk', '🛋️ No'] },
      { id: `q${Date.now()}-3`, question_text: 'Are you experiencing any pain?', asked_by: 'ai', category: 'symptoms', options: ['✅ No pain', '🟡 Mild', '🟠 Moderate', '🔴 Severe'] },
      { id: `q${Date.now()}-4`, question_text: 'How is your energy level?', asked_by: 'doctor', category: 'general', options: ['⚡ High', '🔋 Moderate', '🪫 Low'] },
      { id: `q${Date.now()}-5`, question_text: 'Have you been sleeping well?', asked_by: 'ai', category: 'sleep', options: ['😴 Yes', '😐 Sometimes', '😫 No'] },
      { id: `q${Date.now()}-6`, question_text: 'Any changes in your mood?', asked_by: 'doctor', category: 'mental', options: ['😊 Stable', '😐 Slight ', '😔 Significant '] },
    ];
    return newQuestions[Math.floor(Math.random() * newQuestions.length)];
  }
};

// Types
interface Question {
  id: string;
  question_text: string;
  asked_by: 'ai' | 'doctor';
  category: string;
  options: string[];
  originalId?: string;
}

interface CompletedQuestion extends Question {
  answer: string;
  answeredAt: string;
}

interface CheckinState {
  pendingQuestions: Question[];
  completedQuestions: CompletedQuestion[];
  selectedAnswers: Record<string, string>;
  isLoading: boolean;
  isInitialized: boolean;
  lastUpdated: string;
}

interface CheckinContextType {
  pendingQuestions: Question[];
  completedQuestions: CompletedQuestion[];
  selectedAnswers: Record<string, string>;
  isLoading: boolean;
  isInitialized: boolean;
  handleAnswer: (questionId: string, answer: string) => void;
  handleRemoveQuestion: (questionId: string) => void;
  getProgress: () => { completed: number; total: number; progress: number };
  loadInitialQuestions: () => Promise<void>;
  resetState: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const STORAGE_KEY = '@checkin_state';
const CHECKIN_VERSION = '1.0.0';

const CheckinContext = createContext<CheckinContextType | undefined>(undefined);

export const useCheckin = () => {
  const context = useContext(CheckinContext);
  if (!context) {
    throw new Error('useCheckin must be used within a CheckinProvider');
  }
  return context;
};

export const CheckinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const newQuestionTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<Question[]>([]);
  const completedRef = useRef<CompletedQuestion[]>([]);
  const isMounted = useRef(true);

  // Update refs when state changes
  useEffect(() => {
    pendingRef.current = pendingQuestions;
  }, [pendingQuestions]);

  useEffect(() => {
    completedRef.current = completedQuestions;
  }, [completedQuestions]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (newQuestionTimer.current) {
        clearInterval(newQuestionTimer.current);
        newQuestionTimer.current = null;
      }
    };
  }, []);

  // Save state to AsyncStorage
  const saveState = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const state: CheckinState = {
        pendingQuestions,
        completedQuestions,
        selectedAnswers,
        isLoading: false,
        isInitialized: true,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save checkin state:', error);
    }
  }, [pendingQuestions, completedQuestions, selectedAnswers]);

  // Load state from AsyncStorage
  const loadState = useCallback(async (): Promise<CheckinState | null> => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed: CheckinState = JSON.parse(savedState);
        // Validate state structure
        if (parsed.pendingQuestions && parsed.completedQuestions && parsed.selectedAnswers !== undefined) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load checkin state:', error);
      return null;
    }
  }, []);

  // Load initial questions from API
  const loadInitialQuestions = useCallback(async () => {
    try {
      // Check for saved state first
      const savedState = await loadState();
      
      if (savedState && isMounted.current) {
        // Restore from saved state
        setPendingQuestions(savedState.pendingQuestions);
        setCompletedQuestions(savedState.completedQuestions);
        setSelectedAnswers(savedState.selectedAnswers);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // No saved state - load from API
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      if (isMounted.current) {
        setPendingQuestions(MOCK_API.initialQuestions);
        setCompletedQuestions([]);
        setSelectedAnswers({});
        setIsLoading(false);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to load initial questions:', error);
      if (isMounted.current) {
        // Fallback to mock data
        setPendingQuestions(MOCK_API.initialQuestions);
        setCompletedQuestions([]);
        setSelectedAnswers({});
        setIsLoading(false);
        setIsInitialized(true);
      }
    }
  }, [loadState]);

  // Initialize on mount
  useEffect(() => {
    loadInitialQuestions();
  }, [loadInitialQuestions]);

  // Auto-save on state changes
  useEffect(() => {
    if (isInitialized && isMounted.current) {
      saveState();
    }
  }, [pendingQuestions, completedQuestions, selectedAnswers, isInitialized, saveState]);

  // Simulate new questions from backend
  useEffect(() => {
    // Clear any existing timer
    if (newQuestionTimer.current) {
      clearInterval(newQuestionTimer.current);
      newQuestionTimer.current = null;
    }

    // Start new timer only if component is mounted
    if (isMounted.current) {
      newQuestionTimer.current = setInterval(() => {
        // Only send new questions when pending list is empty AND we have completed questions
        if (
          isMounted.current &&
          pendingRef.current.length === 0 &&
          completedRef.current.length > 0
        ) {
          const newQ = MOCK_API.simulateNewQuestion();
          setPendingQuestions(prev => {
            // Ensure we don't duplicate questions
            const exists = prev.some(q => q.id === newQ.id);
            if (exists) {
              // Generate a new ID if duplicate
              newQ.id = `${newQ.id}-${Date.now()}`;
            }
            return [...prev, newQ];
          });
        }
      }, 15000); // Every 15 seconds
    }

    return () => {
      if (newQuestionTimer.current) {
        clearInterval(newQuestionTimer.current);
        newQuestionTimer.current = null;
      }
    };
  }, []);

  // Handle answering a question
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    const question = pendingQuestions.find(q => q.id === questionId);
    if (question) {
      const completed: CompletedQuestion = {
        ...question,
        answer,
        answeredAt: new Date().toISOString(),
      };
      setCompletedQuestions(prev => [...prev, completed]);
      
      // Animate removal
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [pendingQuestions]);

  // Remove question from pending list
  const handleRemoveQuestion = useCallback((questionId: string) => {
    setPendingQuestions(prev => {
      const newList = prev.filter(q => q.id !== questionId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return newList;
    });
  }, []);

  // Get progress
  const getProgress = useCallback(() => {
    const total = pendingQuestions.length + completedQuestions.length;
    const completed = completedQuestions.length;
    const progress = total > 0 ? completed / total : 0;
    return { completed, total, progress };
  }, [pendingQuestions, completedQuestions]);

  // Reset state (for testing or when user logs out)
  const resetState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setPendingQuestions(MOCK_API.initialQuestions);
      setCompletedQuestions([]);
      setSelectedAnswers({});
      setIsLoading(false);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to reset state:', error);
    }
  }, []);

  // Clear all data (for testing)
  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setPendingQuestions([]);
      setCompletedQuestions([]);
      setSelectedAnswers({});
      setIsLoading(true);
      setIsInitialized(false);
      // Reload initial questions
      await loadInitialQuestions();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }, [loadInitialQuestions]);

  const value = {
    pendingQuestions,
    completedQuestions,
    selectedAnswers,
    isLoading,
    isInitialized,
    handleAnswer,
    handleRemoveQuestion,
    getProgress,
    loadInitialQuestions,
    resetState,
    clearAllData,
  };

  return (
    <CheckinContext.Provider value={value}>
      {children}
    </CheckinContext.Provider>
  );
};

export default CheckinContext;