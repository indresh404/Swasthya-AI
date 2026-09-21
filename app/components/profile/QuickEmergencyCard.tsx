// app/components/profile/QuickEmergencyCard.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#EF4444',
  primaryDark: '#DC2626',
  primaryLight: '#FEE2E2',
  card: '#FFFFFF',
  background: '#F9FAFB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  divider: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
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

// Custom Alert Component
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'call' | 'delete' | 'success' | 'error' | string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}
const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, type, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => {
  const getIcon = () => {
    switch (type) {
      case 'call': return 'call-outline';
      case 'delete': return 'trash-outline';
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'close-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'call': return { bg: '#D1FAE5', icon: COLORS.success, border: COLORS.success };
      case 'delete': return { bg: COLORS.primaryLight, icon: COLORS.primary, border: COLORS.primary };
      case 'success': return { bg: '#D1FAE5', icon: COLORS.success, border: COLORS.success };
      case 'error': return { bg: COLORS.primaryLight, icon: COLORS.primary, border: COLORS.primary };
      default: return { bg: '#E5E7EB', icon: COLORS.text.secondary, border: COLORS.text.secondary };
    }
  };

  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={[styles.alertIconContainer, { backgroundColor: colors.bg }]}>
                <Ionicons name={getIcon()} size={32} color={colors.icon} />
              </View>
              
              <Text style={styles.alertTitle}>{title}</Text>
              <Text style={styles.alertMessage}>{message}</Text>

              <View style={styles.alertButtons}>
                {type !== 'success' && type !== 'error' && (
                  <TouchableOpacity style={styles.alertCancelBtn} onPress={onCancel}>
                    <Text style={styles.alertCancelText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[
                    styles.alertConfirmBtn,
                    type === 'delete' && styles.alertConfirmDanger,
                    type === 'call' && styles.alertConfirmCall,
                    (type === 'success' || type === 'error') && styles.alertConfirmFull,
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={styles.alertConfirmText}>
                    {type === 'call' ? '📞 Call' : 
                     type === 'delete' ? '🗑️ Remove' : 
                     type === 'success' ? '✅ Done' : 
                     type === 'error' ? '✖️ Close' : confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const QuickEmergencyCard: React.FC<QuickEmergencyCardProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  
  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'call' | 'delete' | 'success' | 'error'>('call');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | null>(null);

  const showAlert = (type: 'call' | 'delete' | 'success' | 'error', title: string, message: string, onConfirm?: () => void) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnConfirm(() => onConfirm || null);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
    setAlertOnConfirm(null);
  };

  const handleCall = (phoneNumber: string) => {
    showAlert(
      'call',
      '📞 Make Call',
      `Do you want to call ${phoneNumber}?`,
      () => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        Linking.openURL(`tel:${cleanPhone}`).catch(() => {
          showAlert('error', 'Error', 'Could not initiate call');
        });
        hideAlert();
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    showAlert(
      'delete',
      '🗑️ Remove Contact',
      `Are you sure you want to remove "${name}" from emergency contacts?`,
      () => {
        onDeleteContact(id);
        hideAlert();
        showAlert('success', '✅ Contact Removed', `"${name}" has been removed from emergency contacts`);
      }
    );
  };

  const validatePhone = (phoneNumber: string) => {
    const clean = phoneNumber.replace(/\D/g, '');
    return clean.length >= 10;
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('error', 'Error', 'Name is required');
      return;
    }
    if (!validatePhone(phone)) {
      showAlert('error', 'Error', 'Please enter a valid phone number (minimum 10 digits)');
      return;
    }
    onAddContact({
      name: name.trim(),
      specialty: specialty.trim() || 'Doctor',
      phone: phone.trim(),
    });
    resetForm();
    showAlert('success', '✅ Contact Added', `"${name.trim()}" has been added to emergency contacts`);
  };

  const resetForm = () => {
    setName('');
    setSpecialty('');
    setPhone('');
    setIsAdding(false);
  };

  // Render Contact Item
  const renderContactItem = (contact: EmergencyContact, index: number) => (
    <View key={contact.id}>
      {index > 0 && <View style={styles.divider} />}
      <View style={styles.contactItem}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactSpecialty}>{contact.specialty}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.callIconBtn} 
            onPress={() => handleCall(contact.phone)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteIconBtn} 
            onPress={() => handleDelete(contact.id, contact.name)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onConfirm={() => {
          if (alertOnConfirm) {
            alertOnConfirm();
          } else {
            hideAlert();
          }
        }}
        onCancel={hideAlert}
        confirmText={alertType === 'call' ? 'Call' : alertType === 'delete' ? 'Remove' : 'OK'}
        cancelText={alertType === 'call' || alertType === 'delete' ? 'Cancel' : 'Close'}
      />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Emergency Contacts</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
          <Ionicons name="add-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.contactsList}>
        {contacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.text.light} />
            <Text style={styles.emptyText}>No emergency contacts</Text>
            <Text style={styles.emptySubtext}>Add your doctor's details to call them quickly</Text>
          </View>
        ) : (
          contacts.map((contact, index) => renderContactItem(contact, index))
        )}
      </View>

      {/* Add Contact Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeader}
              >
                <TouchableOpacity onPress={resetForm} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Emergency Contact</Text>
                <View style={{ width: 40 }} />
              </LinearGradient>

              <View style={styles.modalBody}>
                <View style={styles.avatarPreview}>
                  <View style={[styles.avatarCircle, { backgroundColor: name ? COLORS.primary : '#E5E7EB' }]}>
                    <Text style={[styles.avatarText, { color: name ? '#FFFFFF' : COLORS.text.light }]}>
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Dr. Satish Gupta"
                      placeholderTextColor={COLORS.text.light}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Specialty / Relationship</Text>
                    <TextInput
                      style={styles.input}
                      value={specialty}
                      onChangeText={setSpecialty}
                      placeholder="Cardiologist, General Physician"
                      placeholderTextColor={COLORS.text.light}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="9876543210"
                      placeholderTextColor={COLORS.text.light}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={resetForm}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalSaveGradient}
                    >
                      <Text style={styles.modalSaveText}>Save Contact</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    gap: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
    gap: 10,
  },
  callIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.text.light,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  // Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  alertCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  alertConfirmDanger: {
    backgroundColor: COLORS.primary,
  },
  alertConfirmCall: {
    backgroundColor: COLORS.success,
  },
  alertConfirmFull: {
    flex: 0,
    paddingHorizontal: 32,
    minWidth: 100,
  },
  alertConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  modalForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  modalSaveBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QuickEmergencyCard;