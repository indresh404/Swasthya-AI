// app/chat/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, Modal } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { SavingBanner } from '@/components/chat/SavingBanner';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { AgentLog } from '@/components/chat/AgentLog';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

const SUGGESTIONS = [
  'I have a severe headache since morning',
  'I feel feverish and my temperature is 100F',
  'Chest tightness when climbing stairs',
  'Headache is gone and I feel better'
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  saveStatus?: {
    action: string;
    message: string;
    symptoms_created?: string[];
    symptoms_updated?: string[];
    symptoms_resolved?: string[];
  };
}

export default function ChatModalScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ 
    id: '1', 
    role: 'assistant', 
    content: '👋 Hello! I\'m Swasthya AI, your secure clinical assistant. I can track symptoms, log medications, and keep notes on your health.\n\n**Tell me how you are feeling, for example:**\n• "I have had a throbbing headache for 3 days"\n• "My fever is gone and I feel fine now"\n• "Taking paracetamol for muscle pain"',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'analyzing' | 'saving'>('idle');
  const [agentLogVisible, setAgentLogVisible] = useState(false);
  const { user, patientId } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async (messageText = text) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: trimmed,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setText('');
    setIsLoading(true);
    setSavingStatus('analyzing');

    try {
      const activePatientId = user?.id || patientId || 'demo-patient';
      
      const context = {
        rolling_summary: "Active clinical consultation",
        profile_summary: "",
      };

      console.log('[AIBot] Sending message to backend for patient:', activePatientId);
      const res = await backendService.sendMessage(activePatientId, trimmed, context);

      if (res && res.bot_reply) {
        if (res.medical_event) {
          setSavingStatus('saving');
          setTimeout(() => {
            setSavingStatus('idle');
          }, 1500);
        } else {
          setSavingStatus('idle');
        }

        const chatSaveStatus = res.save_status ? {
          action: res.save_status.action,
          symptom_name: (res.save_status.symptoms_created?.[0] || res.save_status.symptoms_updated?.[0] || res.save_status.symptoms_resolved?.[0] || ''),
          is_new: (res.save_status.symptoms_created?.length > 0),
          message: res.save_status.message
        } : undefined;

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.bot_reply,
          timestamp: new Date(),
          saveStatus: chatSaveStatus
        };
        
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (e) {
      console.error('[AIBot] Message send error:', e);
      setSavingStatus('idle');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "⚠️ **Connection Error**\n\nI was unable to connect to the clinical service. Please ensure the backend server is running and reachable.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (chipText: string) => {
    setText('');
    handleSend(chipText);
  };

  const handleClose = async () => {
    try {
      const activePatientId = user?.id || patientId || 'demo-patient';
      // Trigger endSession asynchronously to generate session summary on close
      backendService.endSession(activePatientId, [], "");
    } catch (err) {
      console.warn('[AIBot] Failed to trigger endSession on close:', err);
    }
    router.back();
  };

  return (
    <View style={styles.masterContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ChatHeader 
          title="Swasthya AI" 
          subtitle="Secure Clinical Companion" 
          onClose={handleClose}
          onAgentLogPress={() => setAgentLogVisible(true)}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.chatArea}>
            <SavingBanner status={savingStatus} />

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <ChatBubble 
                  role={item.role} 
                  content={item.content} 
                  timestamp={item.timestamp} 
                  saveStatus={item.saveStatus} 
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.messageList,
                { paddingBottom: 160 + insets.bottom }
              ]}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isLoading && savingStatus === 'analyzing' && (
              <View style={styles.typingIndicatorWrapper}>
                <TypingIndicator />
              </View>
            )}
          </View>

          <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.chipContainer}>
              <ScrollView horizontal style={styles.chips} showsHorizontalScrollIndicator={false}>
                {SUGGESTIONS.map((chip) => (
                  <TouchableOpacity 
                    key={chip} 
                    style={styles.chip} 
                    onPress={() => handleSuggestionPress(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ChatInput
              value={text}
              onChangeText={setText}
              onSend={() => handleSend()}
              placeholder="Report symptoms, dosage updates, etc..."
              disabled={isLoading}
              isLoading={isLoading}
            />
          </View>
        </KeyboardAvoidingView>

        <Modal 
          visible={agentLogVisible} 
          animationType="slide"
          transparent={false}
          onRequestClose={() => setAgentLogVisible(false)}
        >
          <AgentLog onClose={() => setAgentLogVisible(false)} />
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { 
    flex: 1, 
    backgroundColor: '#07111f' 
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f'
  },
  keyboardAvoidingView: {
    flex: 1,
    position: 'relative'
  },
  chatArea: {
    flex: 1,
    position: 'relative',
  },
  messageList: { 
    paddingVertical: SPACING.md, 
  },
  typingIndicatorWrapper: {
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
  },
  chipContainer: { 
    maxHeight: 50, 
    marginBottom: 8 
  },
  chips: { 
    paddingHorizontal: SPACING.md 
  },
  chip: { 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    marginRight: 8, 
    backgroundColor: '#1E293B', 
    height: 35 
  },
  chipText: { 
    color: '#ECECF1', 
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.sm 
  },
});
