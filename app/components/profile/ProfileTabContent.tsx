import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
    hover: '#F97316',
    high: '#EF4444',
  },
};

interface ProfileTabContentProps {
  profile: any;
  qrValue: string;
  onSaveQR: () => void;
  getRiskColor: (risk: string) => string;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  profile,
  qrValue,
  onSaveQR,
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
            dialogTitle: 'Share my Swasthya Health ID',
            UTI: 'public.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to share card image:', error);
    }
  };

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
                <Text style={styles.profilePhotoText}>
                  {profile?.name ? profile.name[0] : 'U'}
                </Text>
              </View>
              <View>
                <Text style={styles.profileName}>{profile?.name || 'Patient Name'}</Text>
                <Text style={styles.profileAge}>
                  {profile?.age || '--'} years • {profile?.gender || 'Other'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(profile?.risk_level) },
              ]}
            >
              <Text style={styles.riskBadgeText}>{profile?.risk_level || 'Low'}</Text>
            </View>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Health ID</Text>
            <View style={styles.qrBox}>
              {profile?.health_id_qr ? (
                <Image
                  source={{ uri: profile.health_id_qr }}
                  style={{ width: 120, height: 120 }}
                />
              ) : (
                <QRCode
                  value={qrValue}
                  size={120}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.qrSubtitle}>Scan to access your health summary</Text>
          </View>
        </View>
      </ViewShot>

      {/* Buttons rendered OUTSIDE the ViewShot capture area */}
      <View style={styles.qrButtons}>
        <TouchableOpacity style={styles.qrButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={COLORS.primary} />
          <Text style={styles.qrButtonText}>Share QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qrButton} onPress={onSaveQR}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={styles.qrButtonText}>Save QR</Text>
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
    backgroundColor: '#ECFDF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  identityCard: {
    padding: 20,
    backgroundColor: '#ECFDF5',
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
});
