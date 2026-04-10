// app/(tabs)/checkin/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput } from 'react-native';

// Static check-in questions data
const STATIC_QUESTIONS = [
  {
    id: '1',
    question_text: 'How are you feeling today overall?',
    asked_by: 'ai',
    created_at: '2026-04-10T08:00:00Z',
    category: 'general',
    options: ['Feeling Great', 'Okay', 'Not Good']
  },
  {
    id: '2',
    question_text: 'Have you taken your prescribed medications today?',
    asked_by: 'doctor',
    created_at: '2026-04-10T09:30:00Z',
    category: 'medication',
    options: ['Yes, all taken', 'Some missed', 'Not yet']
  },
  {
    id: '3',
    question_text: 'Are you experiencing any unusual symptoms?',
    asked_by: 'ai',
    created_at: '2026-04-10T10:15:00Z',
    category: 'symptoms',
    options: ['None', 'Mild', 'Moderate', 'Severe']
  },
  {
    id: '4',
    question_text: 'How would you rate your sleep quality last night?',
    asked_by: 'doctor',
    created_at: '2026-04-09T18:00:00Z',
    category: 'sleep',
    options: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  {
    id: '5',
    question_text: 'Have you experienced any stress or anxiety today?',
    asked_by: 'ai',
    created_at: '2026-04-10T07:00:00Z',
    category: 'mental',
    options: ['None', 'Mild', 'Moderate', 'High']
  }
];

const TopNavBar = ({ 
  onScanPress, 
  onNotificationPress, 
  onProfilePress, 
  notificationCount = 3, 
  userName = 'Rahul',
  activeScreen = 'checkin'
}: any) => {
  const getTitle = () => {
    switch(activeScreen) {
      case 'home': return 'DASHBOARD';
      case 'checkin': return 'CHECK-IN';
      case 'meds': return 'MEDICATIONS';
      case 'profile': return 'PROFILE';
      default: return 'CHECK-IN';
    }
  };

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={onScanPress} style={styles.leftButton}>
          <LinearGradient colors={['#0474FC', '#0360D0']} style={styles.gradientButton}>
            <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.centerPill}>
          <View style={styles.pillContent}>
            <View style={styles.blueDot} />
            <Text style={styles.pillText}>{getTitle()}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity activeOpacity={0.8} onPress={onNotificationPress} style={styles.iconButton}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={onProfilePress} style={styles.avatarButton}>
            <LinearGradient
              colors={['#0474FC', '#0360D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Component for rendering question tag with icon
const QuestionTag = ({ askedBy, date }: { askedBy: 'ai' | 'doctor'; date: string }) => {
  const isAI = askedBy === 'ai';
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View style={styles.tagContainer}>
      <View style={[styles.tag, isAI ? styles.aiTag : styles.doctorTag]}>
        <Ionicons 
          name={isAI ? "hardware-chip-outline" : "medkit-outline"} 
          size={14} 
          color={isAI ? '#8B5CF6' : '#059669'} 
        />
        <Text style={[styles.tagText, isAI ? styles.aiTagText : styles.doctorTagText]}>
          {isAI ? 'AI Suggested' : 'Doctor Asked'}
        </Text>
      </View>
      <View style={styles.dateTag}>
        <Ionicons name="calendar-outline" size={12} color="#6B7280" />
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

export default function CheckinScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [answers, setAnswers] = useState<Record<string, { answer: string; notes: string }>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer }
    }));
  };

  const handleNotes = (questionId: string, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes }
    }));
  };

  const toggleNotes = (questionId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredQuestions = STATIC_QUESTIONS.filter(q => !answers[q.id]?.answer);
    
    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Incomplete Check-in',
        `Please answer ${unansweredQuestions.length} more question(s) before submitting.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Prepare submission data
    const submissionData = STATIC_QUESTIONS.map(q => ({
      question_id: q.id,
      question_text: q.question_text,
      answer: answers[q.id].answer,
      notes: answers[q.id].notes || '',
      asked_by: q.asked_by,
      date: q.created_at
    }));

    console.log('Submitting check-in:', submissionData);
    
    Alert.alert(
      'Success', 
      'Thank you for completing your check-in! 🎉\n\nYour responses have been recorded.',
      [{ text: 'OK', onPress: () => {
        // Reset answers
        setAnswers({});
        setExpandedNotes({});
      }}]
    );
  };

  const getProgress = () => {
    const answered = Object.keys(answers).filter(id => answers[id]?.answer).length;
    return { answered, total: STATIC_QUESTIONS.length };
  };

  const progress = getProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Health Check-in</Text>
          <Text style={styles.subtitle}>Help us track your progress</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(progress.answered / progress.total) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.answered} / {progress.total} questions answered
            </Text>
          </View>
        </View>

        {/* Questions List */}
        <View>
          {STATIC_QUESTIONS.map((q) => {
            const currentAnswer = answers[q.id]?.answer || '';
            const currentNotes = answers[q.id]?.notes || '';
            const isExpanded = expandedNotes[q.id] || false;

            return (
              <View key={q.id} style={styles.questionCard}>
                <QuestionTag askedBy={q.asked_by as 'ai' | 'doctor'} date={q.created_at} />
                <Text style={styles.questionText}>{q.question_text}</Text>
                
                {/* Options */}
                <View style={styles.optionsContainer}>
                  {q.options.map(option => (
                    <TouchableOpacity 
                      key={option}
                      style={[
                        styles.optionButton,
                        currentAnswer === option && styles.optionButtonActive
                      ]}
                      onPress={() => handleAnswer(q.id, option)}
                    >
                      <Text style={[
                        styles.optionText,
                        currentAnswer === option && styles.optionTextActive
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Additional Notes Toggle */}
                <TouchableOpacity 
                  style={styles.notesToggle}
                  onPress={() => toggleNotes(q.id)}
                >
                  <Ionicons 
                    name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
                    size={18} 
                    color="#6B7280" 
                  />
                  <Text style={styles.notesToggleText}>
                    {isExpanded ? 'Hide additional details' : 'Add additional details (optional)'}
                  </Text>
                </TouchableOpacity>
                
                {/* Additional Notes Input */}
                {isExpanded && (
                  <TextInput
                    style={styles.answerInput}
                    placeholder="e.g., Started feeling this way after lunch, noticed some improvement after rest..."
                    placeholderTextColor="#9CA3AF"
                    value={currentNotes}
                    onChangeText={(text) => handleNotes(q.id, text)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}
              </View>
            );
          })}
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              progress.answered !== progress.total && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={progress.answered !== progress.total}
          >
            <Text style={styles.submitButtonText}>
              Complete Check-in ({progress.answered}/{progress.total})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
    width: '100%',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0474FC',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'right',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#0474FC',
    backgroundColor: '#E8F1FE',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  optionTextActive: {
    color: '#0474FC',
    fontWeight: '600',
  },
  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  notesToggleText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    minHeight: 80,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0474FC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    width: '100%',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tag styles
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  aiTag: {
    backgroundColor: '#F3E8FF',
  },
  doctorTag: {
    backgroundColor: '#D1FAE5',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiTagText: {
    color: '#8B5CF6',
  },
  doctorTagText: {
    color: '#059669',
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Top Navigation Bar Styles
  topNavContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  leftButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPill: {
    flex: 1,
    marginHorizontal: 12,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0474FC',
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#1F2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});