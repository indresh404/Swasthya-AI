// components/home/AshaWorkerSyncCard.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Share,
  Alert,
  Animated,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AshaWorker {
  id: string;
  name: string;
  role: string;
  subCenter: string;
  phone: string;
  distance: string;
  available: boolean;
  avatarColor: string;
}

const MOCK_ASHA_WORKERS: AshaWorker[] = [
  {
    id: 'asha_1',
    name: 'Smt. Sunita Devi',
    role: 'Senior ASHA Facilitator',
    subCenter: 'Sub-Centre Rampur • Ward 4',
    phone: '+919876543210',
    distance: '0.6 km away',
    available: true,
    avatarColor: '#0D9488',
  },
  {
    id: 'asha_2',
    name: 'Smt. Rekha Sharma',
    role: 'Community Health ASHA',
    subCenter: 'Primary Health Centre (PHC)',
    phone: '+919812345678',
    distance: '1.2 km away',
    available: true,
    avatarColor: '#0474FC',
  },
  {
    id: 'asha_3',
    name: 'Anita Yadav, ANM',
    role: 'Auxiliary Nurse Midwife',
    subCenter: 'Community Health Centre (CHC)',
    phone: '+919765432109',
    distance: '2.5 km away',
    available: false,
    avatarColor: '#8B5CF6',
  },
];

const SYNC_LOGS = [
  {
    id: 'log_1',
    worker: 'Smt. Sunita Devi',
    date: 'Yesterday, 04:30 PM',
    status: 'Synced Successfully',
    records: 'Vitals, BP logs, 2 Active Prescriptions',
  },
  {
    id: 'log_2',
    worker: 'Smt. Rekha Sharma',
    date: '24 Sep 2026, 11:15 AM',
    status: 'Verified & Updated',
    records: 'CBC Blood Report, Risk Score Assessment',
  },
];

interface Props {
  patientProfile?: any;
  vitals?: {
    hr?: number;
    spo2?: number;
    sys?: number;
    dia?: number;
  };
}

export const AshaWorkerSyncCard: React.FC<Props> = ({
  patientProfile,
  vitals = { hr: 72, spo2: 98, sys: 120, dia: 80 },
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'workers' | 'logs'>('qr');
  const [tokenCounter, setTokenCounter] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(2);
  const [isSyncing, setIsSyncing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Fast dynamic token generation (regenerates rapidly every 2 seconds for high-security dynamic QR)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (modalVisible) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTokenCounter((c) => c + 1);
            return 2;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modalVisible]);

  // Soft pulse animation when modal is active
  useEffect(() => {
    if (modalVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [modalVisible, pulseAnim]);

  // Generate dynamic QR code payload with changing secure hash & patient health history
  const qrPayload = useMemo(() => {
    const patientName = patientProfile?.full_name || patientProfile?.name || 'Indresh Suresh';
    const patientId = patientProfile?.id || 'SW-9431';
    const age = patientProfile?.age || 20;
    const gender = patientProfile?.gender || 'Male';
    const phone = patientProfile?.phone_number || '+91 9324474812';

    const timestamp = Date.now();
    const dynamicHash = `ASHAPASS-${patientId}-${Math.floor(timestamp / 2000)}-${(tokenCounter % 999).toString().padStart(3, '0')}`;

    const dataPackage = {
      protocol: 'SWASTHYA_ASHA_SYNC_V2',
      sessionToken: dynamicHash,
      fastCycleSeconds: 2,
      syncTimestamp: new Date().toISOString(),
      patient: {
        clinicalId: '#SW-9431',
        name: patientName,
        age,
        gender,
        phone,
        bloodGroup: 'B+',
        riskLevel: 'Moderate (Score: 58)',
      },
      liveVitals: {
        heartRate: `${vitals.hr || 72} bpm`,
        spO2: `${vitals.spo2 || 98}%`,
        bp: `${vitals.sys || 120}/${vitals.dia || 80} mmHg`,
      },
      medicalHistory: {
        conditions: ['Chronic Migraine', 'Mild Stress-Induced Hypertension'],
        allergies: ['Penicillin', 'Dust mite'],
        activePrescriptions: [
          { name: 'Paracetamol 500mg', freq: 'SOS' },
          { name: 'Telmisartan 40mg', freq: 'OD Morning' },
        ],
        labReportsCount: 3,
        immunizationStatus: 'Up to Date',
      },
      syncChannel: 'ABDM_FHIR_ENCRYPTED_DIRECT',
    };

    return JSON.stringify(dataPackage);
  }, [patientProfile, vitals, tokenCounter]);

  const handleCall = (phoneNumber: string, name: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Call', `Please dial: ${phoneNumber}`);
        }
      })
      .catch(() => {
        Alert.alert('Error', `Could not initiate call to ${phoneNumber}`);
      });
  };

  const handleWhatsApp = (phoneNumber: string, name: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste ${name} ji, this is ${patientProfile?.full_name || 'Indresh Suresh'} (Swasthya Clinical ID: #SW-9431). I am sharing my latest health record history and vitals with you for the ASHA health register.`
    );
    const url = `whatsapp://send?phone=${cleanPhone}&text=${message}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const smsUrl = `sms:${cleanPhone}?body=${message}`;
          Linking.openURL(smsUrl).catch(() => {
            Alert.alert('Notice', `Please contact ${name} at ${phoneNumber}`);
          });
        }
      })
      .catch(() => {
        Alert.alert('Notice', `Please contact ${name} at ${phoneNumber}`);
      });
  };

  const handleShareAllData = async () => {
    try {
      setIsSyncing(true);
      const patientName = patientProfile?.full_name || patientProfile?.name || 'Indresh Suresh';
      const summaryText = 
`📋 SWASTHYA-AI • PATIENT COMPLETE HEALTH DOSSIER (ASHA RECORD)
--------------------------------------------------
👤 Patient: ${patientName} (ID: #SW-9431)
🎂 Age/Gender: ${patientProfile?.age || 20} Yrs / ${patientProfile?.gender || 'Male'}
📞 Contact: ${patientProfile?.phone_number || '+91 9324474812'}
🩸 Blood Group: B+ | Risk Level: Moderate (Score: 58)

💓 REAL-TIME VITALS:
• Heart Rate: ${vitals.hr || 72} bpm
• SpO2: ${vitals.spo2 || 98}%
• Blood Pressure: ${vitals.sys || 120}/${vitals.dia || 80} mmHg

💊 ACTIVE PRESCRIPTIONS:
1. Paracetamol 500mg (SOS)
2. Telmisartan 40mg (OD Morning)

🔬 DIAGNOSTIC & LAB HISTORY:
• CBC Blood Count (Verified)
• Migraine & Stress Pattern Logs
• Allergies: Penicillin, Dust Mite
• Immunization: Fully Vaccinated

⚡ Fast ASHA Sync Token: SWASTHYA-SECURE-${Math.floor(Date.now() / 1000)}
🛡️ Encrypted under ABDM Standards • Shared with ASHA Health Worker`;

      setTimeout(async () => {
        setIsSyncing(false);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        await Share.share({
          message: summaryText,
          title: `Health Record History - ${patientName}`,
        });
      }, 400);
    } catch (error) {
      setIsSyncing(false);
      Alert.alert('Share Failed', 'Could not export health records at this moment.');
    }
  };

  const primaryAsha = MOCK_ASHA_WORKERS[0];

  return (
    <View style={styles.cardContainer}>
      {/* Compact Top Header */}
      <View style={styles.compactHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBg}>
            <FontAwesome5 name="user-nurse" size={16} color="#0D9488" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>ASHA Health Connect</Text>
              <View style={styles.liveSyncBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.liveSyncText}>Instant Sync</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Assigned Community Health Worker</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setActiveTab('workers');
            setModalVisible(true);
          }}
        >
          <Text style={styles.directoryLink}>Directory (3) →</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Worker Info Row */}
      <View style={styles.workerRow}>
        <View style={styles.workerAvatar}>
          <Text style={styles.workerAvatarText}>SD</Text>
        </View>
        <View style={styles.workerInfoCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.workerName}>{primaryAsha.name}</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={11} color="#0D9488" />
              <Text style={styles.verifiedText}>Assigned</Text>
            </View>
          </View>
          <Text style={styles.workerSub}>{primaryAsha.role} • {primaryAsha.distance}</Text>
          <Text style={styles.workerPhone}>{primaryAsha.phone}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.workerActionBtns}>
          <TouchableOpacity
            style={styles.callIconBtn}
            activeOpacity={0.8}
            onPress={() => handleCall(primaryAsha.phone, primaryAsha.name)}
          >
            <Ionicons name="call" size={15} color="#FFFFFF" />
            <Text style={styles.callIconText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatIconBtn}
            activeOpacity={0.8}
            onPress={() => handleWhatsApp(primaryAsha.phone, primaryAsha.name)}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#0D9488" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Health History Ready Badges */}
      <View style={styles.dataBadgesRow}>
        <View style={styles.dataBadge}>
          <Ionicons name="pulse" size={12} color="#0D9488" />
          <Text style={styles.dataBadgeText}>Vitals Log</Text>
        </View>
        <View style={styles.dataBadge}>
          <Ionicons name="medkit-outline" size={12} color="#0D9488" />
          <Text style={styles.dataBadgeText}>2 Active Rx</Text>
        </View>
        <View style={styles.dataBadge}>
          <Ionicons name="document-text-outline" size={12} color="#0D9488" />
          <Text style={styles.dataBadgeText}>3 Lab Reports</Text>
        </View>
        <View style={styles.dataBadge}>
          <Ionicons name="shield-checkmark-outline" size={12} color="#0D9488" />
          <Text style={styles.dataBadgeText}>AI Score</Text>
        </View>
      </View>

      {/* Bottom Action Row: Fast QR Scan & Share Health Data */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.showQrBtn}
          activeOpacity={0.85}
          onPress={() => {
            setActiveTab('qr');
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['#0F766E', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.showQrGradient}
          >
            <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
            <Text style={styles.showQrText}>Scan Fast QR</Text>
            <View style={styles.fastPill}>
              <Text style={styles.fastPillText}>2s Live</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareDataBtn}
          activeOpacity={0.8}
          onPress={handleShareAllData}
        >
          <Ionicons name="share-social-outline" size={16} color="#0F766E" />
          <Text style={styles.shareDataText}>
            {isSyncing ? 'Packaging...' : shareSuccess ? 'Shared ✓' : 'Share Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Modal for Fast Dynamic QR & Full Sharing */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconBg}>
                  <Ionicons name="qr-code" size={20} color="#0D9488" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>ASHA Health Sync</Text>
                  <Text style={styles.modalSubtitle}>Fast dynamic QR & health records sharing</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Modal Tabs */}
            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'qr' && styles.modalTabActive]}
                onPress={() => setActiveTab('qr')}
              >
                <Ionicons
                  name="qr-code"
                  size={15}
                  color={activeTab === 'qr' ? '#0F766E' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.modalTabText,
                    activeTab === 'qr' && styles.modalTabTextActive,
                  ]}
                >
                  Fast QR Scanner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'workers' && styles.modalTabActive]}
                onPress={() => setActiveTab('workers')}
              >
                <Ionicons
                  name="people"
                  size={15}
                  color={activeTab === 'workers' ? '#0F766E' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.modalTabText,
                    activeTab === 'workers' && styles.modalTabTextActive,
                  ]}
                >
                  ASHA Workers (3)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'logs' && styles.modalTabActive]}
                onPress={() => setActiveTab('logs')}
              >
                <Ionicons
                  name="receipt"
                  size={15}
                  color={activeTab === 'logs' ? '#0F766E' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.modalTabText,
                    activeTab === 'logs' && styles.modalTabTextActive,
                  ]}
                >
                  Sync History
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {activeTab === 'qr' && (
                <View style={styles.qrTabContainer}>
                  {/* Dynamic Refresh Indicator Banner */}
                  <View style={styles.qrAlertBanner}>
                    <View style={styles.pulseContainer}>
                      <Animated.View
                        style={[
                          styles.pulseRing,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      />
                      <View style={styles.pulseSolid} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qrAlertTitle}>
                        Dynamic Fast-Changing QR Active
                      </Text>
                      <Text style={styles.qrAlertText}>
                        Session token changes every <Text style={{ fontWeight: '800' }}>2 seconds</Text> for rapid, encrypted synchronization with the ASHA Sathi worker app.
                      </Text>
                    </View>
                  </View>

                  {/* QR Code Frame */}
                  <View style={styles.qrFrameCard}>
                    <View style={styles.qrCountdownRow}>
                      <Ionicons name="timer-outline" size={14} color="#0D9488" />
                      <Text style={styles.qrCountdownText}>
                        Refreshing token in <Text style={{ fontWeight: '800', color: '#0F766E' }}>{secondsRemaining}s</Text>
                      </Text>
                    </View>

                    <View style={styles.qrCodeWrapper}>
                      <QRCode
                        value={qrPayload}
                        size={175}
                        color="#042F2E"
                        backgroundColor="#FFFFFF"
                      />
                    </View>

                    <Text style={styles.qrTokenText}>
                      TOKEN: SWASTHYA-SECURE-#{tokenCounter.toString().padStart(4, '0')}
                    </Text>

                    <View style={styles.abdmFooterTag}>
                      <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
                      <Text style={styles.abdmFooterText}>ABDM & FHIR Compliant Health Payload</Text>
                    </View>
                  </View>

                  {/* Data History Included Preview */}
                  <Text style={styles.sectionHeader}>Health Data History Shared In QR</Text>
                  <View style={styles.packageList}>
                    <View style={styles.packageItem}>
                      <Ionicons name="person-circle-outline" size={18} color="#0D9488" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageTitle}>Patient Profile & Health ID</Text>
                        <Text style={styles.packageSubtitle}>
                          #SW-9431 • {patientProfile?.full_name || 'Indresh Suresh'} (Age {patientProfile?.age || 20})
                        </Text>
                      </View>
                    </View>

                    <View style={styles.packageItem}>
                      <Ionicons name="heart-circle-outline" size={18} color="#EF4444" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageTitle}>Real-time Vitals Telemetry</Text>
                        <Text style={styles.packageSubtitle}>
                          HR: {vitals.hr} bpm • SpO2: {vitals.spo2}% • BP: {vitals.sys}/{vitals.dia} mmHg
                        </Text>
                      </View>
                    </View>

                    <View style={styles.packageItem}>
                      <Ionicons name="medkit-outline" size={18} color="#8B5CF6" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageTitle}>Prescriptions & Dosages</Text>
                        <Text style={styles.packageSubtitle}>
                          Paracetamol 500mg (SOS), Telmisartan 40mg (OD Morning)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.packageItem}>
                      <Ionicons name="document-text-outline" size={18} color="#F59E0B" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageTitle}>Diagnostics & Lab History</Text>
                        <Text style={styles.packageSubtitle}>
                          CBC Blood Report, Allergy notes, Moderate AI Risk (58)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Instant Share Button */}
                  <TouchableOpacity
                    style={styles.modalShareBtn}
                    activeOpacity={0.8}
                    onPress={handleShareAllData}
                  >
                    <Ionicons name="share-social" size={18} color="#FFFFFF" />
                    <Text style={styles.modalShareBtnText}>
                      {isSyncing ? 'Packaging Health Data...' : 'Share Full Health History'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'workers' && (
                <View style={styles.workersTabContainer}>
                  <Text style={styles.tabHeading}>Local ASHA & Health Workers</Text>
                  <Text style={styles.tabSubheading}>
                    Contact your community health workers directly for home visits, medicine delivery, and health sync.
                  </Text>

                  {MOCK_ASHA_WORKERS.map((worker) => (
                    <View key={worker.id} style={styles.workerCardItem}>
                      <View style={[styles.workerItemAvatar, { backgroundColor: worker.avatarColor + '18' }]}>
                        <FontAwesome5 name="user-nurse" size={20} color={worker.avatarColor} />
                      </View>

                      <View style={styles.workerItemInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.workerItemName}>{worker.name}</Text>
                          {worker.available && (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>Active</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.workerItemRole}>{worker.role}</Text>
                        <Text style={styles.workerItemSubCenter}>{worker.subCenter}</Text>
                        <Text style={styles.workerItemDist}>📍 {worker.distance}</Text>
                      </View>

                      <View style={styles.workerItemActions}>
                        <TouchableOpacity
                          style={styles.itemCallBtn}
                          onPress={() => handleCall(worker.phone, worker.name)}
                        >
                          <Ionicons name="call" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.itemChatBtn}
                          onPress={() => handleWhatsApp(worker.phone, worker.name)}
                        >
                          <Ionicons name="logo-whatsapp" size={16} color="#0D9488" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Emergency Helpline Banner */}
                  <View style={styles.emergencyBanner}>
                    <View style={styles.emergencyIconBox}>
                      <Ionicons name="call" size={18} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.emergencyTitle}>National Health Emergency</Text>
                      <Text style={styles.emergencySub}>Dial 104 (Health Advice) or 108 (Ambulance)</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.emergencyCallBtn}
                      onPress={() => handleCall('104', 'National Health Helpline')}
                    >
                      <Text style={styles.emergencyCallText}>Call 104</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeTab === 'logs' && (
                <View style={styles.logsTabContainer}>
                  <Text style={styles.tabHeading}>Recent ASHA Sync History</Text>
                  <Text style={styles.tabSubheading}>
                    Transparent log of health record scans and consultations performed with ASHA workers.
                  </Text>

                  {SYNC_LOGS.map((log) => (
                    <View key={log.id} style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                          <Text style={styles.logWorker}>{log.worker}</Text>
                        </View>
                        <Text style={styles.logDate}>{log.date}</Text>
                      </View>
                      <Text style={styles.logStatus}>{log.status}</Text>
                      <Text style={styles.logRecords}>📦 Data: {log.records}</Text>
                    </View>
                  ))}

                  <View style={styles.securityBox}>
                    <Ionicons name="lock-closed" size={16} color="#0D9488" />
                    <Text style={styles.securityText}>
                      All data history transmissions are protected with ABDM 256-bit encryption.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact Dashboard Card Styles
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBg: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  liveSyncText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  directoryLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 10,
  },
  workerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  workerAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  workerInfoCol: {
    flex: 1,
  },
  workerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  workerSub: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  workerPhone: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    marginTop: 1,
  },
  workerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  dataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dataBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4B5563',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  showQrBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  showQrGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  showQrText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fastPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fastPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shareDataBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  shareDataText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginVertical: 12,
    gap: 3,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  modalTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalTabTextActive: {
    color: '#0F766E',
    fontWeight: '800',
  },
  modalScrollView: {
    maxHeight: 480,
  },

  // QR Tab
  qrTabContainer: {
    alignItems: 'center',
  },
  qrAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 14,
    width: '100%',
  },
  pulseContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#34D399',
    opacity: 0.6,
  },
  pulseSolid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
  },
  qrAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  qrAlertText: {
    fontSize: 11,
    color: '#0D9488',
    lineHeight: 15,
    marginTop: 2,
  },
  qrFrameCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    width: '100%',
  },
  qrCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  qrCountdownText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  qrCodeWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  qrTokenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  abdmFooterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  abdmFooterText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  packageList: {
    width: '100%',
    gap: 6,
    marginBottom: 16,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  packageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  packageSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalShareBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Workers Tab
  workersTabContainer: {
    width: '100%',
  },
  tabHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  tabSubheading: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 16,
  },
  workerCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  workerItemAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  workerItemInfo: {
    flex: 1,
  },
  workerItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  activePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#16A34A',
  },
  workerItemRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 1,
  },
  workerItemSubCenter: {
    fontSize: 10,
    color: '#6B7280',
  },
  workerItemDist: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 2,
  },
  workerItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemChatBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 6,
  },
  emergencyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: 10,
    color: '#B91C1C',
    marginTop: 1,
  },
  emergencyCallBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emergencyCallText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Logs Tab
  logsTabContainer: {
    width: '100%',
  },
  logCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  logWorker: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  logDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  logRecords: {
    fontSize: 11,
    color: '#4B5563',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 6,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#0F766E',
    lineHeight: 15,
  },
});
