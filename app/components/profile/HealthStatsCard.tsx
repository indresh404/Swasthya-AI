// app/components/profile/HealthStatsCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  },
};

interface HealthStatsCardProps {
  stats?: { icon: string; label: string; value: string; color: string; iconColor: string }[];
}

export const HealthStatsCard: React.FC<HealthStatsCardProps> = ({
  stats = [
    { icon: 'medical-outline', label: 'Records', value: '12', color: '#E8F1FE', iconColor: '#0474FC' },
    { icon: 'fitness-outline', label: 'Symptoms', value: '5', color: '#FEE2E2', iconColor: '#EF4444' },
    { icon: 'medkit-outline', label: 'Medications', value: '2', color: '#ECFDF5', iconColor: '#10B981' },
  ],
}) => {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
            <Ionicons name={stat.icon as any} size={22} color={stat.iconColor} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});

export default HealthStatsCard;