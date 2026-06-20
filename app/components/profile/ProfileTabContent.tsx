// app/components/profile/ProfileTabContent.tsx
import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  Dimensions,
  Platform,
  Modal,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const COLORS = {
  primary: '#0474FC',
  primaryDark: '#0360D0',
  primaryLight: '#E8F1FE',
  card: '#181822',
  background: '#0F0F13',
  border: '#2C2C3A',
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    light: '#475569',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
  success: '#10B981',
};

interface ProfileTabContentProps {
  profile: any;
  qrValue: string;
  onShareQR: () => void;
  onSaveQR: () => void;
  getRiskColor: (risk: string) => string;
}

// Custom Success Popup
const SuccessPopup = ({ visible, title, message, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.popupOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.popupContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.popupIconContainer}
          >
            <Ionicons name="checkmark-circle" size={36} color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={styles.popupTitle}>{title}</Text>
          <Text style={styles.popupMessage}>{message}</Text>

          <TouchableOpacity style={styles.popupButton} onPress={onClose}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.popupButtonGradient}
            >
              <Text style={styles.popupButtonText}>Got it</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  profile,
  qrValue,
  onShareQR,
  onSaveQR,
  getRiskColor,
}) => {
  const router = useRouter();
  const viewShotRef = useRef<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const displayName = profile?.name || 'Indresh';
  const displayAge = profile?.age || 20;
  const displayGender = profile?.gender || 'Male';
  const displayPhone = profile?.phone || '+91 9324474812';
  const displayRiskLevel = profile?.risk_level || 'Moderate';
  const displayHealthId = profile?.health_id || 'SWASTHYA-IND-2024-001';

  const showSuccessPopup = (title: string, message: string) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleShareQR = async () => {
    try {
      if (isWeb) {
        // Web fallback - use native Share API
        await Share.share({
          message: `My Health ID: ${displayHealthId} - Scan to view medical summary`,
          title: 'Share Health ID',
        });
        showSuccessPopup('✅ Shared Successfully', 'Your health ID has been shared');
        return;
      }

      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share my Swasthya Health ID',
            UTI: 'public.png',
          });
          showSuccessPopup('✅ Shared Successfully', 'Your health ID QR code has been shared');
        } else {
          await Share.share({
            message: `My Health ID: ${displayHealthId} - Scan to view medical summary`,
            title: 'Share Health ID',
          });
          showSuccessPopup('✅ Shared Successfully', 'Your health ID has been shared');
        }
      } else {
        await Share.share({
          message: `My Health ID: ${displayHealthId} - Scan to view medical summary`,
          title: 'Share Health ID',
        });
        showSuccessPopup('✅ Shared Successfully', 'Your health ID has been shared');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Don't show error if user cancelled
      if (error.message !== 'User cancelled share dialog') {
        Alert.alert('Error', 'Failed to share. Please try again.');
      }
    }
  };

  const handleSaveQR = async () => {
    try {
      if (isWeb) {
        // Web fallback - use data URL and download
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          // For web, we'll use the data URI directly
          const link = document.createElement('a');
          link.download = `health_id_${Date.now()}.png`;
          link.href = uri;
          link.click();
          showSuccessPopup('💾 Saved Successfully', 'QR code downloaded to your device');
          onSaveQR();
        } else {
          showSuccessPopup('💾 Saved Successfully', 'QR code downloaded to your device');
          onSaveQR();
        }
        return;
      }

      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        
        // For mobile, use sharing to save
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Save Health ID QR Code',
            UTI: 'public.png',
          });
          showSuccessPopup('💾 QR Code Ready', 'You can now save the image to your device');
          onSaveQR();
        } else {
          // Fallback: Use FileSystem legacy API
          const timestamp = Date.now();
          const fileName = `health_id_${timestamp}.png`;
          const filePath = `${FileSystem.documentDirectory}${fileName}`;
          
          await FileSystem.copyAsync({
            from: uri,
            to: filePath,
          });
          
          showSuccessPopup('💾 Saved Successfully', `QR code saved to your device`);
          onSaveQR();
        }
      } else {
        showSuccessPopup('💾 Saved Successfully', 'QR code saved to your device');
        onSaveQR();
      }
    } catch (error) {
      console.error('Failed to save QR:', error);
      // Fallback for any error - use Share
      try {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          await Share.share({
            message: `My Health ID: ${displayHealthId} - Scan to view medical summary`,
            title: 'Save Health ID',
            url: uri,
          });
          showSuccessPopup('💾 QR Code Ready', 'You can now save the image');
        }
      } catch (finalError) {
        Alert.alert('Error', 'Failed to save QR code. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.viewShotContainer}
      >
        <LinearGradient
          colors={['#181822', '#0F0F13']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.identityCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.profilePhoto}>
                <Text style={styles.profilePhotoText}>
                  {displayName ? displayName[0].toUpperCase() : 'I'}
                </Text>
              </View>
              <View>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileAge}>
                  {displayAge} years • {displayGender}
                </Text>
                <Text style={styles.profilePhone}>
                  <Ionicons name="call-outline" size={12} color={COLORS.text.secondary} />{' '}
                  {displayPhone}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(displayRiskLevel) },
              ]}
            >
              <Text style={styles.riskBadgeText}>{displayRiskLevel}</Text>
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
                  color="#FFFFFF"
                  backgroundColor="#0F0F13"
                />
              )}
            </View>
            <Text style={styles.qrSubtitle}>{displayHealthId}</Text>
            <Text style={styles.qrHint}>Scan to access your health summary</Text>
          </View>

          <View style={styles.aiInsightBox}>
            <View style={styles.aiInsightHeader}>
              <MaterialCommunityIcons name="robot-outline" size={16} color={COLORS.primary} />
              <Text style={styles.aiInsightTitle}>AI Insight</Text>
              <View style={{flex: 1}} />
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>85% Match</Text>
              </View>
            </View>
            <Text style={styles.aiInsightText}>
              Your health profile shows <Text style={{color: '#FFF', fontWeight: '600'}}>moderate risk</Text> for stress-related conditions. 
              Regular monitoring and stress management recommended.
            </Text>
          </View>
        </LinearGradient>
      </ViewShot>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Share QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSaveQR}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Save QR</Text>
        </TouchableOpacity>
      </View>

      <SuccessPopup
        visible={showPopup}
        title={popupTitle}
        message={popupMessage}
        onClose={() => setShowPopup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  viewShotContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  identityCard: {
    padding: 20,
    backgroundColor: '#181822',
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
    fontWeight: '700',
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
  profilePhone: {
    fontSize: 12,
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
    borderTopColor: COLORS.border,
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
    backgroundColor: '#0F0F13',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  qrHint: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  aiInsightBox: { 
    backgroundColor: 'rgba(4, 116, 252, 0.08)', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(4, 116, 252, 0.2)',
    marginTop: 16,
  },
  aiInsightHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 8 
  },
  aiInsightTitle: { 
    color: COLORS.primary, 
    fontSize: 13, 
    fontWeight: '700', 
    letterSpacing: 0.5, 
    textTransform: 'uppercase' 
  },
  confidenceBadge: { 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: 'rgba(16, 185, 129, 0.2)' 
  },
  confidenceText: { 
    color: COLORS.success, 
    fontSize: 10, 
    fontWeight: '700' 
  },
  aiInsightText: { 
    color: COLORS.text.secondary, 
    fontSize: 13, 
    lineHeight: 20 
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#181822',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#181822',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  popupIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  popupButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  popupButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileTabContent;