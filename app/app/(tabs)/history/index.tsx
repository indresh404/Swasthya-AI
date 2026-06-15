// app/(tabs)/history/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';

interface SymptomRecord {
  id: string;
  symptom_name: string;
  first_reported_at: string;
  last_reported_at: string;
  duration_days: number;
  status: 'active' | 'resolved';
  severity: number;
}

interface GroupedSymptoms {
  title: string;
  data: SymptomRecord[];
}

export default function HistoryScreen() {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'symptoms' | 'summaries'>('symptoms');
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedSymptoms[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchSymptomsHistory = async () => {
    try {
      console.log('[HistoryScreen] Querying symptoms from backend...');
      const symptomData = await backendService.getSymptoms();
      setSymptoms(symptomData);
      groupSymptoms(symptomData);

      console.log('[HistoryScreen] Querying summaries from backend...');
      const summaryData = await backendService.getSummaries();
      setSummaries(summaryData);
    } catch (e) {
      console.error('[HistoryScreen] Failed to load symptoms/summaries:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSymptomsHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSymptomsHistory();
  };

  const groupSymptoms = (rawList: SymptomRecord[]) => {
    const now = new Date();
    const today: SymptomRecord[] = [];
    const yesterday: SymptomRecord[] = [];
    const lastWeek: SymptomRecord[] = [];
    const older: SymptomRecord[] = [];

    rawList.forEach((sym) => {
      const reportDate = new Date(sym.last_reported_at);
      const diffTime = Math.abs(now.getTime() - reportDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;

      if (diffDays === 0) {
        today.push(sym);
      } else if (diffDays === 1) {
        yesterday.push(sym);
      } else if (diffDays <= 7) {
        lastWeek.push(sym);
      } else {
        older.push(sym);
      }
    });

    const groups: GroupedSymptoms[] = [];
    if (today.length > 0) groups.push({ title: 'Today', data: today });
    if (yesterday.length > 0) groups.push({ title: 'Yesterday', data: yesterday });
    if (lastWeek.length > 0) groups.push({ title: 'Last Week', data: lastWeek });
    if (older.length > 0) groups.push({ title: 'Older', data: older });

    setGroupedData(groups);
  };

  const getSeverityLabel = (sev: number) => {
    if (sev >= 8) return 'Severe';
    if (sev >= 5) return 'Moderate';
    return 'Mild';
  };

  const getSeverityColor = (sev: number) => {
    if (sev >= 8) return '#EF4444'; // Red
    if (sev >= 5) return '#F97316'; // Orange
    return '#10B981'; // Green
  };

  const formatReportDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderSymptomItem = ({ item }: { item: SymptomRecord }) => {
    const isResolved = item.status === 'resolved';
    const activeColor = getSeverityColor(item.severity);
    const badgeBg = isResolved ? '#334155' : `${activeColor}15`;
    const badgeText = isResolved ? '#94A3B8' : activeColor;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrapper}>
            <Text style={styles.symptomTitle}>{item.symptom_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeText }]}>
              <Text style={[styles.statusText, { color: badgeText }]}>
                {isResolved ? 'Resolved' : getSeverityLabel(item.severity)}
              </Text>
            </View>
          </View>
          <Ionicons 
            name={isResolved ? "checkmark-circle" : "alert-circle"} 
            size={20} 
            color={isResolved ? '#64748B' : activeColor} 
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.detailText}>
              First reported: {formatReportDate(item.first_reported_at)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.detailText}>
              Duration: {item.duration_days} {item.duration_days === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSummaryItem = ({ item }: { item: any }) => {
    const formattedDate = formatReportDate(item.created_at);
    
    let symptomsList: string[] = [];
    let medsList: string[] = [];
    let allergiesList: string[] = [];
    try {
      symptomsList = typeof item.symptoms_found === 'string' ? JSON.parse(item.symptoms_found) : (item.symptoms_found || []);
      medsList = typeof item.medications_found === 'string' ? JSON.parse(item.medications_found) : (item.medications_found || []);
      allergiesList = typeof item.allergies_found === 'string' ? JSON.parse(item.allergies_found) : (item.allergies_found || []);
    } catch (e) {
      console.warn('Error parsing summary JSON Arrays', e);
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrapper}>
            <Text style={styles.symptomTitle}>Clinical Summary</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.summaryTextContent}>{item.summary}</Text>
          
          {symptomsList.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Symptoms:</Text>
              <View style={styles.tagWrapper}>
                {symptomsList.map((s, idx) => (
                  <View key={idx} style={[styles.inlineTag, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }]}>
                    <Text style={[styles.inlineTagText, { color: '#EF4444' }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {medsList.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Medications:</Text>
              <View style={styles.tagWrapper}>
                {medsList.map((m, idx) => (
                  <View key={idx} style={[styles.inlineTag, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' }]}>
                    <Text style={[styles.inlineTagText, { color: '#3B82F6' }]}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {allergiesList.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Allergies:</Text>
              <View style={styles.tagWrapper}>
                {allergiesList.map((a, idx) => (
                  <View key={idx} style={[styles.inlineTag, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }]}>
                    <Text style={[styles.inlineTagText, { color: '#F59E0B' }]}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.masterContainer}>
      <ScreenWrapper style={{ backgroundColor: '#07111f' }} scroll={false}>
        <StatusBar barStyle="light-content" backgroundColor="#07111f" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clinical History</Text>
          <Text style={styles.headerSubtitle}>Vitals & symptoms tracked from your health profile</Text>
        </View>

        {/* Tab Toggle Switch */}
        <View style={styles.tabToggleContainer}>
          <TouchableOpacity 
            style={[styles.tabToggleButton, activeHistoryTab === 'symptoms' && styles.tabToggleButtonActive]}
            onPress={() => setActiveHistoryTab('symptoms')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabToggleText, activeHistoryTab === 'symptoms' && styles.tabToggleTextActive]}>
              Symptom Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabToggleButton, activeHistoryTab === 'summaries' && styles.tabToggleButtonActive]}
            onPress={() => setActiveHistoryTab('summaries')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabToggleText, activeHistoryTab === 'summaries' && styles.tabToggleTextActive]}>
              AI Summaries
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0474FC" />
            <Text style={styles.loadingText}>Fetching historical records...</Text>
          </View>
        ) : activeHistoryTab === 'symptoms' ? (
          symptoms.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0474FC" />}
            >
              <Ionicons name="folder-open-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>No Symptoms Logged Yet</Text>
              <Text style={styles.emptyDesc}>
                Chat with Swasthya AI to report symptoms. They will be analyzed, tracked, and logged here.
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={groupedData}
              keyExtractor={(item) => item.title}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#0474FC" 
                  colors={['#0474FC']}
                />
              }
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.groupSection}>
                  <Text style={styles.groupTitle}>{item.title}</Text>
                  {item.data.map((sym) => (
                    <View key={sym.id}>
                      {renderSymptomItem({ item: sym })}
                    </View>
                  ))}
                </View>
              )}
            />
          )
        ) : (
          summaries.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0474FC" />}
            >
              <Ionicons name="document-text-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>No Summaries Generated</Text>
              <Text style={styles.emptyDesc}>
                Summaries compile periodically as you chat. Use the AI Assistant to log clinical consultations.
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={summaries}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#0474FC" 
                  colors={['#0474FC']}
                />
              }
              contentContainerStyle={styles.listContainer}
              renderItem={renderSummaryItem}
            />
          )
        )}
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { 
    flex: 1, 
    backgroundColor: '#07111f' 
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  headerSubtitle: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  tabToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabToggleButtonActive: {
    backgroundColor: '#0474FC',
  },
  tabToggleText: {
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginTop: SPACING.md,
  },
  emptyDesc: {
    color: COLORS.gray[400],
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 120, // tab bar padding
  },
  groupSection: {
    marginBottom: SPACING.md,
  },
  groupTitle: {
    color: '#0474FC',
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symptomTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    textTransform: 'capitalize',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 9,
  },
  cardBody: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: COLORS.gray[300],
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  summaryTextContent: {
    color: '#ECECF1',
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tagSection: {
    marginTop: 8,
  },
  tagSectionLabel: {
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inlineTag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inlineTagText: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  dateBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 10,
  },
});
