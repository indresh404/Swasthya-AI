// components/chat/ChatInput.tsx
import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Message Swasthya AI...",
  disabled = false,
  isLoading = false,
}) => {
  const handleVoicePress = () => {
    Alert.alert(
      "Voice Input",
      "Voice dictation and speech-to-text integration is currently a simulation stub in this version."
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.voiceButton} 
        onPress={handleVoicePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="mic-outline" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline={true}
        maxHeight={100}
        disabled={disabled}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!value.trim() || disabled) && styles.sendButtonDisabled
        ]}
        onPress={onSend}
        disabled={!value.trim() || disabled}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="arrow-up" 
          size={20} 
          color={value.trim() && !disabled ? COLORS.white : "#4B5563"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: SPACING.sm,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1E293B',
  },
});