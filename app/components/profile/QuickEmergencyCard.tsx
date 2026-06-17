// app/components/profile/QuickEmergencyCard.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#EF4444',
  primaryLight: '#FEE2E2',
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  divider: '#E5E7EB',
};

interface EmergencyContact {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

interface QuickEmergencyCardProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

export const QuickEmergencyCard: React.FC<QuickEmergencyCardProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');

  const handleCall = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    Alert.alert(
      'Call',
      `Call ${phoneNumber}?`,
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

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDeleteContact(id) },
      ]
    );
  };

  const validatePhone = (phoneNumber: string) => {
    const clean = phoneNumber.replace(/\D/g, '');
    return clean.length >= 10;
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (minimum 10 digits)');
      return;
    }
    onAddContact({
      name: name.trim(),
      specialty: specialty.trim() || 'Doctor',
      phone: phone.trim(),
    });
    setName('');
    setSpecialty('');
    setPhone('');
    setIsAdding(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="call-outline" size={22} color={COLORS.primary} />
          <Text style={styles.title}>Quick Emergency Contacts</Text>
        </View>
        {!isAdding && (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Ionicons name="add-outline" size={16} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Add Doctor</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdding ? (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Doctor Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Dr. Satish Gupta"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specialty / Relationship</Text>
            <TextInput
              style={styles.input}
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="e.g. Cardiologist, General Physician"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="e.g. 9876543210"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setName('');
                setSpecialty('');
                setPhone('');
                setIsAdding(false);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.contactsList}>
          {contacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No emergency contacts saved yet.</Text>
              <Text style={styles.emptySubtext}>Add your doctor's details to call them quickly in an emergency.</Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <View key={contact.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactSpecialty}>{contact.specialty}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.callIconBtn} onPress={() => handleCall(contact.phone)}>
                      <Ionicons name="call" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleDelete(contact.id)}>
                      <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  contactsList: {
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  contactSpecialty: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.text.light,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// IMPORTANT: Default export at the end
export default QuickEmergencyCard;