// components/chat/SymptomBadge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SPACING, TYPOGRAPHY } from '@/theme';

interface SymptomBadgeProps {
  name: string;
  severity?: string | number | null;
  duration?: number | null;
  status?: string | null;
}

export const SymptomBadge: React.FC<SymptomBadgeProps> = ({ 
  name, 
  severity, 
  duration,
  status = 'active'
}) => {
  const getSeverityColor = () => {
    const sev = String(severity).toLowerCase();
    if (sev === 'severe' || sev === '9' || sev === '10' || sev === '8') return '#EF4444'; // Red
    if (sev === 'moderate' || sev === '6' || sev === '5' || sev === '7') return '#F97316'; // Orange
    return '#10B981'; // Green
  };

  const getStatusColor = () => {
    return status === 'resolved' ? '#6B7280' : getSeverityColor();
  };

  return (
    <View style={[styles.badge, { backgroundColor: `${getStatusColor()}15`, borderColor: getStatusColor() }]}>
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {name}
        {severity ? ` (${severity})` : ''}
        {duration ? ` • ${duration}d` : ''}
        {status === 'resolved' ? ' • Resolved' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
  },
});
