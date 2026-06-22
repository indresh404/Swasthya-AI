// src/components/about/AboutBodyModelSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientBodyModel, { HeatPoint } from '../patient/PatientBodyModel';
import Card from '../ui/Card';
import { Brain, Heart, HelpCircle, AlertTriangle, Layers } from 'lucide-react';

/* 
  --- 3D ANATOMICAL COORDINATE PLACEMENTS ---
  Adjust the position of hotspots on the 3D mannequin using [x, y, z]:
  - x: Left (-)/Right (+)
  - y: Down (-)/Up (+)
  - z: Back (-)/Front (+)
*/
const ANATOMICAL_POINTS: HeatPoint[] = [
  {
    id: "head",
    label: "Head",
    description: "Migraine headache issues from the past 1 week (elevated risk due to sleep deprivation).",
    position: [0, 175, 0], // Head/cranial zone
    color: "#EF4444", // Glowing red
    intensity: 0.95
  },
  {
    id: "neck",
    label: "Neck",
    description: "Dry cough and throat irritation (risk of viral exposure or respiratory strain).",
    position: [0, 155, 0], // Neck zone
    color: "#F59E0B", // Glowing amber
    intensity: 0.8
  },
  {
    id: "heart",
    label: "Heart",
    description: "Borderline tachycardia (heart rate fluctuating between 90-104 bpm, smartwatch alert).",
    position: [0.02, 135, 0.12], // Left chest/heart zone
    color: "#EF4444", // Glowing red
    intensity: 0.95
  },
  {
    id: "stomach",
    label: "Stomach",
    description: "Visceral abdominal cramps and acid reflux (lifestyle factor: low water intake).",
    position: [0, 110, 0.12], // Abdomen/stomach zone
    color: "#10B981", // Glowing green
    intensity: 0.7
  },
  {
    id: "knee",
    label: "Knee",
    description: "Joint pain and stiffness (mild chronic inflammation, recorded in lifestyle logs).",
    position: [-0.1, 40, 0.12], // Knee/patella joint zone
    color: "#A78BFA", // Glowing violet
    intensity: 0.75
  }
];

export const AboutBodyModelSection: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<string>("Head");
  const [modelHeight, setModelHeight] = useState<string>("750px");

  React.useEffect(() => {
    const handleResize = () => {
      setModelHeight(window.innerWidth < 768 ? "420px" : "750px");
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activePointDetails = ANATOMICAL_POINTS.find(p => p.label === selectedPoint);

  return (
    <div className="body-model-section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }} className="body-section-responsive">
        
        {/* Left Side: Explanatory Text & Interactive Button Cards */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Interactive Mannequin Demo
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
            Visual Symptom Mapping
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 28px 0' }}>
            Swasthya AI implements an interactive 3D symptom heatmap. The model is rendered with a <strong>semi-transparent shader</strong> so that internal clinical markers remain visible to the doctor.
          </p>

          {/* Pill Card Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {ANATOMICAL_POINTS.map((point) => {
              const isActive = selectedPoint === point.label;
              return (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point.label)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '99px',
                    border: isActive ? `1.5px solid ${point.color}` : '1.5px solid var(--border)',
                    backgroundColor: isActive ? `${point.color}12` : 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? 'var(--shadow)' : 'none'
                  }}
                  className="anatomical-pill-btn"
                >
                  🎯 {point.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Highlight Card */}
          <AnimatePresence mode="wait">
            {activePointDetails && (
              <motion.div
                key={activePointDetails.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card 
                  style={{ 
                    padding: '24px', 
                    backgroundColor: 'var(--surface)', 
                    border: `1.5px solid ${activePointDetails.color}`,
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Brain size={18} style={{ color: activePointDetails.color }} />
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {activePointDetails.label} Hotspot Diagnosis
                      </strong>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        color: activePointDetails.color,
                        backgroundColor: `${activePointDetails.color}15`,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Active Alert
                    </span>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {activePointDetails.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <AlertTriangle size={14} style={{ color: activePointDetails.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Traversed & computed using the multi-agent graph inference model.
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Interactive 3D Canvas */}
        <div>
          <PatientBodyModel 
            heatPoints={ANATOMICAL_POINTS} 
            height={modelHeight} 
            selectedZoneLabel={selectedPoint}
            onSelectZone={(hp) => {
              if (hp) setSelectedPoint(hp.label);
            }}
          />
        </div>
      </div>

      <style>{`
        .anatomical-pill-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 768px) {
          .body-model-section-container {
            padding: 0 16px 40px 16px !important;
          }
          .body-section-responsive {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .body-section-responsive h2 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutBodyModelSection;
