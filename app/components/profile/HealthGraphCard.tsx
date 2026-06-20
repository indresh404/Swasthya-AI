// app/components/profile/HealthGraphCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, G, Path, Text as SvgText } from 'react-native-svg';

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial,
} from 'd3-force';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  bg: '#000000',
  card: '#111111',
  border: '#222222',
  primary: '#1A1A1A',
  text: { primary: '#E2E8F0', secondary: '#94A3B8', light: '#475569' },
  nodes: {
    patient: '#38BDF8',
    category: '#64748B',
    disease: '#F43F5E',
    symptoms: '#F97316',
    medications: '#10B981',
    lifestyle: '#EAB308',
    habits: '#F59E0B',
    allergies: '#EC4899',
    surgeries: '#14B8A6',
    familyHistory: '#8B5CF6',
    labReports: '#A855F7',
    vitals: '#06B6D4',
    mentalHealth: '#6366F1',
    nutrition: '#84CC16',
    sleep: '#3B82F6',
    exercise: '#22C55E',
    doctorVisits: '#0EA5E9',
  },
};

// --- THE FULL "OLD" DATASET ---
const GRAPH_DATA = {
  nodes: [
    { id: 'Indresh', label: 'Indresh', type: 'patient', radius: 40 },
    // Categories
    { id: 'cat_symptoms', label: 'Symptoms', type: 'category', radius: 22 },
    { id: 'cat_diseases', label: 'Diseases', type: 'category', radius: 22 },
    { id: 'cat_medications', label: 'Medications', type: 'category', radius: 22 },
    { id: 'cat_lifestyle', label: 'Lifestyle', type: 'category', radius: 22 },
    { id: 'cat_habits', label: 'Habits', type: 'category', radius: 22 },
    { id: 'cat_allergies', label: 'Allergies', type: 'category', radius: 22 },
    { id: 'cat_labs', label: 'Lab Reports', type: 'category', radius: 22 },
    { id: 'cat_vitals', label: 'Vitals', type: 'category', radius: 22 },
    { id: 'cat_sleep', label: 'Sleep', type: 'category', radius: 22 },
    { id: 'cat_exercise', label: 'Exercise', type: 'category', radius: 22 },
    // Sub-nodes
    { id: 'sym_fever', label: 'Fever', type: 'symptoms', radius: 12 },
    { id: 'sym_headache', label: 'Headache', type: 'symptoms', radius: 12 },
    { id: 'sym_fatigue', label: 'Fatigue', type: 'symptoms', radius: 12 },
    { id: 'sym_dizziness', label: 'Dizziness', type: 'symptoms', radius: 12 },
    { id: 'dis_t2d', label: 'Diabetes Type 2', type: 'disease', radius: 12 },
    { id: 'dis_htn', label: 'Hypertension', type: 'disease', radius: 12 },
    { id: 'dis_obesity', label: 'Obesity', type: 'disease', radius: 12 },
    { id: 'dis_predia', label: 'Prediabetes', type: 'disease', radius: 12 },
    { id: 'med_metformin', label: 'Metformin', type: 'medications', radius: 12 },
    { id: 'med_lisinopril', label: 'Lisinopril', type: 'medications', radius: 12 },
    { id: 'med_vitd', label: 'Vitamin D', type: 'medications', radius: 12 },
    { id: 'life_sedentary', label: 'Sedentary', type: 'lifestyle', radius: 12 },
    { id: 'life_water', label: 'Low Water', type: 'lifestyle', radius: 12 },
    { id: 'hab_late', label: 'Late Sleeping', type: 'habits', radius: 12 },
    { id: 'hab_screen', label: 'Excess Screen', type: 'habits', radius: 12 },
    { id: 'alg_dust', label: 'Dust', type: 'allergies', radius: 12 },
    { id: 'alg_pollen', label: 'Pollen', type: 'allergies', radius: 12 },
    { id: 'lab_hba1c', label: 'HbA1c', type: 'labReports', radius: 12 },
    { id: 'lab_chol', label: 'Cholesterol', type: 'labReports', radius: 12 },
    { id: 'lab_vitd', label: 'Vitamin D', type: 'labReports', radius: 12 },
    { id: 'vit_bp', label: 'Blood Pressure', type: 'vitals', radius: 12 },
    { id: 'vit_bmi', label: 'BMI', type: 'vitals', radius: 12 },
    { id: 'slp_6hr', label: '6 Hours Sleep', type: 'sleep', radius: 12 },
    { id: 'slp_quality', label: 'Poor Quality', type: 'sleep', radius: 12 },
    { id: 'exc_walking', label: 'Walking', type: 'exercise', radius: 12 },
  ],
  edges: [
    // Hierarchy
    { source: 'Indresh', target: 'cat_symptoms', weight: 3 },
    { source: 'Indresh', target: 'cat_diseases', weight: 3 },
    { source: 'Indresh', target: 'cat_medications', weight: 3 },
    { source: 'Indresh', target: 'cat_lifestyle', weight: 3 },
    { source: 'Indresh', target: 'cat_habits', weight: 3 },
    { source: 'Indresh', target: 'cat_allergies', weight: 3 },
    { source: 'Indresh', target: 'cat_labs', weight: 3 },
    { source: 'Indresh', target: 'cat_vitals', weight: 3 },
    { source: 'Indresh', target: 'cat_sleep', weight: 3 },
    { source: 'Indresh', target: 'cat_exercise', weight: 3 },
    { source: 'cat_symptoms', target: 'sym_fever' }, { source: 'cat_symptoms', target: 'sym_headache' }, { source: 'cat_symptoms', target: 'sym_fatigue' }, { source: 'cat_symptoms', target: 'sym_dizziness' },
    { source: 'cat_diseases', target: 'dis_t2d' }, { source: 'cat_diseases', target: 'dis_htn' }, { source: 'cat_diseases', target: 'dis_obesity' }, { source: 'cat_diseases', target: 'dis_predia' },
    { source: 'cat_medications', target: 'med_metformin' }, { source: 'cat_medications', target: 'med_lisinopril' }, { source: 'cat_medications', target: 'med_vitd' },
    { source: 'cat_lifestyle', target: 'life_sedentary' }, { source: 'cat_lifestyle', target: 'life_water' },
    { source: 'cat_habits', target: 'hab_late' }, { source: 'cat_habits', target: 'hab_screen' },
    { source: 'cat_allergies', target: 'alg_dust' }, { source: 'cat_allergies', target: 'alg_pollen' },
    { source: 'cat_labs', target: 'lab_hba1c' }, { source: 'cat_labs', target: 'lab_chol' }, { source: 'cat_labs', target: 'lab_vitd' },
    { source: 'cat_vitals', target: 'vit_bp' }, { source: 'cat_vitals', target: 'vit_bmi' },
    { source: 'cat_sleep', target: 'slp_6hr' }, { source: 'cat_sleep', target: 'slp_quality' },
    { source: 'cat_exercise', target: 'exc_walking' },
    
    // Cross-links
    { source: 'dis_t2d', target: 'med_metformin', type: 'cross' },
    { source: 'dis_t2d', target: 'lab_hba1c', type: 'cross' },
    { source: 'dis_htn', target: 'vit_bp', type: 'cross' },
    { source: 'life_sedentary', target: 'dis_obesity', type: 'cross' },
    { source: 'dis_obesity', target: 'vit_bmi', type: 'cross' },
    { source: 'hab_late', target: 'sym_fatigue', type: 'cross' },
    { source: 'slp_6hr', target: 'sym_fatigue', type: 'cross' },
    { source: 'lab_vitd', target: 'sym_fatigue', type: 'cross' },
  ],
};

const getSafeId = (nodeObjOrStr: any) => typeof nodeObjOrStr === 'string' ? nodeObjOrStr : nodeObjOrStr.id;

// --- D3 ENGINE WITH PERFORMANCE COOLING ---
const useForceSimulation = (data: any, width: number, height: number) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const simNodes = data.nodes.map((d: any) => ({ ...d }));
    const simEdges = data.edges.map((d: any) => ({ ...d }));

    const root = simNodes.find((n: any) => n.id === 'Indresh');
    if (root) {
      root.fx = width / 2;
      root.fy = height / 2;
    }

    const simulation = forceSimulation(simNodes)
      .force('link', forceLink(simEdges)
        .id((d: any) => d.id)
        .distance((link: any) => link.weight === 3 ? 160 : (link.type === 'cross' ? 250 : 60))
        .strength((link: any) => link.type === 'cross' ? 0.05 : 0.8)
      )
      .force('charge', forceManyBody().strength(-180))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide().radius((d: any) => d.radius + 10).iterations(2))
      .force('radial', forceRadial(180, width / 2, height / 2).strength((d: any) => d.type === 'category' ? 0.8 : 0))
      .alphaDecay(0.06)
      .velocityDecay(0.4); 
      
    let frameId: number | null = null;

    simulation.on('tick', () => {
      if (!frameId) {
        frameId = requestAnimationFrame(() => {
          setNodes([...simNodes]);
          setEdges([...simEdges]);
          frameId = null;
        });
      }
    });

    simulation.alpha(1).restart();
    
    return () => {
      simulation.stop();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [data, width, height]);

  return { nodes, edges };
};

// --- ENHANCED PAN & ZOOM GRAPH VIEW WITH PINCH-TO-ZOOM ---
const GraphView = ({ data, onNodeSelect }: { data: any, onNodeSelect: (node: any) => void }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const canvasSize = Math.max(SCREEN_WIDTH * 2, 1100);
  const { nodes, edges } = useForceSimulation(data, canvasSize, canvasSize);

  // Animation Values
  const pan = useRef(new Animated.ValueXY({ 
    x: -(canvasSize - SCREEN_WIDTH) / 2, 
    y: -(canvasSize - SCREEN_HEIGHT) / 2 
  })).current;
  const scale = useRef(new Animated.Value(0.75)).current;
  
  // Tracking values for Pinch-to-Zoom
  const currentScale = useRef(0.75);
  const initialTouchDistance = useRef<number | null>(null);

  // Keep track of the actual scale value
  useEffect(() => {
    const listener = scale.addListener(({ value }) => {
      currentScale.current = value;
    });
    return () => scale.removeListener(listener);
  }, []);

  // Helper to calculate distance between two fingers
  const getDistance = (touches: any) => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };

  // Enhanced PanResponder with Pinch-to-Zoom support
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5 || gesture.numberActiveTouches === 2;
      },
      onPanResponderGrant: (evt) => { 
        pan.extractOffset(); 
        if (evt.nativeEvent.touches.length === 2) {
          initialTouchDistance.current = getDistance(evt.nativeEvent.touches);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          // PINCH TO ZOOM
          if (initialTouchDistance.current) {
            const currentDistance = getDistance(touches);
            if (currentDistance > 0) {
              const scaleFactor = currentDistance / initialTouchDistance.current;
              // Limit zoom between 0.3x (zoomed out) and 3x (zoomed in)
              const newScale = Math.max(0.3, Math.min(currentScale.current * scaleFactor, 3.0));
              scale.setValue(newScale);
            }
          }
        } else if (touches.length === 1 && !initialTouchDistance.current) {
          // SINGLE FINGER PAN
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: () => { 
        pan.flattenOffset(); 
        initialTouchDistance.current = null; // Reset zoom tracking
      },
      onPanResponderTerminate: () => {
        initialTouchDistance.current = null;
      }
    })
  ).current;

  const handleNodePress = (node: any) => {
    const newSelected = selectedId === node.id ? null : node.id;
    setSelectedId(newSelected);
    onNodeSelect(newSelected ? node : null);
  };

  const isHighlighted = (nodeId: string) => {
    if (!selectedId) return true;
    if (nodeId === selectedId) return true;
    return edges.some(e => 
      (getSafeId(e.source) === selectedId && getSafeId(e.target) === nodeId) || 
      (getSafeId(e.target) === selectedId && getSafeId(e.source) === nodeId)
    );
  };

  const getNodeColor = (type: string) => COLORS.nodes[type as keyof typeof COLORS.nodes] || COLORS.nodes.category;

  return (
    <View style={styles.graphContainer} {...panResponder.panHandlers}>
      <Animated.View style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: scale }] }}>
        <Svg width={canvasSize} height={canvasSize}>
          
          {/* Edges */}
          {edges.map((edge, i) => {
            if (!edge.source.x || !edge.target.x) return null;
            
            const sourceId = getSafeId(edge.source);
            const targetId = getSafeId(edge.target);
            const isCrossLink = edge.type === 'cross';
            const isActive = selectedId && (sourceId === selectedId || targetId === selectedId);
            const opacity = !selectedId ? (isCrossLink ? 0.15 : 0.4) : (isActive ? 0.8 : 0.05);
            
            const d = isCrossLink 
              ? `M ${edge.source.x} ${edge.source.y} Q ${(edge.source.x + edge.target.x)/2 + 50} ${(edge.source.y + edge.target.y)/2 - 50} ${edge.target.x} ${edge.target.y}`
              : `M ${edge.source.x} ${edge.source.y} L ${edge.target.x} ${edge.target.y}`;

            return (
              <Path
                key={`edge-${i}`}
                d={d}
                stroke={isActive ? '#FFFFFF' : (isCrossLink ? '#475569' : '#333333')}
                strokeWidth={isActive ? 2 : (isCrossLink ? 1 : 1.5)}
                strokeDasharray={isCrossLink ? "4,4" : "none"}
                fill="none"
                opacity={opacity}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            if (!node.x) return null;
            
            const color = getNodeColor(node.type);
            const isSelected = selectedId === node.id;
            const opacity = isHighlighted(node.id) ? 1 : 0.15;
            const isRoot = node.type === 'patient';
            const isCategory = node.type === 'category';
            
            // Only show text for Main nodes OR if tapped
            const showLabel = isRoot || isCategory || isSelected;
            
            return (
              <G key={`node-${node.id}`} onPress={() => handleNodePress(node)}>
                <Circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={node.radius} 
                  fill={isRoot || isSelected ? color : COLORS.card} 
                  stroke={color} 
                  strokeWidth={isSelected ? 3 : (isRoot ? 0 : 2)} 
                  opacity={opacity}
                />

                {showLabel && (
                  <SvgText
                    x={node.x}
                    y={node.y + node.radius + 14}
                    textAnchor="middle"
                    fontSize={isRoot ? 20 : (isCategory ? 14 : 12)}
                    fontWeight={isRoot || isSelected ? '700' : '500'}
                    fill={isSelected || isRoot ? '#FFFFFF' : COLORS.text.secondary}
                    opacity={opacity}
                  >
                    {node.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
};

// --- MAIN COMPONENT ---
export const HealthGraphCard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const totalNodes = GRAPH_DATA.nodes.length;
  const totalRelationships = GRAPH_DATA.edges.length;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setShowModal(true)} activeOpacity={0.9}>
        <LinearGradient colors={['#111111', '#080808']} style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}><Ionicons name="git-network" size={20} color={COLORS.nodes.patient} /></View>
            <Text style={styles.cardTitle}>Health Graph </Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{totalNodes} nodes</Text></View>
          </View>
          
          <View style={styles.statsRow}>
            <Text style={styles.statText}><Text style={{color: '#FFF'}}>{totalRelationships}</Text> relationships tracked</Text>
            <Ionicons name="pulse" size={16} color={COLORS.nodes.disease} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="fade" transparent={false}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBack}>
              <Ionicons name="close" size={24} color="#FFF" />
              <Text style={styles.modalBackText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Indresh's Network</Text>
            <View style={{width: 60}} /> 
          </View>
          
          <View style={{ flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            <GraphView data={GRAPH_DATA} onNodeSelect={setSelectedNode} />
            
            {selectedNode && (
              <View style={styles.detailsPanel}>
                <View style={[styles.detailsDot, { backgroundColor: COLORS.nodes[selectedNode.type as keyof typeof COLORS.nodes] || COLORS.nodes.category }]} />
                <View>
                  <Text style={styles.detailsTitle}>{selectedNode.label}</Text>
                  <Text style={styles.detailsType}>{selectedNode.type.toUpperCase()}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>Tap dots to reveal sub-nodes</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardGradient: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', flex: 1 },
  badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.text.secondary, fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 },
  statText: { color: COLORS.text.secondary, fontSize: 13, fontWeight: '500' },
  graphContainer: { flex: 1, backgroundColor: COLORS.bg },
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalBack: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  modalBackText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  detailsPanel: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(17,17,17,0.95)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 16 },
  detailsDot: { width: 16, height: 16, borderRadius: 8, shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  detailsTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  detailsType: { fontSize: 12, color: COLORS.text.secondary, letterSpacing: 1, fontWeight: '600' },
  hintBadge: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hintText: { color: COLORS.text.secondary, fontSize: 12, fontWeight: '600' }
});

export default HealthGraphCard;