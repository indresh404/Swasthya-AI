// components/onboarding/QuestionCard.tsx
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

interface QuestionCardProps {
  question: string;
  description: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  options?: string[];
  onSelectOption?: (option: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  description,
  value,
  onChangeText,
  placeholder = "Type your answer...",
  keyboardType = 'default',
  options,
  onSelectOption,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.description}>{description}</Text>

      {options ? (
        <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOptionButton
                ]}
                onPress={() => onSelectOption?.(opt)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[500]}
          keyboardType={keyboardType}
          autoFocus={true}
          autoCapitalize="sentences"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    minHeight: 250,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  question: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.xs,
  },
  description: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0F172A',
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#475569',
    marginTop: SPACING.xs,
  },
  optionsContainer: {
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  optionButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginVertical: 4,
  },
  selectedOptionButton: {
    backgroundColor: '#0474FC',
    borderColor: '#3B82F6',
  },
  optionText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
});
