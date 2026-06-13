import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  primaryDark: '#0360D0',
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
};

interface FamilyTabContentProps {
  familyData: any;
  onCopyFamilyCode: () => void;
  onSetupFamily: () => void;
  membersCount: number;
  familyRiskLevel?: string;
  getRiskColor: (risk: string) => string;
}

export const FamilyTabContent: React.FC<FamilyTabContentProps> = ({
  familyData,
  onCopyFamilyCode,
  onSetupFamily,
  membersCount,
  familyRiskLevel = 'Low',
  getRiskColor,
}) => {
  const viewShotRef = useRef<any>(null);

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share my Swasthya Family Code',
            UTI: 'public.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to share family card image:', error);
    }
  };

  if (!familyData) {
    return (
      <View style={styles.noFamilyCard}>
        <Ionicons name="people-outline" size={48} color={COLORS.primary} />
        <Text style={styles.noFamilyTitle}>No Family Yet</Text>
        <Text style={styles.noFamilyText}>
          Create a family or join an existing one to share health data with family members
        </Text>
        <TouchableOpacity
          style={styles.joinFamilyButton}
          activeOpacity={0.8}
          onPress={onSetupFamily}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.joinFamilyButtonGradient}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.joinFamilyButtonText}>Set Up Family</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.viewShotContainer}
      >
        <View style={styles.identityCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.profilePhoto}>
                <Ionicons name="people" size={26} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.profileName}>
                  {familyData.family_name || 'Your Family'}
                </Text>
                <Text style={styles.profileAge}>
                  {membersCount} {membersCount === 1 ? 'Member' : 'Members'} • Code: {familyData.join_code}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(familyRiskLevel) },
              ]}
            >
              <Text style={styles.riskBadgeText}>{familyRiskLevel}</Text>
            </View>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Family QR Code</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={`SWASTHYA_FAMILY:${familyData.join_code}`}
                size={120}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.qrSubtitle}>Scan QR code to join this family</Text>
          </View>
        </View>
      </ViewShot>

      {/* Buttons rendered OUTSIDE the ViewShot capture area */}
      <View style={styles.qrButtons}>
        <TouchableOpacity style={styles.qrButton} onPress={onCopyFamilyCode}>
          <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
          <Text style={styles.qrButtonText}>Copy Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qrButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          <Text style={styles.qrButtonText}>Share QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  viewShotContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EEF2FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  identityCard: {
    padding: 20,
    backgroundColor: '#EEF2FF',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  profileAge: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  qrSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  qrBox: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  qrButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  noFamilyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noFamilyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noFamilyText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  joinFamilyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinFamilyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  joinFamilyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
