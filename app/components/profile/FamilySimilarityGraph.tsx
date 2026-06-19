// app/components/profile/FamilySimilarityGraph.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Svg, Circle, G, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH * 1.8;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = 260;

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  family: '#8B5CF6',
  symptom: '#F59E0B',
  condition: '#EF4444',
  card: '#FFFFFF',
  background: '#F8FAFC',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    light: '#94A3B8',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
  },
};

// --- DATA MODEL (Neo4j Graph Emulation) ---
const graphNodes = [
  // People Nodes
  { id: 'indresh', label: 'Indresh', type: 'Person', role: 'Self', x: CENTER_X, y: CENTER_Y, color: COLORS.primary, data: { age: 20, phone: '+91 9324474812', risk: 'Moderate' } },
  { id: 'divya', label: 'Divya', type: 'Person', role: 'Mother', x: CENTER_X - 160, y: CENTER_Y - 120, color: COLORS.family, data: { age: 42, phone: '+91 7559302315', risk: 'Low' } },
  { id: 'monish', label: 'Monish', type: 'Person', role: 'Grandfather', x: CENTER_X - 140, y: CENTER_Y + 140, color: COLORS.family, data: { age: 65, phone: '+91 9372962545', risk: 'Low' } },
  { id: 'ankita', label: 'Ankita', type: 'Person', role: 'Child', x: CENTER_X + 160, y: CENTER_Y + 60, color: COLORS.family, data: { age: 10, phone: '+91 9970206614', risk: 'Low' } },
  // Medical Nodes
  { id: 'symp_anxiety', label: 'Anxiety', type: 'Symptom', x: CENTER_X - 80, y: CENTER_Y - 80, color: COLORS.symptom, data: { severity: 'Moderate', connected: ['Indresh', 'Divya'] } },
  { id: 'symp_migraine', label: 'Migraine', type: 'Symptom', x: CENTER_X + 90, y: CENTER_Y - 90, color: COLORS.symptom, data: { severity: 'High', connected: ['Indresh'] } },
  { id: 'symp_fatigue', label: 'Fatigue', type: 'Symptom', x: CENTER_X - 60, y: CENTER_Y + 80, color: COLORS.symptom, data: { severity: 'Mild', connected: ['Monish'] } },
  { id: 'cond_hyper', label: 'Hypertension', type: 'Condition', x: CENTER_X + 40, y: CENTER_Y + 160, color: COLORS.condition, data: { severity: 'Chronic', connected: ['Monish'] } },
];

const graphEdges = [
  // Relationships
  { source: 'indresh', target: 'divya', label: 'MOTHER' },
  { source: 'indresh', target: 'monish', label: 'GRANDFATHER' },
  { source: 'indresh', target: 'ankita', label: 'CHILD' },
  // Health Vectors
  { source: 'indresh', target: 'symp_anxiety', label: 'REPORTS' },
  { source: 'indresh', target: 'symp_migraine', label: 'REPORTS' },
  { source: 'divya', target: 'symp_anxiety', label: 'REPORTS' },
  { source: 'monish', target: 'symp_fatigue', label: 'REPORTS' },
  { source: 'monish', target: 'cond_hyper', label: 'DIAGNOSED_WITH' },
];

export const FamilySimilarityGraph = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const panelOpacity = useSharedValue(0);
  const panelTranslateY = useSharedValue(20);

  const selectedNode = graphNodes.find(n => n.id === selectedNodeId);

  useEffect(() => {
    if (selectedNodeId) {
      panelOpacity.value = withTiming(1, { duration: 300 });
      panelTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      panelOpacity.value = withTiming(0, { duration: 200 });
      panelTranslateY.value = withTiming(20, { duration: 200 });
    }
  }, [selectedNodeId]);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
    transform: [{ translateY: panelTranslateY.value }],
  }));

  // Helper to render dynamic details based on node type
  const renderNodeDetails = () => {
    if (!selectedNode) return null;

    if (selectedNode.type === 'Person') {
      const riskColor = COLORS.risk[selectedNode.data.risk.toLowerCase() as keyof typeof COLORS.risk] || COLORS.risk.low;
      return (
        <View style={styles.detailsBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{selectedNode.data.age} yrs</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{selectedNode.data.phone}</Text>
            </View>
          </View>
          <View style={styles.riskContainer}>
            <Text style={styles.riskLabel}>AI Health Risk Assessment</Text>
            <View style={[styles.riskBadge, { backgroundColor: `${riskColor}15` }]}>
              <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
              <Text style={[styles.riskText, { color: riskColor }]}>{selectedNode.data.risk} Risk</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.detailsBody}>
        <Text style={styles.infoLabel}>Severity Level</Text>
        <Text style={[styles.infoValue, { color: selectedNode.color, marginBottom: 12 }]}>
          {selectedNode.data.severity}
        </Text>
        <Text style={styles.infoLabel}>Observed In</Text>
        <View style={styles.tagContainer}>
          {selectedNode.data.connected.map((name: string, i: number) => (
            <View key={i} style={styles.personTag}>
              <Text style={styles.personTagText}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Swasthya Memory Graph</Text>
        <Text style={styles.subtitle}>Interactive entity mapping and symptom vectors</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        // Start scroll position roughly in the middle
        contentOffset={{ x: (CANVAS_WIDTH - SCREEN_WIDTH) / 2, y: 0 }} 
      >
        <Svg width={CANVAS_WIDTH} height={520}>
          <Defs>
            {/* Soft grid pattern background */}
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F1F5F9" stopOpacity="0.5"/>
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
            </LinearGradient>
          </Defs>

          {/* Draw Edges (Relationships) */}
          {graphEdges.map((edge, index) => {
            const source = graphNodes.find(n => n.id === edge.source);
            const target = graphNodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const isHighlighted = selectedNodeId === source.id || selectedNodeId === target.id;
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            return (
              <G key={`edge-${index}`}>
                <Path 
                  d={`M ${source.x} ${source.y} Q ${midX} ${midY + 20} ${target.x} ${target.y}`} 
                  stroke={isHighlighted ? COLORS.primary : '#E2E8F0'} 
                  strokeWidth={isHighlighted ? 2.5 : 1.5} 
                  fill="none" 
                  strokeDasharray={edge.label.includes('REPORTS') ? '4,4' : undefined} 
                />
                {/* Neo4j Style Relationship Labels */}
                {isHighlighted && (
                  <G transform={`translate(${midX}, ${midY})`}>
                    <Rect x="-40" y="-10" width="80" height="20" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
                    <SvgText textAnchor="middle" y="3" fontSize="8" fontWeight="700" fill={COLORS.text.secondary} letterSpacing="0.5">
                      {edge.label}
                    </SvgText>
                  </G>
                )}
              </G>
            );
          })}

          {/* Draw Nodes (Entities) */}
          {graphNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isPerson = node.type === 'Person';
            const radius = isSelected ? 32 : 28;

            return (
              <G key={node.id} onPress={() => setSelectedNodeId(isSelected ? null : node.id)}>
                {isSelected && (
                  <Circle cx={node.x} cy={node.y} r={radius + 8} fill={node.color} opacity={0.15} />
                )}
                <Circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={radius} 
                  fill="#FFFFFF" 
                  stroke={node.color} 
                  strokeWidth={isSelected ? 4 : 2} 
                />
                <Circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={radius - 4} 
                  fill={node.color} 
                  opacity={0.1} 
                />
                <SvgText x={node.x} y={node.y + 6} textAnchor="middle" fontSize="16" fontWeight="800" fill={node.color}>
                  {node.label.charAt(0)}
                </SvgText>
                
                {/* Node Label Below */}
                <SvgText 
                  x={node.x} 
                  y={node.y + radius + 18} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fontWeight={isSelected ? '700' : '600'} 
                  fill={COLORS.text.primary}
                >
                  {node.label}
                </SvgText>
                {/* Node Type Subtitle */}
                <SvgText x={node.x} y={node.y + radius + 32} textAnchor="middle" fontSize="10" fill={COLORS.text.light}>
                  {isPerson ? node.role : node.type}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>

      {/* Floating Details Panel */}
      {selectedNode && (
        <Animated.View style={[styles.detailsPanel, animatedPanelStyle]}>
          <ExpoLinearGradient
            colors={[`${selectedNode.color}15`, '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.panelGradient}
          >
            <View style={styles.panelHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: `${selectedNode.color}20` }]}>
                  <Text style={[styles.iconText, { color: selectedNode.color }]}>
                    {selectedNode.label.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.nodeTitle}>{selectedNode.label}</Text>
                  <View style={styles.nodeTypeBadge}>
                    <Text style={styles.nodeTypeText}>{selectedNode.type}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedNodeId(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.text.light} />
              </TouchableOpacity>
            </View>

            {renderNodeDetails()}
            
          </ExpoLinearGradient>
        </Animated.View>
      )}

      {/* Helper component for SVG Rect to fix missing import in native SVG usually */}
      <Defs>
         <Path id="rectMock"/>
      </Defs>
    </View>
  );
};

// SVG Rect component declaration since it wasn't imported top-level
const Rect = ({ x, y, width, height, rx, fill, stroke }: any) => (
  <Path 
    d={`M${Number(x)+Number(rx)},${y} h${Number(width)-2*Number(rx)} a${rx},${rx} 0 0 1 ${rx},${rx} v${Number(height)-2*Number(rx)} a${rx},${rx} 0 0 1 -${rx},${rx} h-${Number(width)-2*Number(rx)} a${rx},${rx} 0 0 1 -${rx},-${rx} v-${Number(height)-2*Number(rx)} a${rx},${rx} 0 0 1 ${rx},-${rx} z`} 
    fill={fill} 
    stroke={stroke} 
  />
);

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  scrollContent: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 20,
  },
  detailsPanel: { 
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card, 
    borderRadius: 24, 
    overflow: 'hidden', 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 24, 
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  panelGradient: {
    padding: 20,
  },
  panelHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '800',
  },
  nodeTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  nodeTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  nodeTypeText: { 
    fontSize: 10, 
    fontWeight: '700',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: { 
    padding: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  detailsBody: { 
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  riskContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  personTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});

export default FamilySimilarityGraph;