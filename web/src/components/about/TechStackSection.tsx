// src/components/about/TechStackSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, BrainCircuit, Cpu } from 'lucide-react';

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

// Reverted to highly versatile saturated colors that pop in BOTH light and dark themes
const TECH_CATEGORIES: TechCategory[] = [
  {
    title: '1. Frontend & Mobile',
    description: 'Interactive UI layers engineered for high usability, speed, and real-time medical visualization.',
    icon: <Layout size={22} strokeWidth={2.5} />,
    color: '#0066FF', // Vibrant Blue
    items: [
      { name: 'React + Vite', role: 'Doctor Console', details: 'Powers the high-frequency physician panel and graph portal.' },
      { name: 'React Native', role: 'Patient App', details: 'Enables quick client-side voice reporting and reminders.' },
      { name: 'Three.js', role: '3D Heatmaps', details: 'Renders localized anatomical symptom markers on the body.' }
    ]
  },
  {
    title: '2. Core Architecture',
    description: 'High-performance API gateways and interconnected clinical data storage structures.',
    icon: <Server size={22} strokeWidth={2.5} />,
    color: '#8B5CF6', // Royal Purple
    items: [
      { name: 'FastAPI', role: 'Async APIs', details: 'Python-based endpoints routing multi-agent pipeline tasks.' },
      { name: 'Neo4j AuraDB', role: 'Health Memory', details: 'Stores patient symptoms, vitals, habits, and genetic trees.' },
      { name: 'Supabase', role: 'Data & Auth', details: 'Handles relational tables, auth security, and scan records.' }
    ]
  },
  {
    title: '3. ML Predictor',
    description: 'Dedicated symptom-risk estimation model providing auditable, repeatable clinical scores.',
    icon: <BrainCircuit size={22} strokeWidth={2.5} />,
    color: '#10B981', // Emerald Green
    items: [
      { name: 'Random Forest', role: 'Risk Classifier', details: 'Trained on type, duration, severity, and family flags.' },
      { name: 'scikit-learn', role: 'Model Engine', details: 'Chosen for explaining non-linear features without overfitting.' },
      { name: 'Feature Flags', role: 'Explainable AI', details: 'Outputs top driving factors to the Explanation Agent.' }
    ]
  },
  {
    title: '4. AI Orchestration',
    description: 'A mesh of 11 cooperative agents managing task isolation and natural interface rendering.',
    icon: <Cpu size={22} strokeWidth={2.5} />,
    color: '#EC4899', // Vibrant Pink
    items: [
      { name: 'Groq + LLaMA-3', role: 'Core Reasoning', details: 'Super-fast inference engine for onboarding and doctor Q&A.' },
      { name: 'Sarvam AI', role: 'Local Speech', details: 'Translates natural audio check-ins in Hindi and Marathi.' },
      { name: 'Render', role: 'Orchestrator', details: 'Manages asynchronous agent pipelines and background routing.' }
    ]
  }
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 20 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
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
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '56px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Server size={20} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            System Stack
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Technical Stack
        </h2>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
          Swasthya AI combines robust machine learning classifiers with modern graph databases and highly concurrent multi-agent speech pipelines.
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
          boxSizing: 'border-box',
          paddingBottom: '24px' // Buffer for hover physics (y: -8)
        }}
      >
        {TECH_CATEGORIES.map((category, idx) => (
          <motion.div 
            key={idx}
            variants={cardVariants}
            whileHover="hover"
            style={{ 
              padding: '32px 24px', 
              backgroundColor: 'var(--surface)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              height: '100%',
              borderRadius: '24px',
              position: 'relative',
              boxShadow: 'var(--shadow)',
              cursor: 'default',
              overflow: 'hidden'
            }}
            // Framer Motion Hover Physics
            whileHoverCapture={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
          >
            {/* Dynamic Tint Overlay on Hover */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                hover: { opacity: 1 }
              }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(180deg, ${category.color}08 0%, transparent 100%)`,
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Header Icon Block */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <motion.div 
                variants={{
                  hover: { scale: 1.1, rotate: 5, backgroundColor: `${category.color}15` }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  backgroundColor: `${category.color}10`, 
                  color: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${category.color}20`
                }}
              >
                {category.icon}
              </motion.div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
                {category.title}
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
              {category.description}
            </p>

            <div style={{ borderBottom: '1px solid var(--border)', width: '100%', position: 'relative', zIndex: 1 }} />

            {/* List of Technologies */}
            <motion.div 
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, position: 'relative', zIndex: 1 }}
            >
              {category.items.map((tech, i) => (
                <motion.div variants={itemVariants} key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {tech.name}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        color: category.color, 
                        border: `1px solid ${category.color}30`,
                        backgroundColor: `${category.color}08`, 
                        padding: '4px 10px', 
                        borderRadius: '99px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {tech.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {tech.details}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Glowing Border & Shadow Reveal on Hover */}
            <motion.div
              variants={{
                hidden: { opacity: 0, boxShadow: `0 0 0 rgba(0,0,0,0)` },
                hover: { opacity: 1, boxShadow: `0 20px 40px ${category.color}20` }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '24px',
                border: `1.5px solid ${category.color}40`,
                pointerEvents: 'none',
                zIndex: 2,
                transition: 'box-shadow 0.3s ease'
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        /* Hide scrollbar for a clean UI on horizontal scroll */
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar { 
          display: none;
        }

        /* Responsive scroll view for mobile screen layouts */
        @media (max-width: 1024px) {
          .tech-stack-row {
            grid-template-columns: repeat(4, 320px) !important;
            overflow-x: auto !important;
            padding: 10px 16px 40px 16px !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            margin: 0 -24px; /* Full bleed on mobile */
          }
          .tech-stack-row > div {
            scroll-snap-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TechStackSection;