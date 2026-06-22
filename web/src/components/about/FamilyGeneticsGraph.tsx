// src/components/about/FamilyGeneticsGraph.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Volume2, 
  Users,
  CheckCircle2,
  FileText,
  Workflow
} from 'lucide-react';
import Card from '../ui/Card';
import {
  NodeItem,
  LinkItem,
  FAMILY_NODES,
  FAMILY_LINKS,
  FAMILY_STEPS,
  getNodeColor,
  getLinkColor
} from './healthGraphData';

export const FamilyGeneticsGraph: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setTime(prev => prev + 0.025);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const nextStep = () => {
    if (currentStep < FAMILY_STEPS.length) {
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

  const activeNodes = FAMILY_NODES.filter(n => n.step === undefined || n.step <= currentStep);
  const activeLinks = FAMILY_LINKS.filter(l => l.step === undefined || l.step <= currentStep);

  const getDriftedPosition = (node: NodeItem) => {
    const strength = node.id === 'Indresh' ? 1.0 : 2.5;
    const driftY = Math.cos(time + (node.id.charCodeAt(1) || 0)) * strength;
    return {
      x: node.x,
      y: node.y + driftY // only vertical drift for family tree layout clean feeling
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
    const scaleFactor = isHovered ? 1.25 : 1.0;
    if (node.type === 'patient') return 36 * scaleFactor;
    if (node.type === 'category' || node.type === 'family') return 20 * scaleFactor;
    return 12 * scaleFactor;
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Step-by-Step Family Genetics Warning
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
          Track the genetics traversal query in real-time, mapping active family exposure vectors to wearable vital inputs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'stretch' }} className="pipeline-grid">
        {/* Left Card: Obsidian-style Canvas */}
        <Card style={{ padding: '24px', backgroundColor: '#09090b', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '620px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#f4f4f5', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Family Genetics Warning Map
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FAMILY_STEPS.length + 1 }).map((_, i) => (
                <div key={i} style={{ width: '18px', height: '5px', borderRadius: '2.5px', backgroundColor: i <= currentStep ? '#38bdf8' : '#27272a', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div style={{ flex: 1, position: 'relative', minHeight: '480px', background: '#09090b', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.8, pointerEvents: 'none' }} />

            <svg width="100%" height="100%" viewBox="0 0 800 650" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <marker id="f-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717a" />
                </marker>
                <marker id="f-arrow-high" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
                </marker>
              </defs>

              {/* Links */}
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
                  const x2 = targetPos.x - (dx / len) * (rTarget + 8);
                  const y2 = targetPos.y - (dy / len) * (rTarget + 8);

                  const linkColor = getLinkColor(link, FAMILY_NODES);
                  return (
                    <g key={link.id}>
                      <motion.line
                        x1={x1} y1={y1} x2={x1} y2={y1}
                        stroke={isHovered ? '#fbbf24' : linkColor}
                        strokeWidth={isHovered ? 3.5 : 2.5}
                        initial={{ x2: x1, y2: y1 }}
                        animate={{
                          x1: x1, y1: y1,
                          x2: x2, y2: y2,
                          stroke: isHovered ? '#fbbf24' : linkColor,
                          strokeWidth: isHovered ? 3.5 : 2.5,
                          opacity: dim ? 0.15 : (isHovered ? 1.0 : 0.6)
                        }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: isHovered ? `drop-shadow(0 0 4px ${linkColor})` : 'none' }}
                        markerEnd={`url(#${isHovered ? 'f-arrow-high' : 'f-arrow'})`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {activeNodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isNeighbor = activeNodeFocusId && neighboringNodeIds.has(node.id);
                  const dim = activeNodeFocusId && !isNeighbor;
                  
                  const pos = getDriftedPosition(node);
                  const color = getNodeColor(node.type);
                  const radius = getNodeRadius(node, isHovered);

                  return (
                    <g 
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                    >
                      {/* Glow halo */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius + 8, opacity: isHovered ? 0.25 : (isNeighbor ? 0.1 : 0.0) }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
                      />

                      {/* Main Node Circle */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        stroke={selectedNodeId === node.id ? '#fbbf24' : '#09090b'}
                        strokeWidth={selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5)}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius, fill: color, stroke: selectedNodeId === node.id ? '#fbbf24' : '#09090b', strokeWidth: selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5), opacity: dim ? 0.2 : 1 }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: isHovered || selectedNodeId === node.id ? `drop-shadow(0 0 8px ${color})` : 'none' }}
                      />

                      {node.type === 'patient' && (
                        <text x={pos.x} y={pos.y + 7} textAnchor="middle" fill="#ffffff" fontSize="20px" fontWeight="bold" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.2 : 1 }}>👤</text>
                      )}

                      {node.type === 'family' && (
                        <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="#ffffff" fontSize="15px" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.25 : 0.9 }}>👶</text>
                      )}

                      <motion.text
                        x={0} y={0} textAnchor="middle"
                        fill={isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196')}
                        fontSize="9px" fontWeight={isHovered ? '700' : '500'}
                        initial={{ x: 400, y: 325, opacity: 0 }}
                        animate={{ x: pos.x, y: pos.y + radius + 15, opacity: dim ? 0.15 : 1, fill: isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196') }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover details overlay */}
            <AnimatePresence>
              {activeNodeDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(24, 24, 27, 0.95)', backdropFilter: 'blur(10px)', border: `1px solid ${getNodeColor(activeNodeDetails.type)}`, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', pointerEvents: 'none', zIndex: 10 }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getNodeColor(activeNodeDetails.type) }} />
                      <strong style={{ fontSize: '13px', color: '#f4f4f5', textTransform: 'capitalize' }}>
                        {activeNodeDetails.type}: {activeNodeDetails.label}
                      </strong>
                    </div>
                    {selectedNodeId === activeNodeDetails.id && (
                      <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 800 }}>📌 PINNED</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#a1a1aa', margin: 0, lineHeight: 1.4 }}>{activeNodeDetails.details}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 500 }}>💡 Hover to filter | Click node to PIN details.</span>
            {currentStep > 0 && (
              <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#e4e4e7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <RotateCcw size={11} /> Reset Graph
              </button>
            )}
          </div>
        </Card>

        {/* Right Card: Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div
            key={`family-step-${currentStep}`}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Workflow size={14} style={{ color: '#fbbf24' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Genetics Exposure Pipeline</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Step {Math.min(currentStep + 1, FAMILY_STEPS.length)} of {FAMILY_STEPS.length}</span>
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 0 ? (
                    <motion.div key="f-step-intro" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Begin Exposure Evaluation</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>Family history and proximity transmission vectors are critical. Trigger the pipeline to check exposure warning alerts.</p>
                      <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <Volume2 size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0 }}>"I have dry cough, high fever, and my SpO2 is 95%..."</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={`f-step-${currentStep}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{FAMILY_STEPS[currentStep - 1].title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>{FAMILY_STEPS[currentStep - 1].description}</p>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Active Supervised Agent</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid #fbbf24' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>🤖 {FAMILY_STEPS[currentStep - 1].agent}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                {currentStep > 0 && (
                  <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                <button
                  onClick={currentStep < FAMILY_STEPS.length ? nextStep : reset}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: currentStep === FAMILY_STEPS.length ? '#10B981' : 'var(--text-primary)', color: currentStep === FAMILY_STEPS.length ? 'white' : 'var(--bg)', fontWeight: 800, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  {currentStep === 0 ? (<><Play size={16} fill="currentColor" /> Start Pipeline</>) : currentStep === FAMILY_STEPS.length ? (<><CheckCircle2 size={16} /> Finish & Reset</>) : (<>Next Step <ChevronRight size={16} /></>)}
                </button>
              </div>
            </Card>

            <Card style={{ padding: '18px 24px', backgroundColor: '#0A0A0C', border: '1px solid var(--border)', borderRadius: '16px', fontFamily: 'Courier New, monospace', color: '#E4E4E7', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} style={{ color: '#E4E4E7' }} />
                  <span style={{ fontWeight: 800, color: '#E4E4E7', fontSize: '10px', textTransform: 'uppercase' }}>Clinical Ingestion Stream</span>
                </div>
                <span style={{ color: '#52525b', fontSize: '9px' }}>stdout</span>
              </div>
              <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5, minHeight: '90px' }}>
                <code>{currentStep === 0 ? <span style={{ color: '#52525b' }}>// Run the pipeline to stream Cypher query results.</span> : FAMILY_STEPS[currentStep - 1].code}</code>
              </pre>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FamilyGeneticsGraph;
