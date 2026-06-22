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
  { num: "01", name: "Onboarding Agent", role: "Extracts chronic conditions, allergies, and family history, writing the initial nodes." },
  { num: "02", name: "Check-In Agent", role: "Constructs 2–3 adaptive daily questions from patient graph histories, logging outcomes." },
  { num: "03", name: "Sarvam Chat Agent", role: "Voice layer providing Marathi, Hindi, and English STT/TTS speech processing." },
  { num: "04", name: "Escalation Agent", role: "Triggers emergency checks on critical danger combinations using deterministic thresholds." },
  { num: "05", name: "Family Genetics Agent", role: "Traverses family branches using Cypher to identify inherited risk propagation paths." },
  { num: "06", name: "Medical Scan Agent", role: "Verifies medical documents and income certificates for government insurance eligibility." },
  { num: "07", name: "Medicine Reminder Agent", role: "Schedules dose alerts and checks drug-drug conflict warnings using OpenFDA." },
  { num: "08", name: "Smartwatch Risk Agent", role: "Ingests heart rate, SpO2, and BP anomalies from wearables directly into graphs." },
  { num: "09", name: "Doctor Q&A Agent", role: "Answers doctor queries grounded in Neo4j logs, or queues patient prompts." },
  { num: "10", name: "Appointment Automation Agent", role: "Coordinates schedule matches, auto-assigning physicians based on logs." },
  { num: "11", name: "Daily Workflow Orchestrator", role: "Orchestrates multi-stage background pipelines with event retry support." }
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
    name: '1. Onboarding Flow',
    icon: '👤',
    steps: [
      { agentNum: '11', log: '[Orchestrator] Initiating onboarding flow webhook event.' },
      { agentNum: '03', log: '[Sarvam Chat] Hindi voice input captured: "मेरा नाम इन्द्रेश है, 20 वर्ष का हूँ..."' },
      { agentNum: '03', log: '[Sarvam Chat] Transcribed payload: "Name: Indresh, Age: 20, Gender: Male."' },
      { agentNum: '01', log: '[Onboarding Agent] Analyzing conversation. Extracted Patient profile details.' },
      { agentNum: '11', log: '[Orchestrator] Executing Cypher merge: MERGE (u:User {name: "Indresh", age: 20})' },
      { agentNum: '11', log: '[Success] Onboarding complete! Initial graph nodes saved.' }
    ]
  },
  {
    id: 'checkin',
    name: '2. Check-In Assessment',
    icon: '📋',
    steps: [
      { agentNum: '11', log: '[Orchestrator] Starting scheduled daily check-in sequence.' },
      { agentNum: '08', log: '[Smartwatch Agent] Ingesting wearable logs: SpO2=95%, HeartRate=72bpm.' },
      { agentNum: '02', log: '[Check-In Agent] Running graph traversal... Found active family risk: Monish is positive.' },
      { agentNum: '02', log: '[Check-In Agent] Generated adaptive question: "Monish has COVID. Do you have dry cough or fever?"' },
      { agentNum: '11', log: '[Success] Patient check-in response successfully logged to graph.' }
    ]
  },
  {
    id: 'escalation',
    name: '3. Risk Scan & Escalation',
    icon: '🚨',
    steps: [
      { agentNum: '11', log: '[Orchestrator] Scan event triggered: Active symptoms updated.' },
      { agentNum: '05', log: '[Family Genetics Agent] Querying family history: MATCH (u)-[:RELATED_TO]->(f)-[:HAS_DISEASE]->(d)' },
      { agentNum: '05', log: '[Family Genetics Agent] Found exposure vector: Child Monish has active COVID-19.' },
      { agentNum: '04', log: '[Escalation Agent] Match rule check: Fever + Cough + SpO2 (95%) + Exposure = High COVID-19 Risk.' },
      { agentNum: '11', log: '[Success] Patient profile flagged as Elevated Risk. Pulsing dashboard alert.' }
    ]
  },
  {
    id: 'appointment',
    name: '4. Pulmonology Scheduler',
    icon: '🗓️',
    steps: [
      { agentNum: '11', log: '[Orchestrator] Referral received from Escalation Agent.' },
      { agentNum: '10', log: '[Appointment Agent] Scanning Pulmonology calendars for Dr. Sharma...' },
      { agentNum: '10', log: '[Appointment Agent] Slot matched: Pulmonologist Dr. Sharma (Tomorrow 10:00 AM).' },
      { agentNum: '11', log: '[Success] Relationship saved: (u)-[:APPOINTED_WITH]->(Doctor Dr. Sharma).' }
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
      // Calculate exact center of the scroll container
      const containerCenter = container.clientHeight / 2;
      // Calculate the center of the target element relative to the container
      const elementCenter = element.offsetTop + (element.clientHeight / 2);
      
      // Scroll to position the element exactly in the middle
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
        scrollToAgent(step.agentNum); // Triggers auto-scroll to the highlighted agent
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
            System Architecture
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', textAlign: 'center', letterSpacing: '-0.5px' }}>
          The 11-Agent Mesh
        </h2>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
          Instead of a single brittle chatbot, Swasthya AI coordinates 11 dedicated, specialized agents. Select a simulation workflow on the left to watch them coordinate in real-time.
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
        
        {/* ========================================= */}
        {/* LEFT COLUMN: SIMULATOR & EXECUTION TERMINAL */}
        {/* ========================================= */}
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
                  Live Workflow Simulator
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0', maxWidth: '400px' }}>
                  Trigger a core background workflow to watch specialized agents execute tasks.
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
                  swasthya-mesh ~ % ./tail-logs
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
                    <CheckCircle2 size={14} /> Waiting for orchestrator initialization...
                  </motion.span>
                ) : (
                  streamedLogs.map((log, idx) => {
                    const isSuccess = log.includes('[Success]');
                    const isAlert = log.includes('[Escalation') || log.includes('Warning') || log.includes('Risk');
                    let color = '#D4D4D8';
                    if (isSuccess) color = '#34D399';
                    else if (isAlert) color = '#F87171';
                    else if (log.includes('[Orchestrator]')) color = '#38BDF8';
                    else if (log.includes('[Family Genetics Agent]')) color = '#C084FC';

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

        {/* ========================================= */}
        {/* RIGHT COLUMN: 1-COLUMN AGENT LIST */}
        {/* ========================================= */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', height: '80%', maxHeight: '780px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Specialized Nodes</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px' }}>11 Agents Total</span>
          </div>

          <div 
            ref={containerRef}
            className="custom-scrollbar"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              overflowY: 'auto', 
              paddingRight: '12px',
              paddingBottom: '24px',
              position: 'relative' // Required for accurate .offsetTop calculation
            }}
          >
            {AGENTS.map((a, idx) => {
              const isCurrentActiveAgent = activeAgentNum === a.num;
              const isSelected = selectedAgent === idx;

              return (
                <motion.div 
                  key={idx} 
                  id={`agent-card-${a.num}`} // ID used for auto-scroll targeting
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  style={{ flexShrink: 0 }}
                >
                  <Card
                    onClick={() => setSelectedAgent(isSelected ? null : idx)}
                    style={{
                      padding: '20px',
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
                        ? '0 10px 24px rgba(0, 102, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)' 
                        : (isSelected ? '0 4px 12px rgba(0, 102, 255, 0.1)' : 'var(--shadow)'),
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '16px'
                    }}
                  >
                    {/* Active Background Glow */}
                    {isCurrentActiveAgent && (
                      <motion.div 
                        animate={{ scale: [1, 1.2], opacity: [0.2, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFFFFF', pointerEvents: 'none' }}
                      />
                    )}

                    {/* Agent Number Badge */}
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      backgroundColor: isCurrentActiveAgent ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: isCurrentActiveAgent ? 'none' : '1px solid var(--border)'
                    }}>
                      <span style={{ 
                        fontSize: '18px', 
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
                            Active
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
        /* Beautiful Custom Scrollbar for Terminal & Agent List */
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

        /* Stack layout vertically on smaller screens */
        @media (max-width: 1024px) {
          .mesh-split-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          /* Cap height of agent list on mobile so it doesn't take over the entire screen */
          .agent-showcase-container .custom-scrollbar {
            max-height: 500px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentShowcase;