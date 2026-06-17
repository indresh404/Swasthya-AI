// app/components/profile/FamilyTabContent.tsx
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Svg, Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  primaryDark: '#0360D0',
  card: '#FFFFFF',
  background: '#F8FAFC',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
  node: {
    self: '#0474FC',
    father: '#8B5CF6',
    sister: '#EC4899',
    shared: '#F59E0B',
  }
};

interface FamilyTabContentProps {
  familyData: any;
  onCopyFamilyCode: () => void;
  onShareFamilyCode?: () => void;
  onSetupFamily: () => void;
  membersCount: number;
  familyRiskLevel?: string;
  getRiskColor: (risk: string) => string;
}

// Family Similarity Graph Component
const FamilySimilarityGraph = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const centerX = SCREEN_WIDTH / 2 - 20;
  const centerY = 200;
  const radius = 140;

  // Family member data with shared symptoms
  const familyNodes = [
    { id: 'indresh', label: 'Indresh', type: 'self', color: COLORS.node.self, symptoms: ['Headache', 'Anxiety', 'Fatigue'] },
    { id: 'father', label: 'Raj Kumar', type: 'father', color: COLORS.node.father, symptoms: ['Hypertension', 'Fatigue'] },
    { id: 'sister', label: 'Priya', type: 'sister', color: COLORS.node.sister, symptoms: ['Headache', 'Anxiety'] },
  ];

  // Shared symptoms between members
  const sharedSymptoms = [
    { symptom: 'Headache', members: ['indresh', 'sister'], color: COLORS.node.shared },
    { symptom: 'Anxiety', members: ['indresh', 'sister'], color: COLORS.node.shared },
    { symptom: 'Fatigue', members: ['indresh', 'father'], color: COLORS.node.shared },
  ];

  const edges = [
    { source: 'indresh', target: 'sister', label: 'Shared: Headache, Anxiety' },
    { source: 'indresh', target: 'father', label: 'Shared: Fatigue' },
    { source: 'father', target: 'sister', label: 'Shared: None' },
  ];

  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getNodeOpacity = (nodeId: string) => {
    if (!selectedNode) return 1;
    if (nodeId === selectedNode) return 1;
    const isConnected = edges.some(e => 
      (e.source === selectedNode && e.target === nodeId) ||
      (e.target === selectedNode && e.source === nodeId)
    );
    return isConnected ? 0.8 : 0.3;
  };

  const getEdgeOpacity = (source: string, target: string) => {
    if (!selectedNode) return 0.5;
    if (source === selectedNode || target === selectedNode) return 0.9;
    return 0.2;
  };

  const selectedNodeData = familyNodes.find(n => n.id === selectedNode);

  return (
    <View style={styles.graphContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.graphWrapper}>
          <Svg width={SCREEN_WIDTH * 1.4} height={440}>
            {/* Draw edges */}
            {edges.map((edge, index) => {
              const source = familyNodes.find(n => n.id === edge.source);
              const target = familyNodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              
              const sourceIdx = familyNodes.indexOf(source);
              const targetIdx = familyNodes.indexOf(target);
              const sourcePos = getNodePosition(sourceIdx, familyNodes.length);
              const targetPos = getNodePosition(targetIdx, familyNodes.length);
              const opacity = getEdgeOpacity(edge.source, edge.target);
              const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
              
              const midX = (sourcePos.x + targetPos.x) / 2;
              const midY = (sourcePos.y + targetPos.y) / 2 - 20;
              const pathData = `M ${sourcePos.x} ${sourcePos.y} Q ${midX} ${midY} ${targetPos.x} ${targetPos.y}`;
              
              return (
                <Path
                  key={index}
                  d={pathData}
                  stroke={isHighlighted ? COLORS.primary : '#CBD5E1'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? undefined : '4,4'}
                  opacity={opacity}
                  fill="none"
                />
              );
            })}

            {/* Draw nodes */}
            {familyNodes.map((node, index) => {
              const pos = getNodePosition(index, familyNodes.length);
              const isSelected = selectedNode === node.id;
              const opacity = getNodeOpacity(node.id);
              const radius = node.type === 'self' ? 38 : 32;
              
              return (
                <G key={node.id}>
                  {isSelected && (
                    <Circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 12}
                      fill={node.color}
                      opacity={0.12}
                    />
                  )}
                  
                  <Circle
                    cx={pos.x + 2}
                    cy={pos.y + 2}
                    r={radius}
                    fill="rgba(0,0,0,0.08)"
                    opacity={0.3}
                  />
                  
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={node.color}
                    opacity={opacity}
                    stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  
                  <Circle
                    cx={pos.x - 4}
                    cy={pos.y - 6}
                    r={radius * 0.3}
                    fill="rgba(255,255,255,0.2)"
                    opacity={opacity * 0.6}
                  />
                  
                  <SvgText
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={node.type === 'self' ? 18 : 14}
                    fontWeight="700"
                    fill="#FFFFFF"
                    opacity={opacity}
                  >
                    {node.label.charAt(0)}
                  </SvgText>
                  
                  <SvgText
                    x={pos.x}
                    y={pos.y + radius + 16}
                    textAnchor="middle"
                    fontSize={isSelected ? 12 : 10}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? COLORS.primary : COLORS.text.secondary}
                    opacity={opacity}
                  >
                    {node.label}
                  </SvgText>
                  
                  <SvgText
                    x={pos.x}
                    y={pos.y + radius + 32}
                    textAnchor="middle"
                    fontSize={8}
                    fill={COLORS.text.light}
                    opacity={opacity * 0.8}
                  >
                    {node.type === 'self' ? 'You' : node.type}
                  </SvgText>
                  
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 10}
                    fill="transparent"
                    onPress={() => setSelectedNode(isSelected ? null : node.id)}
                  />
                </G>
              );
            })}

            {/* Shared symptom indicators */}
            {sharedSymptoms.map((shared, index) => {
              const members = shared.members.map(id => familyNodes.find(n => n.id === id)).filter(Boolean);
              if (members.length < 2) return null;
              
              const positions = members.map(m => {
                const idx = familyNodes.indexOf(m);
                return getNodePosition(idx, familyNodes.length);
              });
              
              // Draw a small badge between connected members
              const midX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
              const midY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
              
              return (
                <G key={index}>
                  <Circle
                    cx={midX}
                    cy={midY}
                    r={16}
                    fill={shared.color}
                    opacity={0.9}
                  />
                  <Circle
                    cx={midX}
                    cy={midY}
                    r={18}
                    fill="none"
                    stroke={shared.color}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                  <SvgText
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight="600"
                    fill="#FFFFFF"
                    textLength={12}
                  >
                    {shared.symptom.substring(0, 6)}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.self }]} />
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.father }]} />
            <Text style={styles.legendText}>Father</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.sister }]} />
            <Text style={styles.legendText}>Sister</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.shared }]} />
            <Text style={styles.legendText}>Shared Symptom</Text>
          </View>
        </View>
      </View>

      {/* Node Details Panel */}
      {selectedNodeData && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <View style={[styles.detailsIcon, { backgroundColor: selectedNodeData.color }]}>
              <Text style={styles.detailsInitial}>{selectedNodeData.label.charAt(0)}</Text>
            </View>
            <View style={styles.detailsInfo}>
              <Text style={styles.detailsTitle}>{selectedNodeData.label}</Text>
              <Text style={styles.detailsType}>{selectedNodeData.type === 'self' ? 'You' : selectedNodeData.type}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedNode(null)}>
              <Ionicons name="close" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsBody}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Symptoms</Text>
              <View style={styles.detailsTags}>
                {selectedNodeData.symptoms.map((symptom, i) => (
                  <View key={i} style={styles.detailsTag}>
                    <Text style={styles.detailsTagText}>{symptom}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Show shared symptoms with other members */}
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Shared With</Text>
              <View style={styles.detailsTags}>
                {sharedSymptoms
                  .filter(s => s.members.includes(selectedNodeData.id))
                  .map((s, i) => {
                    const otherMembers = s.members.filter(id => id !== selectedNodeData.id);
                    const otherNames = otherMembers.map(id => familyNodes.find(n => n.id === id)?.label).filter(Boolean);
                    return (
                      <View key={i} style={[styles.detailsTag, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.detailsTagText, { color: '#D97706' }]}>
                          {s.symptom} ({otherNames.join(', ')})
                        </Text>
                      </View>
                    );
                  })}
                {sharedSymptoms.filter(s => s.members.includes(selectedNodeData.id)).length === 0 && (
                  <Text style={styles.detailsNoShared}>No shared symptoms</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.legendTip}>Tap any family member to see shared symptoms</Text>
    </View>
  );
};

export const FamilyTabContent: React.FC<FamilyTabContentProps> = ({
  familyData,
  onCopyFamilyCode,
  onShareFamilyCode,
  onSetupFamily,
  membersCount,
  familyRiskLevel = 'Low',
  getRiskColor,
}) => {
  const viewShotRef = useRef<any>(null);
  const [showSimilarityGraph, setShowSimilarityGraph] = useState(false);

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
    <View>
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

      {/* Family Similarity Graph Button */}
      <TouchableOpacity 
        style={styles.similarityButton} 
        onPress={() => setShowSimilarityGraph(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#0474FC', '#0360D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.similarityGradient}
        >
          <Ionicons name="people-circle-outline" size={24} color="#FFFFFF" />
          <View>
            <Text style={styles.similarityButtonText}>View Family Similarity</Text>
            <Text style={styles.similarityButtonSubtext}>See which symptoms are shared</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Family Similarity Graph Modal */}
      <Modal visible={showSimilarityGraph} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSimilarityGraph(false)} style={styles.modalCloseButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.modalCloseText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>👨‍👩‍👧‍👦 Family Similarity</Text>
            <TouchableOpacity onPress={() => setShowSimilarityGraph(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <FamilySimilarityGraph />

            {/* Shared Symptoms Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Shared Symptoms Summary</Text>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: COLORS.node.shared }]} />
                <Text style={styles.summaryText}>Headache: Indresh & Priya</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: COLORS.node.shared }]} />
                <Text style={styles.summaryText}>Anxiety: Indresh & Priya</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: COLORS.node.shared }]} />
                <Text style={styles.summaryText}>Fatigue: Indresh & Raj Kumar</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  // Similarity Graph Button
  similarityButton: {
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
  similarityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  similarityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  similarityButtonSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  // Graph Styles
  graphContainer: {
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  graphWrapper: {
    paddingHorizontal: 20,
  },
  legendContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  legendTip: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.text.light,
    paddingVertical: 8,
    fontStyle: 'italic',
  },
  detailsPanel: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  detailsType: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  detailsBody: {
    marginTop: 12,
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  detailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailsTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailsTagText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  detailsNoShared: {
    fontSize: 10,
    color: COLORS.text.light,
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
    paddingBottom: 40,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
});

export default FamilyTabContent;