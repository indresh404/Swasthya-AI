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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#0474FC',
  primaryDark: '#0360D0',
  card: '#FFFFFF',
  background: '#F8FAFC',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  node: {
    user: '#0474FC',
    symptom: '#EF4444',
    fact: '#14B8A6',
    disease: '#8B5CF6',
    default: '#6B7280',
  },
};

interface HealthGraphCardProps {
  onViewGraph?: () => void;
}

// Simplified Graph Data
const GRAPH_DATA = {
  nodes: [
    { id: 'user', label: 'Indresh', type: 'user', color: COLORS.node.user, radius: 34 },
    { id: 'headache', label: 'Headache', type: 'symptom', color: COLORS.node.symptom, severity: 6 },
    { id: 'anxiety', label: 'Anxiety', type: 'symptom', color: COLORS.node.symptom, severity: 5 },
    { id: 'fatigue', label: 'Fatigue', type: 'symptom', color: COLORS.node.symptom, severity: 4 },
    { id: 'sleep', label: 'Irregular Sleep', type: 'fact', color: COLORS.node.fact },
    { id: 'stress', label: 'High Stress', type: 'fact', color: COLORS.node.fact },
    { id: 'exercise', label: 'Regular Exercise', type: 'fact', color: COLORS.node.fact },
    { id: 'diet', label: 'Irregular Meals', type: 'fact', color: COLORS.node.fact },
    { id: 'migraine', label: 'Chronic Migraine', type: 'disease', color: COLORS.node.disease },
  ],
  edges: [
    { source: 'user', target: 'headache', label: 'HAS' },
    { source: 'user', target: 'anxiety', label: 'HAS' },
    { source: 'user', target: 'fatigue', label: 'HAS' },
    { source: 'user', target: 'sleep', label: 'HAS' },
    { source: 'user', target: 'stress', label: 'HAS' },
    { source: 'user', target: 'exercise', label: 'HAS' },
    { source: 'user', target: 'diet', label: 'HAS' },
    { source: 'user', target: 'migraine', label: 'HAS' },
    { source: 'stress', target: 'headache', label: 'TRIGGERS' },
    { source: 'sleep', target: 'headache', label: 'TRIGGERS' },
    { source: 'stress', target: 'anxiety', label: 'TRIGGERS' },
    { source: 'diet', target: 'fatigue', label: 'CAUSES' },
    { source: 'migraine', target: 'headache', label: 'CAUSES' },
  ],
};

// Graph Visualization Component
const GraphVisualization = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const centerX = SCREEN_WIDTH / 2 - 20;
  const centerY = 200;
  const radius = 150;

  // Get connected nodes (excluding user)
  const connectedNodes = nodes.filter(n => n.type !== 'user');
  
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'user': return COLORS.node.user;
      case 'symptom': return COLORS.node.symptom;
      case 'fact': return COLORS.node.fact;
      case 'disease': return COLORS.node.disease;
      default: return COLORS.node.default;
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'user': return 'You';
      case 'symptom': return 'Symptom';
      case 'fact': return 'Health Fact';
      case 'disease': return 'Condition';
      default: return 'Node';
    }
  };

  const isConnectedToSelected = (nodeId: string) => {
    if (!selectedNode) return true;
    if (nodeId === selectedNode) return true;
    return edges.some(e => 
      (e.source === selectedNode && e.target === nodeId) ||
      (e.target === selectedNode && e.source === nodeId)
    );
  };

  const getNodeOpacity = (nodeId: string) => {
    if (!selectedNode) return 1;
    if (nodeId === selectedNode) return 1;
    return isConnectedToSelected(nodeId) ? 0.8 : 0.2;
  };

  const getEdgeOpacity = (source: string, target: string) => {
    if (!selectedNode) return 0.4;
    if (source === selectedNode || target === selectedNode) return 0.9;
    return 0.15;
  };

  const getNodePositionFromId = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: centerX, y: centerY };
    
    if (node.type === 'user') {
      return { x: centerX, y: centerY };
    }
    
    const idx = connectedNodes.indexOf(node);
    if (idx === -1) return { x: centerX, y: centerY };
    return getNodePosition(idx, connectedNodes.length);
  };

  const handleNodePress = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <View style={styles.graphContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.graphWrapper}>
          <Svg width={SCREEN_WIDTH * 1.6} height={460}>
            {/* Draw edges */}
            {edges.map((edge, index) => {
              const sourcePos = getNodePositionFromId(edge.source);
              const targetPos = getNodePositionFromId(edge.target);
              const opacity = getEdgeOpacity(edge.source, edge.target);
              const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
              
              const midX = (sourcePos.x + targetPos.x) / 2;
              const midY = (sourcePos.y + targetPos.y) / 2 - 15;
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
            {nodes.map((node) => {
              const isUser = node.type === 'user';
              const pos = isUser 
                ? { x: centerX, y: centerY } 
                : getNodePosition(connectedNodes.indexOf(node), connectedNodes.length);
              
              const color = getNodeColor(node.type);
              const isSelected = selectedNode === node.id;
              const isConnected = isConnectedToSelected(node.id);
              const opacity = getNodeOpacity(node.id);
              const radius = isUser ? 38 : 30;
              
              return (
                <G key={node.id}>
                  {/* Glow effect for selected node */}
                  {isSelected && (
                    <Circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 12}
                      fill={color}
                      opacity={0.12}
                    />
                  )}
                  
                  {/* Node shadow */}
                  <Circle
                    cx={pos.x + 2}
                    cy={pos.y + 2}
                    r={radius}
                    fill="rgba(0,0,0,0.08)"
                    opacity={0.3}
                  />
                  
                  {/* Main node circle */}
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={color}
                    opacity={opacity}
                    stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  
                  {/* Inner highlight */}
                  <Circle
                    cx={pos.x - 4}
                    cy={pos.y - 6}
                    r={radius * 0.3}
                    fill="rgba(255,255,255,0.2)"
                    opacity={opacity * 0.6}
                  />
                  
                  {/* Node label (first letter) */}
                  <SvgText
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={isUser ? 18 : 14}
                    fontWeight="700"
                    fill="#FFFFFF"
                    opacity={opacity}
                  >
                    {node.label.charAt(0)}
                  </SvgText>
                  
                  {/* Node full label below */}
                  <SvgText
                    x={pos.x}
                    y={pos.y + radius + 16}
                    textAnchor="middle"
                    fontSize={isSelected ? 11 : 10}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? COLORS.primary : COLORS.text.secondary}
                    opacity={opacity}
                  >
                    {node.label}
                  </SvgText>
                  
                  {/* Touch area */}
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 10}
                    fill="transparent"
                    onPress={() => handleNodePress(node.id)}
                  />
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
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.user }]} />
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.symptom }]} />
            <Text style={styles.legendText}>Symptoms</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.fact }]} />
            <Text style={styles.legendText}>Health Facts</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.node.disease }]} />
            <Text style={styles.legendText}>Conditions</Text>
          </View>
        </View>
      </View>

      {/* Node Details Panel */}
      {selectedNodeData && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <View style={[styles.detailsIcon, { backgroundColor: getNodeColor(selectedNodeData.type) }]}>
              <Text style={styles.detailsInitial}>{selectedNodeData.label.charAt(0)}</Text>
            </View>
            <View style={styles.detailsInfo}>
              <Text style={styles.detailsTitle}>{selectedNodeData.label}</Text>
              <Text style={styles.detailsType}>{getNodeTypeLabel(selectedNodeData.type)}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedNode(null)}>
              <Ionicons name="close" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsBody}>
            {selectedNodeData.severity && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Severity</Text>
                <View style={styles.detailsBadge}>
                  <Text style={styles.detailsBadgeText}>{selectedNodeData.severity}/10</Text>
                </View>
              </View>
            )}
            
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Connections</Text>
              <Text style={styles.detailsValue}>
                {edges.filter(e => e.source === selectedNodeData.id || e.target === selectedNodeData.id).length}
              </Text>
            </View>
            
            {/* Show connected nodes */}
            <View style={styles.detailsConnections}>
              <Text style={styles.detailsLabel}>Connected to:</Text>
              <View style={styles.detailsTags}>
                {edges
                  .filter(e => e.source === selectedNodeData.id || e.target === selectedNodeData.id)
                  .map((e, i) => {
                    const connectedId = e.source === selectedNodeData.id ? e.target : e.source;
                    const connectedNode = nodes.find(n => n.id === connectedId);
                    if (!connectedNode) return null;
                    return (
                      <View key={i} style={styles.detailsTag}>
                        <View style={[styles.detailsTagDot, { backgroundColor: getNodeColor(connectedNode.type) }]} />
                        <Text style={styles.detailsTagText}>{connectedNode.label}</Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.legendTip}>Tap any node to explore connections</Text>
    </View>
  );
};

export const HealthGraphCard: React.FC<HealthGraphCardProps> = ({ onViewGraph }) => {
  const { nodes, edges } = GRAPH_DATA;
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
      <TouchableOpacity style={styles.cardContainer} onPress={handleViewGraph} activeOpacity={0.8}>
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
              <Text style={styles.badgeText}>{nodes.length} Nodes</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: COLORS.node.symptom }]} />
              <Text style={styles.statValue}>{symptoms.length}</Text>
              <Text style={styles.statLabel}>Symptoms</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: COLORS.node.fact }]} />
              <Text style={styles.statValue}>{facts.length}</Text>
              <Text style={styles.statLabel}>Facts</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: COLORS.node.disease }]} />
              <Text style={styles.statValue}>{diseases.length}</Text>
              <Text style={styles.statLabel}>Conditions</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statValue}>{edges.length}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.previewNodes}>
              <View style={styles.previewEdge}>
                <View style={[styles.previewNode, { backgroundColor: COLORS.node.user }]}>
                  <Text style={styles.previewNodeText}>You</Text>
                </View>
                <View style={styles.previewArrow}>
                  <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.6)" />
                </View>
                <View style={[styles.previewNode, { backgroundColor: COLORS.node.symptom }]}>
                  <Text style={styles.previewNodeText}>Symptoms</Text>
                </View>
                <View style={styles.previewArrow}>
                  <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.6)" />
                </View>
                <View style={[styles.previewNode, { backgroundColor: COLORS.node.fact }]}>
                  <Text style={styles.previewNodeText}>Facts</Text>
                </View>
              </View>
            </View>
            <View style={styles.viewMoreContainer}>
              <Text style={styles.viewMoreText}>Tap to explore your health network →</Text>
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
            <Text style={styles.modalTitle}>Health Network</Text>
            <TouchableOpacity onPress={() => setShowGraphModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <GraphVisualization nodes={nodes} edges={edges} />

            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: COLORS.node.symptom }]} />
                <Text style={styles.modalStatValue}>{symptoms.length}</Text>
                <Text style={styles.modalStatLabel}>Symptoms</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: COLORS.node.fact }]} />
                <Text style={styles.modalStatValue}>{facts.length}</Text>
                <Text style={styles.modalStatLabel}>Health Facts</Text>
              </View>
              <View style={styles.modalStatItem}>
                <View style={[styles.modalStatDot, { backgroundColor: COLORS.node.disease }]} />
                <Text style={styles.modalStatValue}>{diseases.length}</Text>
                <Text style={styles.modalStatLabel}>Conditions</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔴 Symptoms</Text>
              {symptoms.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                  {node.severity && (
                    <Text style={styles.modalNodeMeta}>Severity: {node.severity}/10</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📋 Health Facts</Text>
              {facts.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>⚕️ Conditions</Text>
              {diseases.map(node => (
                <View key={node.id} style={[styles.modalNodeCard, { borderLeftColor: node.color }]}>
                  <Text style={styles.modalNodeLabel}>{node.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔗 All Connections</Text>
              {edges.map((edge, index) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                return (
                  <View key={index} style={styles.modalEdgeCard}>
                    <View style={styles.modalEdgeRow}>
                      <View style={[styles.modalEdgeNode, { borderColor: source.color || '#999' }]}>
                        <Text style={styles.modalEdgeNodeText}>{source.label}</Text>
                      </View>
                      <View style={styles.modalEdgeArrow}>
                        <Text style={styles.modalEdgeLabel}>{edge.label}</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.text.light} />
                      </View>
                      <View style={[styles.modalEdgeNode, { borderColor: target.color || '#999' }]}>
                        <Text style={styles.modalEdgeNodeText}>{target.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
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
    padding: 10,
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
    gap: 6,
  },
  previewEdge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewNode: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  viewMoreText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
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
  detailsValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  detailsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  detailsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  detailsConnections: {
    marginTop: 4,
  },
  detailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  detailsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailsTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailsTagText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalStatLabel: {
    fontSize: 10,
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
  modalEdgeCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  modalEdgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalEdgeNode: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  modalEdgeNodeText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  modalEdgeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalEdgeLabel: {
    fontSize: 9,
    color: COLORS.text.secondary,
  },
});

export default HealthGraphCard;