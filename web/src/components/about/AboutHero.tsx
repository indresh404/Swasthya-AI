// src/components/about/AboutHero.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BrainAnimation from '../Brain/Brain';
import { 
  Heart, 
  GitBranch, 
  ShieldCheck, 
  Mic, 
  Layers, 
  Check, 
  X, 
  ArrowRight,
  Sparkles,
  Activity,
  Brain
} from 'lucide-react';
import Card from '../ui/Card';

const COMPARISON_ROWS = [
  {
    feature: "Conversation Context",
    stateless: "Each message is isolated. Forgets prior complaints immediately.",
    swasthya: "Every message joins an evolving, longitudinal health graph memory."
  },
  {
    feature: "Symptom Recurrence",
    stateless: '"I have a fever" receives generic one-shot advice.',
    swasthya: '"Fever again: 3rd time this month, same week your father\'s sugar was flagged."'
  },
  {
    feature: "Family Context",
    stateless: "Zero family history awareness across visits.",
    swasthya: "Privacy-preserving family graph traversal automatically surfaces hereditary risks."
  },
  {
    feature: "Voice & Languages",
    stateless: "English-first, text-only forms and chat inputs.",
    swasthya: "Voice-first conversational AI in Hindi, Marathi, and English via Sarvam AI."
  },
  {
    feature: "Doctor Q&A Loop",
    stateless: "Static one-shot answers with no clinician follow-up.",
    swasthya: "Closed-loop Q&A: Unanswered doctor questions are queued to the patient's next check-in."
  },
  {
    feature: "Medicine & Financial Care",
    stateless: "No interaction check and no pricing guidance.",
    swasthya: "Synchronous OpenFDA drug conflict gating + Jan Aushadhi generic price savings & store locator."
  },
  {
    feature: "Risk Explainability",
    stateless: "Opaque numbers or ungrounded LLM hallucinations.",
    swasthya: "Calibrated ML risk score with exact SHAP contributing factor breakdown."
  }
];

export const AboutHero: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div
      className="about-hero"
      style={{
        padding: '100px 24px 60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '36px',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* 3D Brain Particle Animation Background (Light, ambient & interactive) */}
      <div
        className="hero-brain-bg"
        style={{
          position: 'absolute',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1100px',
          height: '620px',
          opacity: 0.38,
          zIndex: 0,
          pointerEvents: 'auto',
          maskImage: 'radial-gradient(circle at center, black 50%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 85%)'
        }}
      >
        <BrainAnimation style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Top Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '99px',
          backgroundColor: 'rgba(0, 102, 255, 0.08)',
          border: '1px solid rgba(0, 102, 255, 0.2)',
          color: '#0066FF',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Sparkles size={14} />
        <span>Multilingual Voice-First Health Memory Platform</span>
      </motion.div>

      {/* Main Title & Sanskrit Definition */}
      <div style={{ textAlign: 'center', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ 
            fontSize: '52px', 
            fontWeight: 900, 
            color: 'var(--text-primary)', 
            margin: '0 0 16px 0', 
            letterSpacing: '-1.5px', 
            lineHeight: 1.15 
          }}
        >
          Swasthya AI
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ 
            fontSize: '22px', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6, 
            margin: '0 auto 24px auto', 
            fontWeight: 500, 
            maxWidth: '780px' 
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>स्वास्थ्य (Swasthya)</strong> — Sanskrit for "health." Built on one foundational belief: <span style={{ color: '#0066FF', fontWeight: 700 }}>healthcare should remember you, not just react to you.</span>
        </motion.p>
      </div>

      {/* 4 Core Pillars Pills */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          maxWidth: '1000px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {[
          { icon: <GitBranch size={16} />, label: "Graph Health Memory", desc: "Neo4j AuraDB longitudinal reasoning" },
          { icon: <Layers size={16} />, label: "1 Orchestrator + 11 Specialists", desc: "Single-job isolated agent mesh" },
          { icon: <ShieldCheck size={16} />, label: "Deterministic Safety Layer", desc: "Pure Python rules, zero LLM guesswork" },
          { icon: <Mic size={16} />, label: "Sarvam Multilingual Voice", desc: "Hindi, Marathi & English speech" },
          { icon: <Heart size={16} />, label: "Calibrated ML Risk Model", desc: "Explainable cardiovascular prediction" },
          { icon: <Activity size={16} />, label: "Closed-Loop Doctor Q&A", desc: "Unanswered queries routed to check-ins" }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ color: '#0066FF', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* The Problem Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', marginTop: '10px', position: 'relative', zIndex: 1 }}
      >
        <Card
          style={{
            padding: '36px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              The Core Problem
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
              Healthcare in India is Fragmented, Reactive & Disconnected
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              A doctor gets about <strong>10 minutes per patient</strong>, and the first 5 go to reconstructing context (when did it start, what are you taking, has it happened before). Meanwhile, symptoms that repeat between visits go unmonitored.
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}
          >
            {[
              {
                title: "Scattered Records",
                desc: "Hypertension history, parent's pre-diabetes, and sibling's kidney condition sit in separate paper files at separate clinics."
              },
              {
                title: "Wasted Consultation Time",
                desc: "Half the consultation is lost reconstructing history instead of clinical examination and personalized care."
              },
              {
                title: "Nobody Watches Between Visits",
                desc: "Repeating patterns and family risks reach the doctor only when the patient is already in the emergency room or chair."
              },
              {
                title: "Unsafe OTC Medicine Use",
                desc: "Patients buy medicines over the counter without knowing dangerous interactions with existing prescriptions."
              },
              {
                title: "Hidden Financial Help",
                desc: "Patients often do not know that Jan Aushadhi generic equivalents or government schemes could cut their costs drastically."
              },
              {
                title: "Stateless Chatbots Lack Memory",
                desc: "Existing health chatbots treat every interaction as an isolated session. Without memory, there is no insight, only response."
              }
            ].map((p, i) => (
              <div 
                key={i}
                style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Comparison: Stateless Chatbot vs. Swasthya AI */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              Architectural Shift
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              How Swasthya AI Differs From a Symptom Checker
            </h3>
          </div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface)',
              border: '1.5px solid #0066FF',
              color: '#0066FF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{showComparison ? 'Compact View' : 'Full Comparison Table'}</span>
            <ArrowRight size={14} style={{ transform: showComparison ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
        </div>

        <Card
          style={{
            padding: '0',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', width: '25%' }}>
                    Capability
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#EF4444', width: '37.5%' }}>
                    Stateless Chatbot / Symptom Checker
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#10B981', width: '37.5%' }}>
                    Swasthya AI Health Memory
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.slice(0, showComparison ? COMPARISON_ROWS.length : 4).map((row, idx) => (
                  <tr 
                    key={idx}
                    style={{ 
                      borderBottom: idx !== (showComparison ? COMPARISON_ROWS.length - 1 : 3) ? '1px solid var(--border)' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <X size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
                        <span>{row.stateless}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, verticalAlign: 'top', backgroundColor: 'rgba(16, 185, 129, 0.03)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>{row.swasthya}</strong></span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .about-hero {
            padding: 80px 16px 40px 16px !important;
            gap: 24px !important;
          }
          .about-hero h1 {
            font-size: 34px !important;
          }
          .about-hero p {
            font-size: 16px !important;
          }
          .hero-brain-bg {
            height: 380px !important;
            top: 90px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutHero;
