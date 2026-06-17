// app/components/profile/FamilyMembersList.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
  divider: '#E5E7EB',
};

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: string;
  risk: string;
  phone?: string;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ members }) => {
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'green':
        return COLORS.risk.low;
      case 'moderate':
      case 'yellow':
        return COLORS.risk.moderate;
      case 'elevated':
      case 'orange':
        return COLORS.risk.elevated;
      case 'high':
      case 'red':
        return COLORS.risk.high;
      default:
        return COLORS.risk.low;
    }
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('Unavailable', 'No phone number saved for this family member');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    Alert.alert(
      'Call',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${cleanPhone}`).catch(() => {
              Alert.alert('Error', 'Could not initiate call');
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Family Members</Text>
      {members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No family members found.</Text>
        </View>
      ) : (
        members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>{member.name[0]}</Text>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberSubtext}>
                {member.age} yrs • {member.relationship}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(member.risk) }]}>
                <Text style={styles.riskBadgeText}>{member.risk}</Text>
              </View>

              {member.phone && (
                <TouchableOpacity style={styles.callButton} onPress={() => handleCall(member.phone)}>
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  memberSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default FamilyMembersList;