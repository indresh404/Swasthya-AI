// app/components/profile/AIInsightCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AIInsightCardProps {
  summaryText?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ summaryText }) => {
  // Demo AI summary for Indresh
  const defaultSummary = 
    "Swasthya AI has analyzed your health patterns. You show moderate risk factors with headache and anxiety being primary concerns. Regular monitoring and stress management recommended. Your adherence rate is 85% with stable vitals.";

  // Demo insights data
  const insights = [
    { icon: '😴', title: 'Sleep Pattern Alert', text: 'Irregular sleep correlates with 78% of headache occurrences.' },
    { icon: '🧘', title: 'Stress Management', text: 'Daily meditation could reduce anxiety by 45%.' },
    { icon: '🥗', title: 'Nutrition Impact', text: 'Regular meals could boost energy by 60%.' },
  ];

  const displaySummary = summaryText || defaultSummary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Ionicons name="sparkles" size={20} color="#60A5FA" />
          </View>
          <Text style={styles.title}>AI Health Insights</Text>
        </View>
        
        <Text style={styles.description}>
          {displaySummary}
        </Text>

        {/* Quick Insights */}
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightIconWrapper}>
                <Text style={styles.insightEmoji}>{insight.icon}</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#34D399" />
          <Text style={styles.footerText}>AI analysis based on your recent health data</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 16,
  },
  insightsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightEmoji: {
    fontSize: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  insightText: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default AIInsightCard;