// src/components/about/AgentShowcase.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Terminal, Activity, Cpu, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';

interface AgentItem {
  num: string;
  name: string;
  role: string;
}

const AGENTS: AgentItem[] = [
  { num: "01", name: "Onboarding Agent", role: "Extracts chronic conditions, medicines, allergies, surgeries, and family history through conversational onboarding." },
  { num: "02", name: "Check-In Agent", role: "Generates 2–3 adaptive daily questions from the patient's own longitudinal history and parses responses." },
  { num: "03", name: "Sarvam Chat Agent", role: "Voice and multilingual layer (speech-to-text, text-to-speech) in Hindi, Marathi, and English via Sarvam AI." },
  { num: "04", name: "Escalation Agent", role: "Watches for danger combinations and alerts the doctor using pure-Python deterministic rules (no LLM guesses)." },
  { num: "05", name: "Family Genetics Agent", role: "Traverses the family graph to surface inherited risk with exact relationship context without exposing private data." },
  { num: "06", name: "Medical Scan Agent", role: "Reads uploaded documents (lab reports, certificates) and extracts clinical values for user confirmation." },
  { num: "07", name: "Medicine Agent", role: "Manages reminders, adherence tracking, synchronous OpenFDA drug conflict checks, and Jan Aushadhi generic pricing." },
  { num: "08", name: "Smartwatch Risk Agent", role: "Feeds simulator heart rate, SpO2, and blood pressure into the risk graph and ML model inputs." },
  { num: "09", name: "Doctor Q&A Agent", role: "Answers doctor questions from graph data only; rewrites and queues missing fields to the patient's next check-in." },
  { num: "10", name: "Appointment Agent", role: "Matches patients to doctor specialties and available slots, attaching the graph-summarized health profile." },
  { num: "11", name: "Cardiac Risk Agent", role: "Calls the ML model tool and returns calibrated cardiovascular probability, risk band, and SHAP factor breakdown." },
  { num: "12", name: "Main Orchestrator Agent", role: "Single entry point brain coordinating memory retrieval (Neo4j + Supabase), specialist dispatch, and safety." }
];

interface SimStep {
  agentNum: string;
  log: string;
}

interface Simulation {
  id: string;
  name: string;
  icon: string;
  steps: SimStep[];
}

const SIMULATIONS: Simulation[] = [
  {
    id: 'onboarding',
    name: '1. Voice Onboarding Flow',
    icon: '👤',
    steps: [
      { agentNum: '12', log: '[Main Orchestrator] Ingesting multi-turn onboarding payload at POST /api/v1/agent' },
      { agentNum: '03', log: '[Sarvam Chat Agent] Hindi speech-to-text decoded: "मेरा नाम इन्द्रेश है, उम्र 20 साल, मुझे धूल से एलर्जी है और मेरे पिताजी को डायबिटीज है..."' },
      { agentNum: '01', log: '[Onboarding Agent] Pydantic schema validation successful: User profile, Allergy(Dust), FamilyLink(Father -> T2D).' },
      { agentNum: '12', log: '[Main Orchestrator] Cypher write: MERGE (p:Patient {name: "Indresh", age: 20}) MERGE (p)-[:HAS_ALLERGY]->(:Allergy {name: "Dust"})' },
      { agentNum: '12', log: '[Success] Onboarding complete! Initial health graph nodes and confirmation card generated.' }
    ]
  },
  {
    id: 'checkin',
    name: '2. Daily Adaptive Check-In',
    icon: '📋',
    steps: [
      { agentNum: '12', log: '[Main Orchestrator] Triggering scheduled adaptive daily check-in pipeline.' },
      { agentNum: '08', log: '[Smartwatch Risk Agent] Ingesting wearable simulator telemetry: BP=138/88 mmHg, Resting HR=84 bpm, SpO2=98%.' },
      { agentNum: '05', log: '[Family Genetics Agent] Graph traversal: MATCH (p)-[:RELATED_TO]->(f)-[:HAS_CONDITION]->(c) -> Father has Hypertension.' },
      { agentNum: '02', log: '[Check-In Agent] Generated 2 personalized questions based on BP elevation and father\'s cardiac profile.' },
      { agentNum: '03', log: '[Sarvam Chat Agent] Hindi TTS audio prompt synthesized: "नमस्ते इन्द्रेश, क्या आपको आज सीने में भारीपन या सांस की तकलीफ महसूस हुई?"' },
      { agentNum: '12', log: '[Success] Patient check-in logged and mapped to longitudinal timeline.' }
    ]
  },
  {
    id: 'escalation',
    name: '3. Deterministic Safety Escalation',
    icon: '🚨',
    steps: [
      { agentNum: '12', log: '[Main Orchestrator] New symptom reported: "Severe breathlessness for 3 days" + Chest discomfort.' },
      { agentNum: '12', log: '[Main Orchestrator] Neo4j historical retrieval found 2 recurring dyspnea episodes in past 30 days.' },
      { agentNum: '04', log: '[Escalation Agent] Executing pure-Python safety rule (Rule ID: CARDIO_DYSPNEA_RECURRENCE_01).' },
      { agentNum: '04', log: '[Escalation Agent] Match: has_breathing_difficulty=True & is_recurring=True & has_cardiac_history=True -> Level: URGENT_EVALUATION.' },
      { agentNum: '10', log: '[Appointment Agent] Flagged urgent clinician review & pre-matched Cardiologist Dr. Sharma.' },
      { agentNum: '12', log: '[Success] Escalation alert published to doctor dashboard with exact rule reasoning.' }
    ]
  },
  {
    id: 'doctor_closedloop',
    name: '4. Closed-Loop Q&A & Cardiac Risk',
    icon: '🩺',
    steps: [
      { agentNum: '12', log: '[Main Orchestrator] Doctor asks via dashboard: "Does the patient have recent cholesterol/lipid panel values?"' },
      { agentNum: '09', log: '[Doctor Q&A Agent] Graph retrieval: Cholesterol is marked as ESTIMATED (missing actual lab report).' },
      { agentNum: '09', log: '[Doctor Q&A Agent] Marking answer as NOT GROUNDED. Rewriting question for patient next check-in.' },
      { agentNum: '06', log: '[Medical Scan Agent] Patient uploads lab lipid report -> Extracted: Total Cholesterol = 210 mg/dL.' },
      { agentNum: '11', log: '[Cardiac Risk Agent] Recomputed ML risk: 68% (HIGH band). Top SHAP factors: Systolic BP (+32%), Cholesterol (+24%), Age (+18%).' },
      { agentNum: '12', log: '[Success] Closed loop complete! Doctor notified with updated graph citations and SHAP chart.' }
    ]
  }
];

export const AgentShowcase: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  
  // Simulator State
  const [activeSim, setActiveSim] = useState<string | null>(null);
  const [activeAgentNum, setActiveAgentNum] = useState<string | null>(null);
  const [streamedLogs, setStreamedLogs] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const simTimeoutRef = useRef<any>(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [streamedLogs]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    };
  }, []);

  // Robust Vertical Auto-Scroll Logic
  const scrollToAgent = (agentNum: string) => {
    const container = containerRef.current;
    const element = document.getElementById(`agent-card-${agentNum}`);
    
    if (container && element) {
      const containerCenter = container.clientHeight / 2;
      const elementCenter = element.offsetTop + (element.clientHeight / 2);
      
      container.scrollTo({
        top: elementCenter - containerCenter,
        behavior: 'smooth'
      });
    }
  };

  const runSimulation = (simId: string) => {
    const sim = SIMULATIONS.find(s => s.id === simId);
    if (!sim) return;

    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);

    setActiveSim(simId);
    setStreamedLogs([]);
    setActiveAgentNum(null);
    setSelectedAgent(null);

    let currentStep = 0;

    const executeNextStep = () => {
      if (currentStep < sim.steps.length) {
        const step = sim.steps[currentStep];
        
        setActiveAgentNum(step.agentNum);
        scrollToAgent(step.agentNum);
        setStreamedLogs(prev => [...prev, step.log]);
        
        currentStep++;
        simTimeoutRef.current = setTimeout(executeNextStep, 1800);
      } else {
        setActiveAgentNum(null);
        setActiveSim(null);
      }
    };

    executeNextStep();
  };

  return (
    <div className="agent-showcase-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 80px 24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Cpu size={20} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Multi-Agent System
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', textAlign: 'center', letterSpacing: '-0.5px' }}>
          The 12-Agent Specialization Mesh
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
          Instead of a single unexplainable chatbot, Swasthya AI coordinates 1 Orchestrator and 11 single-purpose domain specialists. Select a simulation workflow on the left to watch them coordinate in real time.
        </p>
      </motion.div>

      {/* Main Grid Layout: Left Simulator, Right Agent List */}
      <div 
        className="mesh-split-grid"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr', 
          gap: '32px', 
          alignItems: 'start'
        }}
      >
        
        {/* LEFT COLUMN: SIMULATOR & EXECUTION TERMINAL */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Simulator Triggers Card */}
          <Card 
            style={{ 
              padding: '32px', 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                  Orchestrator Sandbox
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Live Multi-Agent Simulator
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0', maxWidth: '400px' }}>
                  Trigger a real-world clinical workflow to watch the Orchestrator delegate tasks.
                </p>
              </div>
              
              {/* Status Indicator */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 14px', backgroundColor: activeSim ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)', borderRadius: '99px', border: activeSim ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)', transition: 'all 0.3s ease' }}>
                <Activity size={16} style={{ color: activeSim ? '#10B981' : 'var(--text-tertiary)', animation: activeSim ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: activeSim ? '#10B981' : 'var(--text-secondary)' }}>
                  {activeSim ? 'Streaming Output...' : 'System Idle'}
                </span>
              </div>
            </div>

            {/* Triggers 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {SIMULATIONS.map((sim) => {
                const isActive = activeSim === sim.id;
                return (
                  <motion.button
                    key={sim.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => runSimulation(sim.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '16px',
                      border: isActive ? '1.5px solid #0066FF' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'rgba(0, 102, 255, 0.05)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 8px 20px rgba(0, 102, 255, 0.15)' : 'none',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'border 0.3s ease, background-color 0.3s ease',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>{sim.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isActive ? '#0066FF' : 'var(--text-primary)' }}>{sim.name}</span>
                    </div>
                    {isActive ? (
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0066FF' }} />
                    ) : (
                      <Play size={14} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Execution Terminal Window */}
          <Card 
            style={{ 
              backgroundColor: '#09090B', 
              border: '1px solid #27272A', 
              borderRadius: '24px',
              padding: '24px',
              fontFamily: '"Fira Code", "JetBrains Mono", Courier New, monospace',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)',
              minHeight: '360px',
              height: '100%'
            }}
          >
            {/* Terminal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} style={{ color: '#38bdf8' }} />
                <span style={{ color: '#A1A1AA', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  swasthya-agent-mesh ~ % ./tail-orchestrator-trace
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            {/* Logs Body */}
            <div ref={consoleRef} className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px', paddingRight: '8px' }}>
              <AnimatePresence initial={false}>
                {streamedLogs.length === 0 ? (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: '#52525b', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <CheckCircle2 size={14} /> Click a workflow simulation above to watch agents stream execution logs...
                  </motion.span>
                ) : (
                  streamedLogs.map((log, idx) => {
                    const isSuccess = log.includes('[Success]');
                    const isAlert = log.includes('[Escalation') || log.includes('URGENT') || log.includes('Risk');
                    let color = '#D4D4D8';
                    if (isSuccess) color = '#34D399';
                    else if (isAlert) color = '#F87171';
                    else if (log.includes('[Main Orchestrator]')) color = '#38BDF8';
                    else if (log.includes('[Family Genetics Agent]')) color = '#C084FC';
                    else if (log.includes('[Cardiac Risk Agent]')) color = '#FBBF24';

                    return (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
                        style={{ color: color, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        <span style={{ opacity: 0.5, marginRight: '10px' }}>{`>`}</span>
                        {log}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              
              {/* Blinking Cursor */}
              {activeSim && (
                <motion.div
                  layout
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{ width: '8px', height: '16px', backgroundColor: '#38bdf8', marginTop: '6px' }}
                />
              )}
            </div>
          </Card>
        </motion.div>

        {/* RIGHT COLUMN: 1-COLUMN AGENT LIST */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', height: '80%', maxHeight: '780px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>11 Specialists + 1 Orchestrator</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066FF', backgroundColor: 'rgba(0, 102, 255, 0.08)', padding: '4px 10px', borderRadius: '12px' }}>12 Nodes Total</span>
          </div>

          <div 
            ref={containerRef}
            className="custom-scrollbar"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              overflowY: 'auto', 
              paddingRight: '12px',
              paddingBottom: '24px',
              position: 'relative'
            }}
          >
            {AGENTS.map((a, idx) => {
              const isCurrentActiveAgent = activeAgentNum === a.num;
              const isSelected = selectedAgent === idx;

              return (
                <motion.div 
                  key={idx} 
                  id={`agent-card-${a.num}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  style={{ flexShrink: 0 }}
                >
                  <Card
                    onClick={() => setSelectedAgent(isSelected ? null : idx)}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: isCurrentActiveAgent ? '#0066FF' : 'var(--surface)',
                      border: isCurrentActiveAgent 
                        ? '1px solid #4D94FF' 
                        : (isSelected ? '1px solid #0066FF' : '1px solid var(--border)'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      color: isCurrentActiveAgent ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: isCurrentActiveAgent 
                        ? '0 10px 24px rgba(0, 102, 255, 0.3)' 
                        : (isSelected ? '0 4px 12px rgba(0, 102, 255, 0.1)' : 'var(--shadow-sm)'),
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '16px'
                    }}
                  >
                    {/* Agent Number Badge */}
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '12px', 
                      backgroundColor: isCurrentActiveAgent ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: isCurrentActiveAgent ? 'none' : '1px solid var(--border)'
                    }}>
                      <span style={{ 
                        fontSize: '16px', 
                        fontWeight: 900, 
                        color: isCurrentActiveAgent ? '#FFFFFF' : '#0066FF', 
                        fontFamily: 'monospace'
                      }}>
                        {a.num}
                      </span>
                    </div>

                    {/* Agent Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1, width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: isCurrentActiveAgent ? '#FFFFFF' : 'var(--text-primary)' }}>
                          {a.name}
                        </h3>
                        {isCurrentActiveAgent && (
                          <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: '#0066FF', textTransform: 'uppercase' }}>
                            Active Node
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: isCurrentActiveAgent ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {a.role}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: var(--text-tertiary);
        }

        @media (max-width: 1024px) {
          .mesh-split-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .agent-showcase-container .custom-scrollbar {
            max-height: 500px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentShowcase;