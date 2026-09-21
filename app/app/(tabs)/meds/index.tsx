// app/(tabs)/meds/index.tsx

import { SkeletonMedsScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments, router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, Alert, Modal, TextInput, Animated, Platform, ActivityIndicator
} from 'react-native';
import { getMedicines, logMedAdherence, addMedicine } from '@/services/supabase.service';
import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import JanAushadhiMap from '@/components/JanAushadhiMap';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ADHERENCE_DATA = [true, true, false, true, true, true, false];

const MEDICINES_DATABASE = [
  { brand_name: 'Glycomet 500mg', generic_name: 'Metformin 500mg', market_price: 52, jan_aushadhi_price: 9.20 },
  { brand_name: 'Metformin 500mg', generic_name: 'Metformin 500mg', market_price: 52, jan_aushadhi_price: 9.20 },
  { brand_name: 'Amlokind 5mg', generic_name: 'Amlodipine 5mg', market_price: 48, jan_aushadhi_price: 5.50 },
  { brand_name: 'Amlodipine 5mg', generic_name: 'Amlodipine 5mg', market_price: 48, jan_aushadhi_price: 5.50 },
  { brand_name: 'Calcirol 60k', generic_name: 'Vitamin D3', market_price: 65, jan_aushadhi_price: 12.00 },
  { brand_name: 'Vitamin D3', generic_name: 'Vitamin D3', market_price: 65, jan_aushadhi_price: 12.00 },
  { brand_name: 'Crocin 650mg', generic_name: 'Paracetamol 650mg', market_price: 30, jan_aushadhi_price: 4.50 },
  { brand_name: 'Paracetamol 650mg', generic_name: 'Paracetamol 650mg', market_price: 30, jan_aushadhi_price: 4.50 },
  { brand_name: 'Ecosprin 75mg', generic_name: 'Aspirin 75mg', market_price: 28, jan_aushadhi_price: 3.80 },
  { brand_name: 'Aspirin 75mg', generic_name: 'Aspirin 75mg', market_price: 28, jan_aushadhi_price: 3.80 },
  { brand_name: 'Sildenafil 50mg', generic_name: 'Sildenafil 50mg', market_price: 120, jan_aushadhi_price: 22.00 },
  { brand_name: 'Viagra 50mg', generic_name: 'Sildenafil 50mg', market_price: 350, jan_aushadhi_price: 22.00 },
  { brand_name: 'Nitroglycerin 0.5mg', generic_name: 'Nitroglycerin 0.5mg', market_price: 85, jan_aushadhi_price: 14.00 },
  { brand_name: 'Sorbitrate 5mg', generic_name: 'Isosorbide Dinitrate 5mg', market_price: 45, jan_aushadhi_price: 8.00 },
  { brand_name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen 400mg', market_price: 25, jan_aushadhi_price: 4.00 },
  { brand_name: 'Warfarin 5mg', generic_name: 'Warfarin 5mg', market_price: 95, jan_aushadhi_price: 18.00 }
];

const DATA_ANALYSIS = [
  { medicine: 'Metformin 500mg', status: 'safe', note: 'No known interactions with your current medications.', color: '#10B981', icon: 'checkmark-circle' },
  { medicine: 'Amlodipine 5mg', status: 'warning', note: 'Mild interaction possible with Aspirin — consult physician.', color: '#F59E0B', icon: 'warning' },
  { medicine: 'Vitamin D3', status: 'safe', note: 'OpenFDA: No adverse interactions detected.', color: '#10B981', icon: 'checkmark-circle' },
];

// Week Calendar Component
const WeekCalendar = () => {
  const today = new Date().getDay();
  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Ionicons name="calendar-outline" size={18} color="#0474FC" />
        <Text style={styles.cardTitle}>This Week's Adherence</Text>
      </View>
      <View style={styles.weekRow}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={[styles.dayLabel, i === today && styles.todayLabel]}>{day}</Text>
            <View style={[
              styles.dayDot,
              ADHERENCE_DATA[i] ? styles.dayDotTaken : styles.dayDotMissed,
              i === today && styles.dayDotToday,
            ]}>
              {ADHERENCE_DATA[i]
                ? <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                : <Ionicons name="close" size={10} color="#FFFFFF" />}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>
    </View>
  );
};

// Analytics Card
const AnalyticsCard = () => {
  const weeks = [
    { label: 'W1', pct: 71 },
    { label: 'W2', pct: 86 },
    { label: 'W3', pct: 57 },
    { label: 'W4', pct: 100 },
  ];
  return (
    <View style={styles.analyticsCard}>
      <View style={styles.calendarHeader}>
        <Ionicons name="stats-chart-outline" size={18} color="#8B5CF6" />
        <Text style={styles.cardTitle}>Monthly Adherence</Text>
      </View>
      <View style={styles.barsRow}>
        {weeks.map((w, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barPct}>{w.pct}%</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { height: `${w.pct}%`, backgroundColor: w.pct >= 80 ? '#10B981' : w.pct >= 60 ? '#F59E0B' : '#EF4444' }]} />
            </View>
            <Text style={styles.barLabel}>{w.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.analyticsNote}>
        Overall adherence: <Text style={{ color: '#10B981', fontWeight: '700' }}>78.5%</Text> — Keep going!
      </Text>
    </View>
  );
};

// AI Analysis Panel
const AIAnalysisPanel = ({ visible, onClose, medName, activeMeds = [] }: { visible: boolean; onClose: () => void; medName: string; activeMeds?: string[] }) => {
  const [analysing, setAnalysing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function runAnalysis() {
      if (!visible || !medName) return;
      setAnalysing(true);
      setResult(null);
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      try {
        const otherMeds = activeMeds.filter(m => m.toLowerCase().trim() !== medName.toLowerCase().trim());
        const res = await backendService.checkInteraction({
          new_medicine: medName,
          active_medicines: otherMeds,
          patient_conditions: ["Hypertension", "Diabetes"]
        });

        if (res) {
          setResult({
            status: res.conflict_found ? 'danger' : 'safe',
            note: res.warning_text || res.recommendation || res.description,
            color: res.conflict_found ? '#EF4444' : '#10B981',
            icon: res.conflict_found ? 'warning' : 'checkmark-circle'
          });
        }
      } catch (e) {
        setResult({
          status: 'warning',
          note: 'Safety check partially unavailable. Consult your doctor.',
          color: '#F59E0B',
          icon: 'alert-circle'
        });
      } finally {
        setAnalysing(false);
      }
    }
    runAnalysis();
  }, [visible, medName, activeMeds]);

  if (!visible) return null;
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name="flask-outline" size={22} color="#0474FC" />
              <Text style={styles.modalTitle}>AI Drug Analysis</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalMed}>{medName}</Text>
          <Text style={styles.modalSub}>Powered by OpenFDA + Swasthya AI Engine</Text>

          {analysing ? (
            <View style={styles.analysingBox}>
              <Animated.Text style={[styles.analysingText, { opacity: dotAnim }]}>
                🔍 Querying OpenFDA database...
              </Animated.Text>
              <Text style={[styles.analysingText, { marginTop: 8 }]}>⚗️ Cross-checking active prescriptions for conflicts...</Text>
              <Text style={[styles.analysingText, { marginTop: 8 }]}>🤖 Running LLM safety review...</Text>
            </View>
          ) : result && (
            <View style={[styles.resultBox, { borderColor: result.color + '40', backgroundColor: result.color + '10' }]}>
              <Ionicons name={result.icon as any} size={28} color={result.color} />
              <Text style={[styles.resultStatus, { color: result.color }]}>
                {result.status === 'safe' ? '✓ No Interaction Detected' : '🚨 CRITICAL DRUG CONTRAINDICATION'}
              </Text>
              <Text style={styles.resultNote}>{result.note}</Text>
              <Text style={styles.resultSource}>Source: Clinical Pharmacology & OpenFDA API</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

import { BACKEND_URL } from '@/config/api';

export default function MedsScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];

  const [medications, setMedications] = useState<any[]>([]);
  const [takenToday, setTakenToday] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [genericAlts, setGenericAlts] = useState<any[]>([]);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [findingStore, setFindingStore] = useState(false);

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId || 'patient-123';

  // Debounced search for master medicines
  useEffect(() => {
    if (!newMedName.trim() || newMedName.length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${BACKEND_URL}/meds/search?query=${encodeURIComponent(newMedName.trim())}`);
        const data = await response.json();
        if (data && data.status === 'success' && data.results) {
          setSuggestions(data.results);
        } else {
          // Fallback search
          const q = newMedName.toLowerCase();
          const filtered = MEDICINES_DATABASE.filter(m => 
            m.brand_name.toLowerCase().includes(q) || 
            m.generic_name.toLowerCase().includes(q)
          ).map(m => ({
            product_name: m.brand_name,
            generic_name: m.generic_name,
            market_price: m.market_price,
            jan_aushadhi_price: m.jan_aushadhi_price
          }));
          setSuggestions(filtered);
        }
      } catch (e) {
        const q = newMedName.toLowerCase();
        const filtered = MEDICINES_DATABASE.filter(m => 
          m.brand_name.toLowerCase().includes(q) || 
          m.generic_name.toLowerCase().includes(q)
        ).map(m => ({
          product_name: m.brand_name,
          generic_name: m.generic_name,
          market_price: m.market_price,
          jan_aushadhi_price: m.jan_aushadhi_price
        }));
        setSuggestions(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [newMedName]);

  useEffect(() => { loadData(); }, [patientId]);

  const openDirections = (store: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleFindNearestStore = async () => {
    setFindingStore(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setFindingStore(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      setUserLocation({ lat, lon });

      const res = await backendService.getNearestStores(lat, lon);
      if (res && res.status === 'success') {
        setNearbyStores(res.stores);
        setIsMapVisible(true);
      } else {
        Alert.alert('Error', 'Could not fetch nearby stores.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not connect to store locator service.');
    } finally {
      setFindingStore(false);
    }
  };

  const recalculateSavings = (medsList: any[]) => {
    const alts = medsList.map(med => {
      const match = MEDICINES_DATABASE.find(item => 
        item.brand_name.toLowerCase() === med.medicine_name.toLowerCase() ||
        item.generic_name.toLowerCase() === med.medicine_name.toLowerCase()
      );
      if (match) {
        return {
          brand_name: match.brand_name,
          generic_name: match.generic_name,
          market_price: match.market_price,
          jan_aushadhi_price: match.jan_aushadhi_price,
          savings_percent: Math.round(((match.market_price - match.jan_aushadhi_price) / match.market_price) * 100)
        };
      } else {
        // Fallback for new medicines
        return {
          brand_name: med.medicine_name,
          generic_name: med.medicine_name,
          market_price: 50,
          jan_aushadhi_price: 10,
          savings_percent: 80
        };
      }
    });
    setGenericAlts(alts);
  };

  const loadData = async () => {
    try {
      const savedMedsStr = await AsyncStorage.getItem(`@active_medications_${patientId}`);
      let resolved = [];
      if (savedMedsStr) {
        resolved = JSON.parse(savedMedsStr);
      } else {
        resolved = [
          { id: 'm1', medicine_name: 'Glycomet 500mg', next_dose: '08:00 AM' },
          { id: 'm2', medicine_name: 'Amlodipine 5mg', next_dose: '09:00 PM' },
          { id: 'm3', medicine_name: 'Vitamin D3', next_dose: '01:00 PM' },
        ];
        await AsyncStorage.setItem(`@active_medications_${patientId}`, JSON.stringify(resolved));
      }
      setMedications(resolved);
      recalculateSavings(resolved);
    } catch (e) {
      console.error(e);
      const fallback = [
        { id: 'm1', medicine_name: 'Glycomet 500mg', next_dose: '08:00 AM' },
        { id: 'm2', medicine_name: 'Amlodipine 5mg', next_dose: '09:00 PM' },
        { id: 'm3', medicine_name: 'Vitamin D3', next_dose: '01:00 PM' },
      ];
      setMedications(fallback);
      recalculateSavings(fallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenerics = async () => {
    // Spaced out for backwards compatibility, handled dynamically by recalculateSavings
  };

  const handleLogAdherence = async (medName: string) => {
    try {
      await logMedAdherence(patientId, medName);
    } catch {/* ignore */ }
    setTakenToday(prev => ({ ...prev, [medName]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
  };

  const handleExportJanAushadhiPDF = async () => {
    try {
      const currentCost = genericAlts.reduce((sum, item) => sum + item.market_price, 0) || 1840;
      const janCost = genericAlts.reduce((sum, item) => sum + item.jan_aushadhi_price, 0) || 210;
      const savings = currentCost - janCost;

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1f2937; }
              .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; color: #0369a1; margin-bottom: 5px; font-weight: bold; }
              .subtitle { font-size: 14px; color: #6b7280; }
              .divider { border-bottom: 1px solid #e5e7eb; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { text-align: left; background-color: #f0f9ff; color: #0369a1; padding: 12px; border-bottom: 1px solid #bae6fd; font-weight: bold; }
              td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
              .brand { font-weight: 500; color: #4b5563; }
              .generic { font-weight: bold; color: #0ea5e9; }
              .jan-price { font-weight: bold; color: #10b981; }
              .summary-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
              .summary-text { font-size: 16px; font-weight: bold; color: #166534; margin: 0; }
              .store-info { font-size: 14px; color: #374151; margin-top: 8px; }
              .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">SWASTHYA AI — JAN AUSHADHI READY PRESCRIPTION</div>
              <div class="subtitle">Patient: Indresh Suresh | Date: ${new Date().toLocaleDateString('en-GB')}</div>
            </div>
            <p style="font-weight: bold; color: #374151;">Your Doctor's Prescription → Jan Aushadhi Generic</p>
            <table>
              <thead>
                <tr>
                  <th>Doctor's Brand</th>
                  <th>Generic Equivalent</th>
                  <th>Jan Aushadhi Price</th>
                </tr>
              </thead>
              <tbody>
                ${genericAlts.length > 0 ? genericAlts.map(item => `
                  <tr>
                    <td><span class="brand">${item.brand_name}</span> <span style="color: #9ca3af; font-size: 12px;">(${item.generic_name})</span></td>
                    <td><span class="generic">${item.generic_name}</span></td>
                    <td class="jan-price">&#8377;${item.jan_aushadhi_price}/mo</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td><span class="brand">Glycomet 500mg</span> <span style="color: #9ca3af; font-size: 12px;">(Metformin)</span></td>
                    <td><span class="generic">Metformin 500mg</span></td>
                    <td class="jan-price">&#8377;9.20/mo</td>
                  </tr>
                  <tr>
                    <td><span class="brand">Amlokind 5mg</span> <span style="color: #9ca3af; font-size: 12px;">(Amlodipine)</span></td>
                    <td><span class="generic">Amlodipine 5mg</span></td>
                    <td class="jan-price">&#8377;5.50/mo</td>
                  </tr>
                  <tr>
                    <td><span class="brand">Vitamin D3</span> <span style="color: #9ca3af; font-size: 12px;">(Vitamin D3)</span></td>
                    <td><span class="generic">Vitamin D3</span></td>
                    <td class="jan-price">&#8377;12.00/mo</td>
                  </tr>
                `}
              </tbody>
            </table>
            <div class="summary-box">
              <p class="summary-text">Total monthly savings: &#8377;${savings > 0 ? savings : 1155}</p>
              <p class="store-info">Nearest Jan Aushadhi Kendra: Dadar West, 1.2 km</p>
            </div>
            <p style="font-weight: bold; color: #111827;">Show this to the Jan Aushadhi pharmacist.</p>
            <div class="footer">
              NOTE: This is not a medical prescription. Consult your doctor before switching any medication.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not generate report.');
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setNewMedName(suggestion.product_name);
    setSuggestions([]);
    handleAddMedDirectly(suggestion);
  };

  const handleAddMedDirectly = async (suggestion: any) => {
    try {
      const newMed = {
        id: `custom-${Date.now()}`,
        medicine_name: suggestion.product_name,
        next_dose: '08:00 AM'
      };

      const updatedList = [...medications, newMed];
      setMedications(updatedList);
      await AsyncStorage.setItem(`@active_medications_${patientId}`, JSON.stringify(updatedList));

      // Push to MEDICINES_DATABASE dynamically if not there so recalculateSavings finds it
      const exists = MEDICINES_DATABASE.some(m => m.brand_name.toLowerCase() === suggestion.product_name.toLowerCase());
      if (!exists) {
        MEDICINES_DATABASE.push({
          brand_name: suggestion.product_name,
          generic_name: suggestion.generic_name || suggestion.salt_composition || suggestion.product_name,
          market_price: suggestion.market_price || 50,
          jan_aushadhi_price: suggestion.jan_aushadhi_price || 10
        });
      }

      recalculateSavings(updatedList);
      setSelectedMed(newMed.medicine_name);
      setNewMedName('');
      setSuggestions([]);
      setAddModalVisible(false);

      const medPayload = {
        medicine_name: suggestion.product_name,
        dosage: 'Standard',
        frequency: 'Once daily',
        is_critical: false
      };
      addMedicine(patientId, medPayload).catch(() => {});

      setTimeout(() => setAnalysisModal(true), 400);
    } catch (e) {
      Alert.alert('Error', 'Failed to add medicine.');
    }
  };

  const handleAddMed = async () => {
    if (!newMedName.trim()) return;

    // Check if name matches a suggestion or local database item
    const match = MEDICINES_DATABASE.find(m => m.brand_name.toLowerCase() === newMedName.trim().toLowerCase());
    if (match) {
      handleAddMedDirectly({
        product_name: match.brand_name,
        generic_name: match.generic_name,
        market_price: match.market_price,
        jan_aushadhi_price: match.jan_aushadhi_price
      });
      return;
    }

    // Default fallback values
    handleAddMedDirectly({
      product_name: newMedName.trim(),
      generic_name: newMedName.trim(),
      market_price: 50,
      jan_aushadhi_price: 10
    });
  };

  const handleDeleteMed = (id: string | number, name: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to remove "${name}" from your active list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = medications.filter((m, idx) => (m.id || idx) !== id);
            setMedications(updated);
            await AsyncStorage.setItem(`@active_medications_${patientId}`, JSON.stringify(updated));
            recalculateSavings(updated);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {loading ? <SkeletonMedsScreen /> : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.title}>💊 Medications</Text>
              <Text style={styles.subtitle}>Track your daily adherence</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.exportBtn} onPress={handleExportJanAushadhiPDF}>
                <Ionicons name="download-outline" size={20} color="#0474FC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar & Analytics */}
          <WeekCalendar />
          <AnalyticsCard />

          {/* Today's Medications */}
          <Text style={styles.sectionLabel}>Today's Medications</Text>
          {medications.map((med, index) => (
            <View key={med.id || index} style={styles.medCard}>
              <View style={styles.medInfo}>
                <View style={[styles.medIconBg, takenToday[med.medicine_name] && styles.medIconTaken]}>
                  <Ionicons name="medical" size={22} color={takenToday[med.medicine_name] ? '#FFFFFF' : '#0474FC'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.medicine_name}</Text>
                  <Text style={styles.medDetail}>Next dose: {med.next_dose || 'Morning'}</Text>
                  {takenToday[med.medicine_name] && (
                    <Text style={styles.takenText}>✓ Taken at {takenToday[med.medicine_name]}</Text>
                  )}
                </View>
              </View>
              <View style={styles.medActions}>
                <TouchableOpacity
                  style={styles.analyseBtn}
                  onPress={() => { setSelectedMed(med.medicine_name); setAnalysisModal(true); }}
                >
                  <Ionicons name="flask-outline" size={16} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logButton, takenToday[med.medicine_name] && styles.logButtonTaken]}
                  onPress={() => handleLogAdherence(med.medicine_name)}
                >
                  <Ionicons
                    name={takenToday[med.medicine_name] ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={28}
                    color={takenToday[med.medicine_name] ? '#10B981' : '#0474FC'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteMed(med.id || index, med.medicine_name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Generic Alternatives */}
          {genericAlts.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>💊 Affordable Alternatives</Text>
              <View style={styles.affordabilityCard}>
                <View style={styles.affordabilityHeader}>
                  <Text style={styles.affordabilityTitle}>Pradhan Mantri Jan Aushadhi</Text>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>Save up to 80%</Text>
                  </View>
                </View>

                <View style={styles.engineOutputBox}>
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Current monthly cost:</Text>
                    <Text style={styles.engineValueRed}>₹{(genericAlts.reduce((sum, item) => sum + item.market_price, 0) || 1840).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Jan Aushadhi cost:</Text>
                    <Text style={styles.engineValueGreen}>₹{(genericAlts.reduce((sum, item) => sum + item.jan_aushadhi_price, 0) || 210).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Monthly savings:</Text>
                    <Text style={styles.engineValueGreenSave}>₹{((genericAlts.reduce((sum, item) => sum + item.market_price, 0) || 1840) - (genericAlts.reduce((sum, item) => sum + item.jan_aushadhi_price, 0) || 210)).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Annual savings:</Text>
                    <Text style={styles.engineValueGreenSave}>₹{(((genericAlts.reduce((sum, item) => sum + item.market_price, 0) || 1840) - (genericAlts.reduce((sum, item) => sum + item.jan_aushadhi_price, 0) || 210)) * 12).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.engineDivider} />
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Eligible scheme:</Text>
                    <Text style={styles.engineValueBlue}>PM-JAY (₹5L cov)</Text>
                  </View>
                  <View style={styles.engineRow}>
                    <Text style={styles.engineLabel}>Nearest store:</Text>
                    <Text style={styles.engineValueDark}>Jan Aushadhi, Dadar West</Text>
                  </View>
                </View>

                <Text style={[styles.affordabilitySub, { marginTop: 16 }]}>Generic equivalents available at government outlets:</Text>

                {genericAlts.map((item, idx) => (
                  <View key={idx} style={styles.genericItem}>
                    <View style={styles.genericInfo}>
                      <Text style={styles.brandName}>{item.brand_name}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
                      <Text style={styles.genericName}>{item.generic_name}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.marketPrice}>₹{item.market_price}</Text>
                      <Text style={styles.janPrice}>₹{item.jan_aushadhi_price}</Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.findStoreBtn} onPress={handleExportJanAushadhiPDF}>
                  <Text style={styles.findStoreText}>Download Jan Aushadhi Prescription</Text>
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.findStoreBtn, { backgroundColor: '#10B981', marginTop: 12 }]} onPress={handleFindNearestStore}>
                  <Text style={styles.findStoreText}>{findingStore ? 'Locating...' : 'Find Kendras on Map'}</Text>
                  <Ionicons name={findingStore ? 'hourglass-outline' : 'map-outline'} size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Add Med Modal */}
      <Modal transparent animationType="slide" visible={addModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="add-circle-outline" size={22} color="#0474FC" />
                <Text style={styles.modalTitle}>Add Medication</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aspirin 81mg"
              placeholderTextColor="#9CA3AF"
              value={newMedName}
              onChangeText={setNewMedName}
            />
            <Text style={{ fontSize: 12, color: '#4B5563', marginBottom: 6, fontWeight: '600' }}>Suggestions:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['Glycomet 500mg', 'Amlokind 5mg', 'Calcirol 60k'].map((med) => (
                <TouchableOpacity
                  key={med}
                  onPress={() => setNewMedName(med)}
                  style={{ backgroundColor: '#E8F2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                >
                  <Text style={{ fontSize: 12, color: '#0474FC', fontWeight: '600' }}>{med}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isSearching && (
              <ActivityIndicator size="small" color="#0474FC" style={{ marginBottom: 12 }} />
            )}
            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Ionicons name="medical" size={16} color="#0474FC" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.suggestionName}>{item.product_name}</Text>
                      <Text style={styles.suggestionGeneric}>Alt: {item.generic_name || item.salt_composition}</Text>
                    </View>
                    <Text style={styles.suggestionPrice}>₹{item.market_price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddMed}>
              <Text style={styles.submitModalText}>Add & Analyse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal visible={isMapVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={[styles.modalHeader, { paddingHorizontal: 16, paddingTop: 16 }]}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name="location" size={24} color="#0EA5E9" />
              <Text style={styles.modalTitle}>Jan Aushadhi Stores</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {userLocation ? (
              <JanAushadhiMap
                userLocation={userLocation}
                nearbyStores={nearbyStores}
                openDirections={openDirections}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Fetching location...</Text>
              </View>
            )}
          </View>
          <View style={styles.storeFooter}>
            <Text style={styles.storeFooterTitle}>Nearest Kendras ({nearbyStores.length}):</Text>
            {nearbyStores.map((store: any) => (
              <View key={store.id} style={styles.storeRow}>
                <Text style={styles.storeName}>{store.area} ({store.distance_km}km)</Text>
                <TouchableOpacity onPress={() => openDirections(store)}>
                  <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      <AIAnalysisPanel
        visible={analysisModal}
        onClose={() => setAnalysisModal(false)}
        medName={selectedMed}
        activeMeds={medications.map(m => m.medicine_name)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // Header
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0474FC', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  exportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(4, 116, 252, 0.1)', alignItems: 'center', justifyContent: 'center' },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4 },

  // Calendar
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  todayLabel: { color: '#0474FC' },
  dayDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayDotTaken: { backgroundColor: '#10B981' },
  dayDotMissed: { backgroundColor: '#EF4444' },
  dayDotToday: { borderWidth: 2, borderColor: '#0474FC' },
  calendarLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#6B7280' },

  // Analytics
  analyticsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 80, marginBottom: 8 },
  barCol: { alignItems: 'center', gap: 4 },
  barPct: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  barBg: { width: 32, height: 60, backgroundColor: '#F3F4F6', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 11, color: '#6B7280' },
  analyticsNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 },

  // Medication Card
  medCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  medIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F1FE', alignItems: 'center', justifyContent: 'center' },
  medIconTaken: { backgroundColor: '#10B981' },
  medName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  medDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  takenText: { fontSize: 11, color: '#10B981', marginTop: 3, fontWeight: '600' },
  medActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyseBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  logButton: { padding: 4 },
  logButtonTaken: { opacity: 0.7 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalMed: { fontSize: 16, fontWeight: '600', color: '#0474FC', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#6B7280', marginBottom: 16 },
  analysingBox: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 16 },
  analysingText: { color: '#60A5FA', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 22 },
  resultBox: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, marginBottom: 16 },
  resultStatus: { fontSize: 16, fontWeight: '700' },
  resultNote: { fontSize: 13, color: '#374151', textAlign: 'center', lineHeight: 20 },
  resultSource: { fontSize: 11, color: '#9CA3AF' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 16 },
  submitModalBtn: { backgroundColor: '#0474FC', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitModalText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Affordability
  affordabilityCard: { backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: '#0EA5E9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  affordabilityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  affordabilityTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1' },
  savingsBadge: { backgroundColor: '#BAE6FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  savingsBadgeText: { fontSize: 10, fontWeight: '700', color: '#0369A1' },
  engineOutputBox: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginTop: 4, marginBottom: 4 },
  engineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  engineLabel: { fontSize: 13, color: '#4B5563', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  engineValueRed: { fontSize: 13, color: '#EF4444', fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  engineValueGreen: { fontSize: 13, color: '#10B981', fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  engineValueGreenSave: { fontSize: 13, color: '#10B981', fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  engineValueBlue: { fontSize: 13, color: '#0EA5E9', fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 8 },
  engineValueDark: { fontSize: 13, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 8 },
  engineDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  affordabilitySub: { fontSize: 12, color: '#0369A1', marginBottom: 16, opacity: 0.8 },
  genericItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, marginBottom: 8 },
  genericInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandName: { fontSize: 12, fontWeight: '500', color: '#6B7280', textDecorationLine: 'line-through' },
  genericName: { fontSize: 13, fontWeight: '700', color: '#0369A1' },
  priceRow: { alignItems: 'flex-end' },
  marketPrice: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },
  janPrice: { fontSize: 14, fontWeight: '800', color: '#0EA5E9' },
  findStoreBtn: { backgroundColor: '#0EA5E9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  findStoreText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Map Footer
  storeFooter: { padding: 16, backgroundColor: '#F0F9FF' },
  storeFooterTitle: { fontWeight: '700', color: '#0369A1', marginBottom: 8 },
  storeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  storeName: { flex: 1, fontSize: 13, color: '#374151' },
  navigateText: { color: '#0EA5E9', fontWeight: '600', fontSize: 13 },
  suggestionsContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionGeneric: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});