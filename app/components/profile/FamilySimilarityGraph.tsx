// app/components/profile/FamilySimilarityGraph.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, G, Path, Text as SvgText, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

// MODERN 60FPS GESTURE IMPORTS
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial,
} from 'd3-force';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// OBSIDIAN DARK THEME
const COLORS = {
  bg: '#0F0F13',
  card: '#181822',
  border: '#2C2C3A',
  primary: '#1A1A1A',
  text: { primary: '#F8FAFC', secondary: '#94A3B8', light: '#475569' },
  nodes: {
    self: '#38BDF8',       
    family: '#A78BFA',     
    symptom: '#FBBF24',    
    condition: '#F87171',  
    covid: '#EC4899',
    vaccine: '#10B981',
  },
  risk: { low: '#10B981', moderate: '#F59E0B', high: '#EF4444' },
};

// --- DATASET WITH COVID SYMPTOMS & QR DATA ---
const QR_FAMILY_CODE = 'SWASTHYA_FAMILY:123456';

const GRAPH_DATA = {
  nodes: [
    // People Nodes
    { id: 'indresh', label: 'Indresh', type: 'Person', role: 'Self', radius: 28, color: COLORS.nodes.self, data: { age: 20, phone: '+91 9324474812', risk: 'Moderate' } },
    { id: 'divya', label: 'Divya', type: 'Person', role: 'Partner', radius: 22, color: COLORS.nodes.family, data: { age: 20, phone: '+91 7559302315', risk: 'Low' } },
    { id: 'monish', label: 'Monish', type: 'Person', role: 'Grandfather', radius: 22, color: COLORS.nodes.family, data: { age: 65, phone: '+91 9372962545', risk: 'Low' } },
    { id: 'ankita', label: 'Ankita', type: 'Person', role: 'Child', radius: 22, color: COLORS.nodes.family, data: { age: 10, phone: '+91 9970206614', risk: 'Low' } },
    
    // Existing Symptoms
    { id: 'symp_anxiety', label: 'Anxiety', type: 'Symptom', radius: 14, color: COLORS.nodes.symptom, data: { severity: 'Moderate', connected: ['Indresh', 'Divya'] } },
    { id: 'symp_migraine', label: 'Migraine', type: 'Symptom', radius: 14, color: COLORS.nodes.symptom, data: { severity: 'High', connected: ['Indresh'] } },
    { id: 'symp_fatigue', label: 'Fatigue', type: 'Symptom', radius: 14, color: COLORS.nodes.symptom, data: { severity: 'Mild', connected: ['Monish', 'Indresh'] } },
    { id: 'symp_cough', label: 'Dry Cough', type: 'Symptom', radius: 14, color: COLORS.nodes.symptom, data: { severity: 'Moderate', connected: ['Monish', 'Ankita'] } },
    { id: 'cond_hyper', label: 'Hypertension', type: 'Condition', radius: 14, color: COLORS.nodes.condition, data: { severity: 'Chronic', connected: ['Monish'] } },
    
    // COVID Related Symptoms & Conditions
    { id: 'covid_fever', label: 'Fever', type: 'Covid', radius: 14, color: COLORS.nodes.covid, data: { severity: 'Moderate', connected: ['Indresh', 'Divya', 'Monish'] } },
    { id: 'covid_taste', label: 'Loss of Taste', type: 'Covid', radius: 14, color: COLORS.nodes.covid, data: { severity: 'Mild', connected: ['Divya'] } },
    { id: 'covid_smell', label: 'Loss of Smell', type: 'Covid', radius: 14, color: COLORS.nodes.covid, data: { severity: 'Mild', connected: ['Divya'] } },
    { id: 'covid_breath', label: 'Shortness of Breath', type: 'Covid', radius: 14, color: COLORS.nodes.covid, data: { severity: 'Severe', connected: ['Monish'] } },
    { id: 'covid_pneumonia', label: 'Pneumonia', type: 'Covid', radius: 14, color: COLORS.nodes.covid, data: { severity: 'Severe', connected: ['Monish'] } },
    
    // Vaccine Nodes
    { id: 'vaccine_covaxin', label: 'Covaxin', type: 'Vaccine', radius: 12, color: COLORS.nodes.vaccine, data: { dose: '2 doses', connected: ['Indresh', 'Divya'] } },
    { id: 'vaccine_covishield', label: 'Covishield', type: 'Vaccine', radius: 12, color: COLORS.nodes.vaccine, data: { dose: '2 doses + Booster', connected: ['Monish'] } },
  ],
  edges: [
    // Relationships
    { source: 'indresh', target: 'divya', weight: 3, label: 'PARTNER' },
    { source: 'indresh', target: 'monish', weight: 3, label: 'GRANDFATHER' },
    { source: 'indresh', target: 'ankita', weight: 3, label: 'CHILD' },
    
    // Symptom Reports
    { source: 'indresh', target: 'symp_anxiety', type: 'cross', label: 'REPORTS' },
    { source: 'indresh', target: 'symp_migraine', type: 'cross', label: 'REPORTS' },
    { source: 'indresh', target: 'symp_fatigue', type: 'cross', label: 'REPORTS' },
    { source: 'divya', target: 'symp_anxiety', type: 'cross', label: 'REPORTS' },
    { source: 'monish', target: 'symp_fatigue', type: 'cross', label: 'REPORTS' },
    { source: 'monish', target: 'symp_cough', type: 'cross', label: 'REPORTS' },
    { source: 'ankita', target: 'symp_cough', type: 'cross', label: 'REPORTS' },
    { source: 'monish', target: 'cond_hyper', type: 'cross', label: 'DIAGNOSED' },
    
    // COVID Symptom Links - Showing Family Similarity
    { source: 'indresh', target: 'covid_fever', type: 'cross', label: 'HAS' },
    { source: 'divya', target: 'covid_fever', type: 'cross', label: 'HAS' },
    { source: 'divya', target: 'covid_taste', type: 'cross', label: 'HAS' },
    { source: 'divya', target: 'covid_smell', type: 'cross', label: 'HAS' },
    { source: 'monish', target: 'covid_fever', type: 'cross', label: 'HAS' },
    { source: 'monish', target: 'covid_breath', type: 'cross', label: 'HAS' },
    { source: 'monish', target: 'covid_pneumonia', type: 'cross', label: 'HAS' },
    
    // COVID Symptom Similarity Links
    { source: 'covid_fever', target: 'covid_taste', type: 'cross', label: 'RELATED' },
    { source: 'covid_taste', target: 'covid_smell', type: 'cross', label: 'RELATED' },
    { source: 'covid_breath', target: 'covid_pneumonia', type: 'cross', label: 'COMPLICATION' },
    
    // Vaccine Links
    { source: 'indresh', target: 'vaccine_covaxin', type: 'cross', label: 'VACCINATED' },
    { source: 'divya', target: 'vaccine_covaxin', type: 'cross', label: 'VACCINATED' },
    { source: 'monish', target: 'vaccine_covishield', type: 'cross', label: 'VACCINATED' },
  ],
};

const getSafeId = (nodeObjOrStr: any) => typeof nodeObjOrStr === 'string' ? nodeObjOrStr : nodeObjOrStr.id;

// --- D3 OBSIDIAN PHYSICS ENGINE ---
const useForceSimulation = (data: any, width: number, height: number) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    requestAnimationFrame(() => {
      const simNodes = data.nodes.map((d: any) => ({ ...d }));
      const simEdges = data.edges.map((d: any) => ({ ...d }));

      const root = simNodes.find((n: any) => n.id === 'indresh');
      if (root) {
        root.fx = width / 2;
        root.fy = height / 2;
      }

      const simulation = forceSimulation(simNodes)
        .force('link', forceLink(simEdges)
          .id((d: any) => d.id)
          .distance((link: any) => link.weight === 3 ? 160 : (link.type === 'cross' ? 240 : 100))
          .strength((link: any) => link.type === 'cross' ? 0.05 : 0.6)
        )
        .force('charge', forceManyBody().strength(-500))
        .force('center', forceCenter(width / 2, height / 2))
        .force('collide', forceCollide().radius((d: any) => d.radius + 20).iterations(3))
        .alphaDecay(0.04)
        .velocityDecay(0.5); 
        
      let frameId: number | null = null;
      let tickCount = 0;
      const maxTicks = 120;

      simulation.on('tick', () => {
        tickCount++;
        if (!frameId && tickCount <= maxTicks) {
          frameId = requestAnimationFrame(() => {
            setNodes([...simNodes]);
            setEdges([...simEdges]);
            frameId = null;
            if (tickCount >= maxTicks) setIsLoading(false);
          });
        }
      });

      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        if (frameId) cancelAnimationFrame(frameId);
        setNodes([...simNodes]);
        setEdges([...simEdges]);
      }, 3500);

      simulation.alpha(1).restart();
      
      return () => {
        simulation.stop();
        if (frameId) cancelAnimationFrame(frameId);
        clearTimeout(timeoutId);
      };
    });
  }, [data, width, height]);

  return { nodes, edges, isLoading };
};

// --- MODERN GESTURE GRAPH VIEW ---
const GraphView = ({ data, onNodeSelect }: { data: any, onNodeSelect: (node: any) => void }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [graphReady, setGraphReady] = useState(false);
  
  const canvasSize = Math.max(SCREEN_WIDTH * 2.5, 1200);
  const { nodes, edges, isLoading } = useForceSimulation(data, canvasSize, canvasSize);

  const scale = useSharedValue(0.8);
  const savedScale = useSharedValue(0.8);
  const translateX = useSharedValue(-(canvasSize - SCREEN_WIDTH) / 2);
  const translateY = useSharedValue(-(canvasSize - SCREEN_HEIGHT) / 2);
  const savedTranslateX = useSharedValue(-(canvasSize - SCREEN_WIDTH) / 2);
  const savedTranslateY = useSharedValue(-(canvasSize - SCREEN_HEIGHT) / 2);

  useEffect(() => {
    if (!isLoading && nodes.length > 0) setGraphReady(true);
  }, [isLoading, nodes]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.3, Math.min(savedScale.value * e.scale, 3.0));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minDistance(15)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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

  if (isLoading || !graphReady) {
    return (
      <View style={[styles.graphContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.nodes.family} />
        <Text style={styles.loadingText}>Building Network...</Text>
        <Text style={styles.loadingSubText}>Calculating spatial vectors</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.graphContainer}>
        <Animated.View style={animatedStyle}>
          <Svg width={canvasSize} height={canvasSize}>
            
            <Defs>
              {Object.entries(COLORS.nodes).map(([key, color]) => (
                <RadialGradient key={`glow-${key}`} id={`glow-${key}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
                  <Stop offset="100%" stopColor={color} stopOpacity="0" />
                </RadialGradient>
              ))}
            </Defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              if (!edge.source.x || !edge.target.x) return null;
              
              const sourceId = getSafeId(edge.source);
              const targetId = getSafeId(edge.target);
              const isCrossLink = edge.type === 'cross';
              const isActive = selectedId && (sourceId === selectedId || targetId === selectedId);
              
              const opacity = !selectedId ? (isCrossLink ? 0.2 : 0.6) : (isActive ? 0.9 : 0.05);
              
              const d = isCrossLink 
                ? `M ${edge.source.x} ${edge.source.y} Q ${(edge.source.x + edge.target.x)/2 + 60} ${(edge.source.y + edge.target.y)/2 - 60} ${edge.target.x} ${edge.target.y}`
                : `M ${edge.source.x} ${edge.source.y} L ${edge.target.x} ${edge.target.y}`;

              return (
                <Path
                  key={`edge-${i}`}
                  d={d}
                  stroke={isActive ? '#FFFFFF' : (isCrossLink ? COLORS.text.light : COLORS.border)}
                  strokeWidth={isActive ? 2 : (isCrossLink ? 1 : 2)}
                  strokeDasharray={isCrossLink ? "4,6" : "none"}
                  fill="none"
                  opacity={opacity}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              if (!node.x) return null;
              
              const isSelected = selectedId === node.id;
              const opacity = isHighlighted(node.id) ? 1 : 0.15;
              const isPerson = node.type === 'Person';
              const isCovid = node.type === 'Covid';
              const isVaccine = node.type === 'Vaccine';
              const color = node.color;
              
              return (
                <G key={`node-${node.id}`} onPress={() => handleNodePress(node)}>
                  {/* Outer Glow */}
                  <Circle cx={node.x} cy={node.y} r={node.radius * 2.5} fill={`url(#glow-${Object.keys(COLORS.nodes).find(k => COLORS.nodes[k as keyof typeof COLORS.nodes] === color)})`} opacity={opacity * 0.8} />
                  
                  {/* Solid Obsidian Node */}
                  <Circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={node.radius} 
                    fill={COLORS.card} 
                    stroke={color} 
                    strokeWidth={isSelected ? 3 : 1.5} 
                    opacity={opacity}
                  />
                  
                  <Circle cx={node.x} cy={node.y} r={node.radius - 2} fill={color} opacity={opacity * 0.2} />

                  {/* Node Content */}
                  {isPerson ? (
                    <SvgText x={node.x} y={node.y + 5} textAnchor="middle" fontSize={node.radius * 0.5} fontWeight="800" fill="#FFFFFF" opacity={opacity}>
                      {node.label.charAt(0)}
                    </SvgText>
                  ) : isCovid ? (
                    <SvgText x={node.x} y={node.y + 5} textAnchor="middle" fontSize={12} fontWeight="800" fill={color} opacity={opacity}>
                      🦠
                    </SvgText>
                  ) : isVaccine ? (
                    <SvgText x={node.x} y={node.y + 5} textAnchor="middle" fontSize={12} fontWeight="800" fill={color} opacity={opacity}>
                      💉
                    </SvgText>
                  ) : null}

                  {/* Node Label */}
                  <SvgText
                    x={node.x}
                    y={node.y + node.radius + 18}
                    textAnchor="middle"
                    fontSize={isPerson ? 14 : 11}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected || isPerson ? '#FFFFFF' : COLORS.text.secondary}
                    opacity={opacity}
                  >
                    {node.label}
                  </SvgText>
                  
                  {/* Subtitle */}
                  {isPerson && (
                    <SvgText x={node.x} y={node.y + node.radius + 32} textAnchor="middle" fontSize="10" fill={COLORS.text.light} opacity={opacity}>
                      {node.role.toUpperCase()}
                    </SvgText>
                  )}
                  {isCovid && (
                    <SvgText x={node.x} y={node.y + node.radius + 30} textAnchor="middle" fontSize="9" fill={COLORS.text.light} opacity={opacity * 0.7}>
                      COVID
                    </SvgText>
                  )}
                  {isVaccine && (
                    <SvgText x={node.x} y={node.y + node.radius + 30} textAnchor="middle" fontSize="9" fill={COLORS.text.light} opacity={opacity * 0.7}>
                      Vaccine
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

// --- QR CODE SECTION ---
const QRCodeSection = () => {
  return (
    <View style={styles.qrSection}>
      <View style={styles.qrContainer}>
        <QRCode
          value={QR_FAMILY_CODE}
          size={100}
          color="#FFFFFF"
          backgroundColor="#0F0F13"
        />
      </View>
      <Text style={styles.qrLabel}>Family Join Code</Text>
      <Text style={styles.qrCode}>SWASTHYA_FAMILY:123456</Text>
    </View>
  );
};

// --- MAIN COMPONENT ---
export const FamilySimilarityGraph = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const totalMembers = GRAPH_DATA.nodes.filter(n => n.type === 'Person').length;
  const totalSymptoms = GRAPH_DATA.nodes.filter(n => n.type === 'Symptom' || n.type === 'Covid').length;

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
            <Text style={styles.riskLabel}>AI Risk Assessment</Text>
            <View style={[styles.riskBadge, { backgroundColor: `${riskColor}15` }]}>
              <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
              <Text style={[styles.riskText, { color: riskColor }]}>{selectedNode.data.risk} Risk</Text>
            </View>
          </View>
        </View>
      );
    }

    if (selectedNode.type === 'Covid') {
      return (
        <View style={styles.detailsBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Severity</Text>
              <Text style={[styles.infoValue, { color: selectedNode.color }]}>{selectedNode.data.severity}</Text>
            </View>
          </View>
          <Text style={styles.infoLabel}>Observed In</Text>
          <View style={styles.tagContainer}>
            {selectedNode.data.connected.map((name: string, i: number) => (
              <View key={i} style={styles.personTag}>
                <Text style={styles.personTagText}>{name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.covidWarning}>
            <Ionicons name="warning" size={16} color="#EC4899" />
            <Text style={styles.covidWarningText}>COVID-19 Related Symptom</Text>
          </View>
        </View>
      );
    }

    if (selectedNode.type === 'Vaccine') {
      return (
        <View style={styles.detailsBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Doses</Text>
              <Text style={[styles.infoValue, { color: selectedNode.color }]}>{selectedNode.data.dose}</Text>
            </View>
          </View>
          <Text style={styles.infoLabel}>Vaccinated Family Members</Text>
          <View style={styles.tagContainer}>
            {selectedNode.data.connected.map((name: string, i: number) => (
              <View key={i} style={styles.personTag}>
                <Text style={styles.personTagText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.detailsBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Severity</Text>
            <Text style={[styles.infoValue, { color: selectedNode.color }]}>{selectedNode.data.severity}</Text>
          </View>
        </View>
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
    <>
      <TouchableOpacity style={styles.card} onPress={() => setShowModal(true)} activeOpacity={0.9}>
        <LinearGradient colors={['#181822', '#0F0F13']} style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="people" size={20} color={COLORS.nodes.family} />
            </View>
            <Text style={styles.cardTitle}>Family Health Matrix</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalMembers} Members</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              <Text style={{color: '#FFF'}}>{totalSymptoms}</Text> shared symptoms mapped ( Click to view )
            </Text>
            <Ionicons name="git-network" size={16} color={COLORS.nodes.self} />
          </View>

          {/* QR Code Section */}
          <QRCodeSection />

          {/* AI Insight Summary Block */}
          <View style={styles.aiInsightBox}>
            <View style={styles.aiInsightHeader}>
              <MaterialCommunityIcons name="robot-outline" size={16} color={COLORS.nodes.family} />
              <Text style={styles.aiInsightTitle}>AI Insight</Text>
              <View style={{flex: 1}} />
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>88% Match</Text>
              </View>
            </View>
            <Text style={styles.aiInsightText}>
              High similarity in <Text style={{color: '#FFF', fontWeight: '600'}}>respiratory symptoms</Text> and <Text style={{color: '#FFF', fontWeight: '600'}}>fatigue</Text> detected between you, Monish, and Ankita.
            </Text>
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
            <Text style={styles.modalTitle}>Family Similarity Graph</Text>
            <View style={{width: 60}} /> 
          </View>
          
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            <GraphView data={GRAPH_DATA} onNodeSelect={setSelectedNode} />
            
            {/* Top Confidence Banner */}
            <View style={styles.modalTopBanner}>
              <MaterialCommunityIcons name="shield-check" size={18} color={COLORS.risk.low} />
              <Text style={styles.bannerText}>AI Confidence Score: <Text style={{color: '#FFF'}}>88%</Text></Text>
            </View>

            {/* Dark Theme Details Panel */}
            {selectedNode && (
              <View style={styles.detailsPanel}>
                <View style={styles.panelHeader}>
                  <View style={[styles.detailsDot, { backgroundColor: selectedNode.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailsTitle}>{selectedNode.label}</Text>
                    <Text style={styles.detailsType}>{selectedNode.type.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedNode(null)}>
                    <Ionicons name="close-circle" size={26} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
                {renderNodeDetails()}
              </View>
            )}
            
            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>Pinch to zoom • Drag to pan</Text>
            </View>
          </GestureHandlerRootView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: { 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  cardGradient: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', flex: 1 },
  badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.text.secondary, fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statText: { color: COLORS.text.secondary, fontSize: 13, fontWeight: '500' },
  
  // QR Section
  qrSection: { 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrContainer: { 
    padding: 8, 
    backgroundColor: '#0F0F13', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrLabel: { 
    color: COLORS.text.secondary, 
    fontSize: 11, 
    fontWeight: '600', 
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrCode: { 
    color: COLORS.nodes.family, 
    fontSize: 12, 
    fontWeight: '700', 
    marginTop: 2,
  },
  
  aiInsightBox: { backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
  aiInsightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiInsightTitle: { color: COLORS.nodes.family, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  confidenceBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  confidenceText: { color: COLORS.risk.low, fontSize: 10, fontWeight: '700' },
  aiInsightText: { color: COLORS.text.secondary, fontSize: 13, lineHeight: 20 },
  graphContainer: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 20 },
  loadingSubText: { color: COLORS.text.secondary, fontSize: 13, marginTop: 8 },
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 10 },
  modalBack: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  modalBackText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalTopBanner: { position: 'absolute', top: 16, alignSelf: 'center', backgroundColor: 'rgba(17,17,17,0.8)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  bannerText: { color: COLORS.text.secondary, fontSize: 12, fontWeight: '600' },
  detailsPanel: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(17,17,17,0.95)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  panelHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  detailsDot: { width: 14, height: 14, borderRadius: 7, marginTop: 4, shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  detailsTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  detailsType: { fontSize: 12, color: COLORS.text.secondary, letterSpacing: 1, fontWeight: '600' },
  detailsBody: { paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  infoRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  infoBox: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  riskContainer: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  riskLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: { fontSize: 12, fontWeight: '700' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personTag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  personTagText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  covidWarning: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.2)' },
  covidWarningText: { color: '#EC4899', fontSize: 12, fontWeight: '600' },
  hintBadge: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hintText: { color: COLORS.text.secondary, fontSize: 12, fontWeight: '600' }
});

export default FamilySimilarityGraph;