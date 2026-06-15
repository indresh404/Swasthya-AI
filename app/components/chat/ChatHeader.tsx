// components/chat/ChatHeader.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { router } from 'expo-router';

interface ChatHeaderProps {
  onClose?: () => void;
  onAgentLogPress?: () => void;
  title?: string;
  subtitle?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClose = () => router.back(),
  onAgentLogPress = () => {},
  title = "Swasthya AI",
  subtitle = "Clinical Assistant"
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="close" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.pipelineButton} 
        onPress={onAgentLogPress}
        activeOpacity={0.7}
      >
        <Ionicons name="git-network-outline" size={22} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  titleContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  subtitle: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 1,
  },
  pipelineButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
});
