// app/components/profile/HealthGraphCard.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FAKE_HEALTH_GRAPH_NODES } from '@/constants/fakeData';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  border: '#E5E7EB',
  background: '#F9FAFB',
};

interface HealthGraphCardProps {
  onViewGraph: () => void;
}

export const HealthGraphCard: React.FC<HealthGraphCardProps> = ({ onViewGraph }) => {
  const { nodes, edges } = FAKE_HEALTH_GRAPH_NODES;
  const [showGraphModal, setShowGraphModal] = useState(false);

  const symptoms = nodes.filter(n => n.type === 'symptom');
  const facts = nodes.filter(n => n.type === 'fact');
  const diseases = nodes.filter(n => n.type === 'disease');

  const handleViewGraph = () => {
    setShowGraphModal(true);
    if (onViewGraph) onViewGraph();
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handleViewGraph} activeOpacity={0.8}>
        <LinearGradient
          colors={['#0474FC', '#0360D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="git-network-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Health Network</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {nodes.length} Connections
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.statValue}>{symptoms.length}</Text>
              <Text style={styles.statLabel}>Symptoms</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.statValue}>{facts.length}</Text>
              <Text style={styles.statLabel}>Health Facts</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#C7CEEA' }]} />
              <Text style={styles.statValue}>{diseases.length}</Text>
              <Text style={styles.statLabel}>Conditions</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statValue}>{edges.length}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.previewNodes}>
              {/* Show a few node connections as preview */}
              {edges.slice(0, 3).map((edge, index) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                return (
                  <View key={index} style={styles.previewEdge}>
                    <View style={[styles.previewNode, { backgroundColor: source.color || '#999' }]}>
                      <Text style={styles.previewNodeText}>
                        {source.label.split('(')[0].trim().substring(0, 8)}
                      </Text>
                    </View>
                    <View style={styles.previewArrow}>
                      <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.6)" />
                    </View>
                    <View style={[styles.previewNode, { backgroundColor: target.color || '#999' }]}>
                      <Text style={styles.previewNodeText}>
                        {target.label.split('(')[0].trim().substring(0, 8)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.viewMoreContainer}>
              <Text style={styles.viewMoreText}>Tap to explore full network →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Graph Modal */}
      <Modal visible={showGraphModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGraphModal(false)} style={styles.modalCloseButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.modalCloseText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>🧬 Health Network</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Stats Summary */}
            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.modalStatValue}>{symptoms.length}</Text>
                <Text style={styles.modalStatLabel}>Symptoms</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: '#4ECDC4' }]} />
                <Text style={styles.modalStatValue}>{facts.length}</Text>
                <Text style={styles.modalStatLabel}>Health Facts</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: '#C7CEEA' }]} />
                <Text style={styles.modalStatValue}>{diseases.length}</Text>
                <Text style={styles.modalStatLabel}>Conditions</Text>
              </View>
            </View>

            {/* Connections */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔗 Connections</Text>
              {edges.map((edge, index) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                return (
                  <View key={index} style={styles.modalEdgeCard}>
                    <View style={styles.modalEdgeRow}>
                      <View style={[styles.modalEdgeNode, { borderColor: source.color || '#999' }]}>
                        <Text style={styles.modalEdgeNodeText}>
                          {source.label.split('(')[0].trim()}
                        </Text>
                      </View>
                      <View style={styles.modalEdgeArrow}>
                        <Text style={styles.modalEdgeLabel}>{edge.label}</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.text.light} />
                      </View>
                      <View style={[styles.modalEdgeNode, { borderColor: target.color || '#999' }]}>
                        <Text style={styles.modalEdgeNodeText}>
                          {target.label.split('(')[0].trim()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Symptoms */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔴 Active Symptoms</Text>
              {symptoms.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                  {node.since && (
                    <Text style={styles.modalNodeMeta}>Since: {node.since}</Text>
                  )}
                  {node.severity && (
                    <View style={styles.modalSeverityBar}>
                      <View style={[styles.modalSeverityFill, { width: `${(node.severity/10)*100}%` }]} />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Health Facts */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📋 Health Facts</Text>
              {facts.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                  <View style={styles.modalNodeTags}>
                    <View style={styles.modalNodeTag}>
                      <Text style={styles.modalNodeTagText}>{node.category}</Text>
                    </View>
                    <View style={[styles.modalNodeTag, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.modalNodeTagText, { color: '#27AE60' }]}>{node.frequency}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Diseases */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>⚕️ Chronic Conditions</Text>
              {diseases.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientCard: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  previewContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
  },
  previewNodes: {
    gap: 8,
  },
  previewEdge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewNode: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  previewNodeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  previewArrow: {
    alignItems: 'center',
  },
  viewMoreContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  viewMoreText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalStatLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  modalSection: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  modalEdgeCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalEdgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalEdgeNode: {
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  modalEdgeNodeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  modalEdgeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalEdgeLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  modalNodeCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  modalNodeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  modalNodeMeta: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  modalSeverityBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  modalSeverityFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  modalNodeTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  modalNodeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalNodeTagText: {
    fontSize: 10,
    color: '#1976D2',
    textTransform: 'capitalize',
  },
});

export default HealthGraphCard;