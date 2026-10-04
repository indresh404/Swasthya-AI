// src/components/about/AgentWorkflowSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Workflow, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Cpu, 
  Code2, 
  Layers, 
  Activity, 
  MessageSquare, 
  FileCheck, 
  Lock,
  GitPullRequest,
  RefreshCw
} from 'lucide-react';
import Card from '../ui/Card';

const LIFECYCLE_STEPS = [
  {
    step: 1,
    name: "Perceive",
    tagline: "Multilingual Ingestion",
    description: "Ingests raw text, audio voice transcript via Sarvam AI (Hindi, Marathi, or English), or real-time wearable telemetry event.",
    input: 'Audio Stream: "मुझे पिछले तीन दिनों से सांस लेने में तकलीफ हो रही है..."',
    output: 'Transcribed text: "I have been having difficulty breathing for the past 3 days..."'
  },
  {
    step: 2,
    name: "Understand",
    tagline: "Structured NLP Extraction",
    description: "Extracts intent, explicit symptom entities, duration, severity, and temporal recurrence markers into strict Pydantic schemas.",
    input: 'Transcribed text: "I have been having difficulty breathing for the past 3 days..."',
    output: '{\n  "intent": "symptom_report",\n  "symptoms": ["dyspnea"],\n  "duration_days": 3,\n  "severity": "moderate",\n  "is_recurring": true\n}'
  },
  {
    step: 3,
    name: "Retrieve Memory",
    tagline: "Dual Graph + SQL Traversal",
    description: "Queries Neo4j AuraDB for historical symptom trajectories, past episodes, and family risk trees; fetches active prescriptions from Supabase.",
    input: 'MATCH (p:Patient {id: "indresh"})-[:EXPERIENCED]->(s:Symptom {name: "dyspnea"})',
    output: 'Found: 2 prior episodes in past 30 days. Active meds: Amlodipine (5mg). Family: Father diagnosed with Type 2 Diabetes & CAD.'
  },
  {
    step: 4,
    name: "Route Agent",
    tagline: "Single-Job Specialist Dispatch",
    description: "Main Orchestrator delegates task execution to exactly one of 11 isolated, specialized domain agents.",
    input: 'Extracted context + Intent payload',
    output: 'Dispatched to: Escalation Agent (#04) + Cardiac Risk Agent (#11)'
  },
  {
    step: 5,
    name: "Safety & Tools",
    tagline: "Deterministic Pure-Python Rules",
    description: "Runs inspectable, deterministic Python triage logic (no LLM in decisions), queries OpenFDA drug conflict APIs, and executes ML risk models.",
    input: 'SafetyRuleCheck(dyspnea=True, is_recurring=True, age=55, has_cardiac_history=True)',
    output: 'Escalation Flag: URGENT_EVALUATION\nRule ID: CARDIO_DYSPNEA_RECURRENCE_01\nClinician Review: REQUIRED'
  },
  {
    step: 6,
    name: "Execute Action",
    tagline: "Clinician Flags & Booking",
    description: "Generates doctor priority alert, schedules adaptive check-in follow-up questions, or matches appointment slots.",
    input: 'Action Queue: [CREATE_DOCTOR_ALERT, SCHEDULE_PULMONOLOGY_SLOT]',
    output: 'Created doctor dashboard notification & scheduled slot with Dr. Sharma (Cardiologist).'
  },
  {
    step: 7,
    name: "Update Memory",
    tagline: "Graph Persistence & Audit",
    description: "Writes new symptom nodes, timestamped relationships, and immutable audit trace records back into Neo4j and Supabase.",
    input: 'CYPHER: MERGE (p)-[:EXPERIENCED {date: "2026-10-04"}]->(s:Symptom {name: "dyspnea"})',
    output: 'Graph updated. Audit log committed with complete execution trace.'
  },
  {
    step: 8,
    name: "Respond",
    tagline: "Grounded Empathetic Reply",
    description: "Returns an empathetic, plain-language response in the patient's language with complete source grounding and step-by-step trace.",
    input: 'Synthesized response in Hindi via Sarvam TTS',
    output: '"आपकी सांस की तकलीफ का रिकॉर्ड दर्ज कर लिया गया है। आपके इतिहास को देखते हुए डॉक्टर को सूचित कर दिया गया है..."'
  }
];

export const AgentWorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'closedloop' | 'safety'>('lifecycle');

  const currentStepData = LIFECYCLE_STEPS.find(s => s.step === activeStep) || LIFECYCLE_STEPS[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px 24px', boxSizing: 'border-box', width: '100%' }}>
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Workflow size={20} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Agentic Workflow Architecture
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
          One Orchestrator, Eleven Specialists
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Externally exposed via a single endpoint: <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '6px', color: '#0066FF', fontFamily: 'monospace' }}>POST /api/v1/agent</code>. The Main Orchestrator coordinates isolated specialist agents, deterministic safety rules, and longitudinal graph memory.
        </p>
      </motion.div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '36px', flexWrap: 'wrap' }}>
        {[
          { id: 'lifecycle', label: '1. The 8-Step Lifecycle', icon: <Layers size={16} /> },
          { id: 'closedloop', label: '2. Closed-Loop Doctor Q&A', icon: <RefreshCw size={16} /> },
          { id: 'safety', label: '3. Deterministic Safety & Guardrails', icon: <ShieldCheck size={16} /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '16px',
                border: isActive ? '1.5px solid #0066FF' : '1.5px solid var(--border)',
                backgroundColor: isActive ? 'rgba(0, 102, 255, 0.08)' : 'var(--surface)',
                color: isActive ? '#0066FF' : 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 8-STEP LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <motion.div
          key="lifecycle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Top Step Pills Navigation */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}
            className="lifecycle-steps-pills"
          >
            {LIFECYCLE_STEPS.map((s) => {
              const isSelected = activeStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '14px',
                    border: isSelected ? '1.5px solid #0066FF' : '1px solid var(--border)',
                    backgroundColor: isSelected ? '#0066FF' : 'var(--surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, opacity: isSelected ? 0.9 : 0.6, fontFamily: 'monospace' }}>
                    STEP 0{s.step}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Card */}
          <Card
            style={{
              padding: '36px',
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'center' }} className="step-deepdive-grid">
              
              {/* Left Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 102, 255, 0.1)',
                      color: '#0066FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontFamily: 'monospace'
                    }}
                  >
                    0{currentStepData.step}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {currentStepData.tagline}
                  </span>
                </div>

                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                  Step {currentStepData.step}: {currentStepData.name}
                </h3>

                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  {currentStepData.description}
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: activeStep === 1 ? 'not-allowed' : 'pointer',
                      opacity: activeStep === 1 ? 0.4 : 1,
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    ← Previous Step
                  </button>
                  <button
                    disabled={activeStep === 8}
                    onClick={() => setActiveStep(prev => Math.min(8, prev + 1))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0066FF',
                      color: '#FFFFFF',
                      cursor: activeStep === 8 ? 'not-allowed' : 'pointer',
                      opacity: activeStep === 8 ? 0.4 : 1,
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Next Step</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Code / IO Terminal Preview */}
              <div
                style={{
                  backgroundColor: '#09090B',
                  borderRadius: '18px',
                  border: '1px solid #27272A',
                  padding: '20px',
                  fontFamily: '"Fira Code", monospace',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Incoming Payload / Query
                  </div>
                  <div style={{ color: '#38BDF8', fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: '#18181B', padding: '10px 12px', borderRadius: '8px', border: '1px solid #27272A' }}>
                    {currentStepData.input}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Observable Execution State
                  </div>
                  <div style={{ color: '#34D399', fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: '#18181B', padding: '10px 12px', borderRadius: '8px', border: '1px solid #27272A' }}>
                    {currentStepData.output}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </motion.div>
      )}

      {/* TAB 2: CLOSED-LOOP DOCTOR Q&A */}
      {activeTab === 'closedloop' && (
        <motion.div
          key="closedloop"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            style={{
              padding: '36px',
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto 36px auto', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                Self-Healing Clinical Loop
              </span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                Closed-Loop Doctor Q&A Workflow
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                When a doctor asks a clinical question about a patient, the system refuses to guess. If graph data is missing, the question is rewritten and automatically asked to the patient during their next daily check-in.
              </p>
            </div>

            {/* Workflow Step Blocks Flowchart */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                position: 'relative'
              }}
            >
              {[
                {
                  step: "1",
                  title: "Doctor Query",
                  desc: 'Doctor asks: "Has the patient had recent palpitations or taken OTC NSAIDs?"',
                  color: "#0066FF"
                },
                {
                  step: "2",
                  title: "Graph Retrieval",
                  desc: "System queries Neo4j AuraDB. Detects missing NSAID intake history for recent week.",
                  color: "#8B5CF6"
                },
                {
                  step: "3",
                  title: "Adaptive Rewrite",
                  desc: 'Rewrites question for patient: "Have you taken any pain relief tablets in the past 3 days?"',
                  color: "#F59E0B"
                },
                {
                  step: "4",
                  title: "Patient Check-In",
                  desc: "Patient answers via Sarvam Hindi voice check-in: 'हाँ, मैंने कॉम्बीफ्लेम ली थी...'",
                  color: "#10B981"
                },
                {
                  step: "5",
                  title: "Graph Synced & Alert",
                  desc: "Graph memory updated. Doctor's question is now grounded and doctor is notified with citations.",
                  color: "#38BDF8"
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '18px',
                    border: `1.5px solid ${item.color}30`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 900
                      }}
                    >
                      {item.step}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: item.color, textTransform: 'uppercase' }}>
                      Stage {item.step}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {item.title}
                  </h4>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* TAB 3: DETERMINISTIC SAFETY & GUARDRAILS */}
      {activeTab === 'safety' && (
        <motion.div
          key="safety"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }} className="safety-split-grid">
            
            {/* Pure Python Safety Rule Inspector */}
            <Card
              style={{
                padding: '28px',
                backgroundColor: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Code2 size={18} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Deterministic Safety Rule (Pure Python)
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                LLM Extracts. Python Rules Decide.
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                All triage decisions are inspectable pure-Python rules. No medical conclusion or doctor escalation relies on an LLM's stochastic generation.
              </p>

              <div
                style={{
                  backgroundColor: '#09090B',
                  borderRadius: '14px',
                  border: '1px solid #27272A',
                  padding: '16px',
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '12px',
                  color: '#D4D4D8',
                  lineHeight: 1.6,
                  overflowX: 'auto'
                }}
              >
                <span style={{ color: '#EC4899' }}>if</span> has_breathing_difficulty <span style={{ color: '#EC4899' }}>and</span> (is_recurring <span style={{ color: '#EC4899' }}>or</span> patient_age &gt;= <span style={{ color: '#F59E0B' }}>55</span> <span style={{ color: '#EC4899' }}>or</span> has_cardiac_history):{'\n'}
                {'    '}requires_clinician_review = <span style={{ color: '#10B981' }}>True</span>{'\n'}
                {'    '}escalation_level = <span style={{ color: '#38BDF8' }}>"URGENT_EVALUATION"</span>{'\n'}
                {'    '}rule_id = <span style={{ color: '#38BDF8' }}>"RULE_DYSPNEA_CARDIO_01"</span>{'\n'}
                {'    '}reasons.append(<span style={{ color: '#34D399' }}>"Recurrent dyspnea in patient with cardiovascular risk profile."</span>)
              </div>
            </Card>

            {/* Hallucination Control Matrix */}
            <Card
              style={{
                padding: '28px',
                backgroundColor: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShieldCheck size={18} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Controlling Hallucination
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                Strict Clinical Grounding Boundaries
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { domain: "Risk Score", rule: "Produced by ML model (LR/XGBoost). LLM only phrases." },
                  { domain: "Escalation", rule: "Pure-Python deterministic rules. LLM only extracts symptoms." },
                  { domain: "Drug Conflicts", rule: "Come directly from OpenFDA API data, never LLM guess." },
                  { domain: "Doctor Q&A", rule: "Answers only from graph data. If missing, queues patient question." },
                  { domain: "Numbers & Facts", rule: "Always retrieved from database or tool, never from LLM memory." }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', minWidth: '100px' }}>
                      {item.domain}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'right' }}>
                      {item.rule}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Technical Safeguards Grid */}
          <Card
            style={{
              padding: '28px',
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '24px'
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              8 Layered Technical Safeguards
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {[
                { title: "1. Structured Pydantic Output", desc: "Extraction is JSON-only and schema-validated. Invalid payloads rejected." },
                { title: "2. Grounding & Citations", desc: "Every answer cites exact graph node / check-in date. No source = no answer." },
                { title: "3. Allowed-List Validation", desc: "Medicine and symptom names verified against known databases before saving." },
                { title: "4. Confirmation Card Gating", desc: "Important facts confirmed with user review card before graph writes." },
                { title: "5. Low Temperature (0-0.1)", desc: "Near-zero temperature for all factual and clinical entity extraction." },
                { title: "6. Negative Prompting", desc: "Instructed never to diagnose and to explicitly say 'I don't know' when unsure." },
                { title: "7. Fallback Retries", desc: "Automatic retries on invalid output, falling back to safe default escalation." },
                { title: "8. Immutable Audit Trace", desc: "Every lifecycle step and agent decision persisted for complete traceability." }
              ].map((sg, i) => (
                <div key={i} style={{ padding: '12px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {sg.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {sg.desc}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .step-deepdive-grid, .safety-split-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .lifecycle-steps-pills {
            display: flex !important;
            overflow-x: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentWorkflowSection;
