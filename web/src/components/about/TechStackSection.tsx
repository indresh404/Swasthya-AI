// src/components/about/TechStackSection.tsx
import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Layout, Server, Database, ShieldCheck, Heart, Mic, Cpu } from 'lucide-react';

interface TechItem {
  name: string;
  role: string;
  details: string;
}

interface TechCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: TechItem[];
}

const TECH_CATEGORIES: TechCategory[] = [
  {
    title: '1. Frontend & Mobile Surfaces',
    description: 'Responsive user interfaces for conversational patient memory capture and real-time doctor dashboards.',
    icon: <Layout size={22} strokeWidth={2.5} />,
    color: '#0066FF',
    items: [
      { name: 'React Native + Expo', role: 'Patient App', details: 'Voice check-ins, medicine tracking, and family tree linking on iOS/Android.' },
      { name: 'React + Vite (TS)', role: 'Doctor Dashboard', details: 'High-frequency clinical console with QR lookup and explainable risk factor panels.' },
      { name: 'Three.js & WebGL', role: '3D Heatmaps', details: 'Semi-transparent anatomical mannequin mapping symptom frequency and recency.' },
      { name: 'Zustand', role: 'State Management', details: 'Predictable client-side store for active check-in sessions and offline states.' }
    ]
  },
  {
    title: '2. AI Backend & Orchestration',
    description: 'High-speed asynchronous Python gateway coordinating the 12-agent mesh and Sarvam speech APIs.',
    icon: <Server size={22} strokeWidth={2.5} />,
    color: '#8B5CF6',
    items: [
      { name: 'FastAPI (Python)', role: 'Core Orchestrator', details: 'Asynchronous REST gateway exposing the main POST /api/v1/agent entrypoint.' },
      { name: 'Groq (LLaMA Inference)', role: 'Language Engine', details: 'Low-latency entity extraction and adaptive check-in question generation.' },
      { name: 'Sarvam AI', role: 'Multilingual Voice', details: 'Native Indian speech-to-text (STT) and text-to-speech (TTS) in Hindi, Marathi, & English.' },
      { name: 'Render Workflows', role: 'Pipelines', details: 'Reliable background worker execution for scheduled daily check-in loops.' }
    ]
  },
  {
    title: '3. Health Graph & Structured Data',
    description: 'Hybrid storage combining longitudinal graph reasoning with transactional relational integrity.',
    icon: <Database size={22} strokeWidth={2.5} />,
    color: '#10B981',
    items: [
      { name: 'Neo4j AuraDB', role: 'Health Memory Graph', details: 'Cypher-queried graph storing longitudinal symptoms, family risk trees, and habits.' },
      { name: 'Supabase (PostgreSQL)', role: 'Transactional DB', details: 'Stores user authentication, active medicine registries, doctor slots, and audit logs.' },
      { name: 'Pydantic v2', role: 'Schema Guardrails', details: 'Strict JSON validation ensuring zero unstructured or invalid model outputs are written.' }
    ]
  },
  {
    title: '4. Drug Safety & Explainable ML',
    description: 'Deterministic clinical safety gating and calibrated machine learning risk models.',
    icon: <ShieldCheck size={22} strokeWidth={2.5} />,
    color: '#EC4899',
    items: [
      { name: 'OpenFDA API', role: 'Drug Safety Gate', details: 'Synchronous drug-drug interaction validation before saving any medication reminder.' },
      { name: 'scikit-learn & XGBoost', role: 'ML Pipeline', details: 'Calibrated classifier for cardiovascular disease risk on 70,000 patient records.' },
      { name: 'SHAP (TreeExplainer)', role: 'Explainable AI', details: 'Extracts exact contributing factors (e.g. Systolic BP, Age) behind every risk prediction.' },
      { name: 'Jan Aushadhi Index', role: 'Generic Pricing', details: 'Government generic medicine catalog for instant brand-to-generic cost comparison.' }
    ]
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 20 } 
  },
  hover: {
    y: -6,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
};

export const TechStackSection: React.FC = () => {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 80px 24px', boxSizing: 'border-box', width: '100%' }}>
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Cpu size={20} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Production Tech Stack
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Engineered for Safety, Speed & Scale
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
          Swasthya AI combines graph intelligence (Neo4j), transactional safety (Supabase + OpenFDA), calibrated machine learning (scikit-learn + SHAP), and native Indian voice AI (Sarvam).
        </p>
      </motion.div>

      {/* Animated Grid Container */}
      <motion.div 
        className="tech-stack-row hide-scrollbar"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {TECH_CATEGORIES.map((category, idx) => (
          <motion.div 
            key={idx}
            variants={cardVariants}
            whileHover="hover"
            style={{ 
              padding: '28px 24px', 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: '100%',
              borderRadius: '24px',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            {/* Header Icon Block */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  backgroundColor: `${category.color}15`, 
                  color: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {category.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {category.title}
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {category.description}
            </p>

            <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

            {/* List of Technologies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {category.items.map((tech, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {tech.name}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        color: category.color, 
                        backgroundColor: `${category.color}12`, 
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {tech.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {tech.details}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar { 
          display: none;
        }

        @media (max-width: 1200px) {
          .tech-stack-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .tech-stack-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TechStackSection;