// src/components/about/PatientMemoryGraph.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Volume2, 
  Database,
  CheckCircle2,
  FileText,
  Workflow,
  Zap
} from 'lucide-react';
import Card from '../ui/Card';
import {
  NodeItem,
  LinkItem,
  PATIENT_NODES,
  PATIENT_LINKS,
  PATIENT_STEPS,
  getNodeColor,
  getLinkColor
} from './healthGraphData';

export const PatientMemoryGraph: React.FC = () => {
  const [buildStepByStep, setBuildStepByStep] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    setHoveredNodeId(null);
    setSelectedNodeId(null);
    setCurrentStep(0);
  }, [buildStepByStep]);

  // Smoother animation loop for graph drifting
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();
    
    const tick = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      setTime(prev => prev + deltaTime * 0.8); // Adjusted speed for elegance
      lastTime = currentTime;
      animFrame = requestAnimationFrame(tick);
    };
    
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const nextStep = () => {
    if (currentStep < PATIENT_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  const getPatientStepForNode = (nodeId: string) => {
    if (['Indresh', 'cat_facts', 'fac_age', 'fac_smoker', 'cat_surgeries', 'sur_appendectomy', 'cat_medical_history', 'his_fracture'].includes(nodeId)) return 1;
    if (['cat_habits', 'hab_late', 'hab_screen', 'cat_allergies', 'alg_dust', 'alg_pollen'].includes(nodeId)) return 2;
    if (['cat_diseases', 'dis_t2d', 'dis_htn'].includes(nodeId)) return 3;
    if (['cat_symptoms', 'sym_fever', 'sym_headache', 'sym_fatigue'].includes(nodeId)) return 4;
    return 1;
  };

  const activeNodes = buildStepByStep
    ? PATIENT_NODES.filter(n => getPatientStepForNode(n.id) <= currentStep)
    : PATIENT_NODES;

  const activeLinks = buildStepByStep
    ? PATIENT_LINKS.filter(l => getPatientStepForNode(l.sourceId) <= currentStep && getPatientStepForNode(l.targetId) <= currentStep)
    : PATIENT_LINKS;

  // Fluid drifting math
  const getDriftedPosition = (node: NodeItem) => {
    const strength = node.id === 'Indresh' ? 0.5 : 3.0; // Central node drifts less
    const driftX = Math.sin(time + node.id.charCodeAt(0)) * strength;
    const driftY = Math.cos(time + (node.id.charCodeAt(node.id.length - 1) || 0)) * strength;
    return {
      x: node.x + driftX,
      y: node.y + driftY
    };
  };

  const activeNodeFocusId = hoveredNodeId || selectedNodeId;
  const neighboringNodeIds = React.useMemo(() => {
    if (!activeNodeFocusId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeFocusId]);
    activeLinks.forEach(link => {
      if (link.sourceId === activeNodeFocusId) neighbors.add(link.targetId);
      if (link.targetId === activeNodeFocusId) neighbors.add(link.sourceId);
    });
    return neighbors;
  }, [activeNodeFocusId, activeLinks]);

  const activeNodeDetails = activeNodes.find(n => n.id === activeNodeFocusId);

  const getNodeRadius = (node: NodeItem, isHovered: boolean) => {
    const scaleFactor = isHovered ? 1.3 : 1.0;
    if (node.type === 'patient') return 38 * scaleFactor;
    if (node.type === 'category') return 22 * scaleFactor;
    return 14 * scaleFactor;
  };

  return (
    <div style={{ width: '100%', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ textAlign: 'left', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            {buildStepByStep ? 'Step-by-Step Profile Ingestion' : 'Unified Patient Context Graph'}
          </h3>
          <p style={{ fontSize: '15px', color: '#A1A1AA', margin: 0, lineHeight: 1.6 }}>
            {buildStepByStep 
              ? 'Watch how the multi-agent mesh extracts demographics, habits, conditions, and symptoms step-by-step.'
              : 'Interactive database schema illustrating the patient history, demographics, surgeries, habits, and symptoms.'
            }
          </p>
        </div>

        <div style={{ display: 'inline-flex', padding: '6px', borderRadius: '99px', backgroundColor: '#09090B', border: '1px solid #27272A', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <button
            onClick={() => setBuildStepByStep(false)}
            style={{
              padding: '8px 20px',
              borderRadius: '99px',
              border: 'none',
              backgroundColor: !buildStepByStep ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: !buildStepByStep ? '#00E5FF' : '#71717A',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: !buildStepByStep ? '0 0 12px rgba(0, 229, 255, 0.2)' : 'none'
            }}
          >
            🌐 Complete Schema
          </button>
          <button
            onClick={() => {
              setBuildStepByStep(true);
              setCurrentStep(1);
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '99px',
              border: 'none',
              backgroundColor: buildStepByStep ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: buildStepByStep ? '#00E5FF' : '#71717A',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: buildStepByStep ? '0 0 12px rgba(0, 229, 255, 0.2)' : 'none'
            }}
          >
            🛠️ Step-by-Step Builder
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px', alignItems: 'stretch' }} className="pipeline-grid">
        
        {/* Left Card: Pure Black Canvas with Teal Glow */}
        <Card style={{ 
          padding: '24px', 
          backgroundColor: '#000000', 
          border: '1px solid rgba(0, 229, 255, 0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          overflow: 'hidden', 
          minHeight: '640px', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px -10px rgba(0, 229, 255, 0.08), inset 0 0 40px rgba(0, 229, 255, 0.03)' 
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '16px', zIndex: 10, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={18} style={{ color: '#00E5FF' }} />
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#E4E4E7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {buildStepByStep ? 'Step-by-Step Graph Build' : 'Patient Schema DB'}
              </span>
            </div>
            {buildStepByStep && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: PATIENT_STEPS.length + 1 }).map((_, i) => (
                  <div key={i} style={{ width: '20px', height: '4px', borderRadius: '2px', backgroundColor: i <= currentStep ? '#00E5FF' : '#27272A', transition: 'all 0.4s ease', boxShadow: i <= currentStep ? '0 0 8px rgba(0,229,255,0.6)' : 'none' }} />
                ))}
              </div>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div style={{ flex: 1, position: 'relative', minHeight: '500px', background: '#000000', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Subtle Dotted Grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0, 229, 255, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }} />

            <svg width="100%" height="100%" viewBox="0 0 800 650" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255,255,255,0.2)" />
                </marker>
                <marker id="arrow-high" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00E5FF" />
                </marker>
                
                {/* Glow Filter */}
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Links Layer */}
              <g>
                {activeLinks.map((link) => {
                  const sNode = activeNodes.find(n => n.id === link.sourceId);
                  const tNode = activeNodes.find(n => n.id === link.targetId);
                  if (!sNode || !tNode) return null;

                  const sourcePos = getDriftedPosition(sNode);
                  const targetPos = getDriftedPosition(tNode);

                  const isHovered = activeNodeFocusId && (link.sourceId === activeNodeFocusId || link.targetId === activeNodeFocusId);
                  const dim = activeNodeFocusId && !isHovered;

                  const dx = targetPos.x - sourcePos.x;
                  const dy = targetPos.y - sourcePos.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const rTarget = getNodeRadius(tNode, activeNodeFocusId === tNode.id);
                  const x1 = sourcePos.x;
                  const y1 = sourcePos.y;
                  const x2 = targetPos.x - (dx / len) * (rTarget + 10);
                  const y2 = targetPos.y - (dy / len) * (rTarget + 10);

                  const linkColor = getLinkColor(link, PATIENT_NODES);
                  
                  return (
                    <g key={link.id}>
                      <motion.line
                        x1={x1} y1={y1} x2={x1} y2={y1}
                        initial={{ x2: x1, y2: y1 }}
                        animate={{
                          x1: x1, y1: y1,
                          x2: x2, y2: y2,
                          stroke: isHovered ? '#00E5FF' : linkColor,
                          strokeWidth: isHovered ? 3 : 1.5,
                          opacity: dim ? 0.1 : (isHovered ? 1.0 : 0.4),
                          // Flowing data animation when hovered
                          strokeDashoffset: isHovered ? [0, -20] : 0
                        }}
                        strokeDasharray={isHovered ? "8, 6" : "none"}
                        transition={{ 
                          type: 'spring', stiffness: 70, damping: 20,
                          strokeDashoffset: { repeat: Infinity, duration: 0.6, ease: "linear" }
                        }}
                        style={{ filter: isHovered ? 'url(#neonGlow)' : 'none' }}
                        markerEnd={`url(#${isHovered ? 'arrow-high' : 'arrow'})`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Nodes Layer */}
              <g>
                {activeNodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isSelected = selectedNodeId === node.id;
                  const isNeighbor = activeNodeFocusId && neighboringNodeIds.has(node.id);
                  const dim = activeNodeFocusId && !isNeighbor;
                  
                  const pos = getDriftedPosition(node);
                  const color = getNodeColor(node.type);
                  const radius = getNodeRadius(node, isHovered);
                  
                  // Use specific yellow for pinned states
                  const activeColor = isSelected ? '#FFD700' : color;

                  return (
                    <g 
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    >
                      {/* Pulse Glow for Central Patient Node */}
                      {node.type === 'patient' && !dim && (
                        <motion.circle
                          cx={pos.x} cy={pos.y}
                          r={radius}
                          fill="transparent"
                          stroke="#00E5FF"
                          strokeWidth="2"
                          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          style={{ pointerEvents: 'none' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ 
                          cx: pos.x, 
                          cy: pos.y, 
                          r: radius, 
                          fill: isSelected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(5, 5, 10, 0.8)', 
                          stroke: activeColor, 
                          strokeWidth: isHovered || isSelected ? 3 : 2, 
                          opacity: dim ? 0.15 : 1 
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        style={{ filter: isHovered || isSelected ? 'url(#neonGlow)' : 'none' }}
                      />

                      {/* Node Inner Icon / Label */}
                      {node.type === 'patient' && (
                        <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill={activeColor} fontSize="22px" fontWeight="bold" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.2 : 1 }}>👤</text>
                      )}

                      {node.type === 'category' && (
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={activeColor} fontSize="12px" fontWeight="800" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.2 : 1 }}>{node.label.charAt(0)}</text>
                      )}

                      {/* Node Text Label below circle */}
                      <motion.text
                        x={0} y={0} textAnchor="middle"
                        fill={isSelected ? '#FFD700' : (isHovered ? '#FFFFFF' : '#A1A1AA')}
                        fontSize={isHovered ? "11px" : "10px"} 
                        fontWeight={isHovered || isSelected ? '700' : '500'}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          x: pos.x, 
                          y: pos.y + radius + 18, 
                          opacity: dim ? 0.1 : 1 
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Glassmorphism Hover overlay */}
            <AnimatePresence>
              {activeNodeDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ 
                    position: 'absolute', bottom: '16px', left: '16px', right: '16px', 
                    padding: '16px', borderRadius: '12px', 
                    backgroundColor: 'rgba(5, 5, 10, 0.6)', 
                    backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)', // Safari support
                    border: selectedNodeId === activeNodeDetails.id ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(0, 229, 255, 0.2)', 
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)', 
                    pointerEvents: 'none', zIndex: 10 
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: selectedNodeId === activeNodeDetails.id ? '#FFD700' : getNodeColor(activeNodeDetails.type), boxShadow: `0 0 10px ${selectedNodeId === activeNodeDetails.id ? '#FFD700' : getNodeColor(activeNodeDetails.type)}` }} />
                      <strong style={{ fontSize: '14px', color: '#FFFFFF', textTransform: 'capitalize', letterSpacing: '0.5px' }}>
                        {activeNodeDetails.type}: {activeNodeDetails.label}
                      </strong>
                    </div>
                    {selectedNodeId === activeNodeDetails.id && (
                      <span style={{ fontSize: '10px', color: '#000000', backgroundColor: '#FFD700', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, letterSpacing: '0.5px' }}>PINNED</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#D4D4D8', margin: 0, lineHeight: 1.5 }}>{activeNodeDetails.details}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 500 }}>💡 Hover to filter connections | Click node to PIN details.</span>
            {buildStepByStep && currentStep > 0 && (
              <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #27272A', backgroundColor: 'transparent', color: '#E4E4E7', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                <RotateCcw size={14} /> Reset Schema
              </button>
            )}
          </div>
        </Card>

        {/* Right Card: Dynamic Explanations (Glassmorphism & Clean Typography) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AnimatePresence mode="wait">
            {!buildStepByStep ? (
              <motion.div
                key={activeNodeFocusId ? `patient-focused-${activeNodeFocusId}` : "patient-explanation"}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                {activeNodeDetails ? (
                  <Card style={{ padding: '32px', backgroundColor: '#09090B', border: selectedNodeId === activeNodeDetails.id ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(0, 229, 255, 0.2)', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: selectedNodeId === activeNodeDetails.id ? '#FFD700' : '#00E5FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Selected {activeNodeDetails.type}
                        </span>
                        {selectedNodeId === activeNodeDetails.id && (
                          <Zap size={16} style={{ color: '#FFD700', fill: '#FFD700' }} />
                        )}
                      </div>
                      <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                        {activeNodeDetails.label}
                      </h3>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#71717A', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Context</h4>
                      <p style={{ fontSize: '15px', color: '#D4D4D8', lineHeight: 1.7, margin: 0 }}>{activeNodeDetails.details}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', width: '100%' }} />

                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#71717A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Connected Edges ({Math.max(0, neighboringNodeIds.size - 1)})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {Array.from(neighboringNodeIds).filter(nid => nid !== activeNodeFocusId).map(nid => {
                          const neighborNode = activeNodes.find(n => n.id === nid);
                          if (!neighborNode) return null;
                          return (
                            <button
                              key={nid}
                              onClick={() => setSelectedNodeId(neighborNode.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#E4E4E7', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}
                            >
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getNodeColor(neighborNode.type) }} />
                              {neighborNode.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#000000', border: '1px solid #27272A' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#71717A', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>CYPHER QUERY MATCH</span>
                        <code style={{ fontSize: '12px', color: selectedNodeId === activeNodeDetails.id ? '#FFD700' : '#00E5FF', fontFamily: '"Fira Code", monospace' }}>
                          {`MATCH (p:Patient {id: 'Patient'})-[:HAS_${activeNodeDetails.type.toUpperCase()}]->(n {id: '${activeNodeDetails.id}'}) RETURN n`}
                        </code>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card style={{ padding: '32px', backgroundColor: '#09090B', border: '1px solid #27272A', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', borderRadius: '24px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '1px' }}>System Architecture</span>
                      <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: '8px 0 0 0', letterSpacing: '-0.5px' }}>Graph-Structured Memory</h3>
                    </div>
                    <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.7, margin: 0 }}>
                      Instead of standard relational tables, patient data is stored as a central profile node linked dynamically to clinical dimensions. This eliminates join overhead and allows AI agents to instantly traverse complex relationships.
                    </p>
                    
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', width: '100%' }} />
                    
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#E4E4E7', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mapped Domains</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#A1A1AA', display: 'flex', gap: '12px' }}><span style={{ fontSize: '18px' }}>👤</span> <span><strong>Demographics</strong>: Base patient background and intrinsic traits.</span></div>
                        <div style={{ fontSize: '14px', color: '#A1A1AA', display: 'flex', gap: '12px' }}><span style={{ fontSize: '18px' }}>🧬</span> <span><strong>Conditions</strong>: Active diseases cross-referenced with medical databases.</span></div>
                        <div style={{ fontSize: '14px', color: '#A1A1AA', display: 'flex', gap: '12px' }}><span style={{ fontSize: '18px' }}>🏃</span> <span><strong>Habits</strong>: Behavioral vectors that aggravate underlying risks.</span></div>
                        <div style={{ fontSize: '14px', color: '#A1A1AA', display: 'flex', gap: '12px' }}><span style={{ fontSize: '18px' }}>🍂</span> <span><strong>Allergies</strong>: Critical blockers for pharmaceutical prescriptions.</span></div>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="patient-step-explanation"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <Card style={{ padding: '32px', backgroundColor: '#09090B', border: '1px solid rgba(0, 229, 255, 0.2)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 229, 255, 0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Workflow size={16} style={{ color: '#00E5FF' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '1px' }}>Pipeline Stage</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#71717A', backgroundColor: '#18181B', padding: '4px 12px', borderRadius: '99px' }}>
                        {Math.min(currentStep + 1, PATIENT_STEPS.length)} / {PATIENT_STEPS.length}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      {currentStep === 0 ? (
                        <motion.div key="step-intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ minHeight: '180px' }}>
                          <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.5px' }}>Initialize Ingestion</h3>
                          <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '20px' }}>Simulate the multi-agent mesh extracting data from raw input and structuring it into graph nodes.</p>
                          <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: '#000000', border: '1px solid #27272A' }}>
                            <Volume2 size={20} style={{ color: '#00E5FF', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#D4D4D8', margin: 0, lineHeight: 1.5 }}>"My name is Patient, 20yo Male. Had an appendectomy, non-smoker..."</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key={`step-${currentStep}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ minHeight: '180px' }}>
                          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>{PATIENT_STEPS[currentStep - 1].title}</h3>
                          <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>{PATIENT_STEPS[currentStep - 1].description}</p>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#71717A', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Executing Agent</span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#00E5FF' }}>🤖 {PATIENT_STEPS[currentStep - 1].agent}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', marginTop: '24px' }}>
                    {currentStep > 0 && (
                      <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #27272A', backgroundColor: 'transparent', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}>
                        <ChevronLeft size={18} /> Back
                      </button>
                    )}
                    <button
                      onClick={currentStep < PATIENT_STEPS.length ? nextStep : reset}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 2, padding: '14px', borderRadius: '12px', border: 'none', 
                        backgroundColor: currentStep === PATIENT_STEPS.length ? '#10B981' : '#00E5FF', 
                        color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s',
                        boxShadow: currentStep === PATIENT_STEPS.length ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 8px 20px rgba(0, 229, 255, 0.3)'
                      }}
                    >
                      {currentStep === 0 ? (<><Play size={18} fill="currentColor" /> Stream Pipeline</>) : currentStep === PATIENT_STEPS.length ? (<><CheckCircle2 size={18} /> Finish & Reset</>) : (<>Next Stage <ChevronRight size={18} /></>)}
                    </button>
                  </div>
                </Card>

                {/* Console Terminal */}
                <Card style={{ padding: '20px 24px', backgroundColor: '#000000', border: '1px solid #27272A', borderRadius: '16px', fontFamily: '"Fira Code", monospace', color: '#00E5FF', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #18181B', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} style={{ color: '#71717A' }} />
                      <span style={{ fontWeight: 800, color: '#71717A', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Execution Logs</span>
                    </div>
                    <span style={{ color: '#3F3F46', fontSize: '10px' }}>/bin/bash</span>
                  </div>
                  <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, minHeight: '100px' }}>
                    <code>{currentStep === 0 ? <span style={{ color: '#52525B' }}>$ Waiting for orchestrator initialization...</span> : PATIENT_STEPS[currentStep - 1].code}</code>
                  </pre>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 1024px) {
          .pipeline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientMemoryGraph;