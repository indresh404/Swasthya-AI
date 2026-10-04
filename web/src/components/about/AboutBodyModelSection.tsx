// src/components/about/AboutBodyModelSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientBodyModel, { HeatPoint } from '../patient/PatientBodyModel';
import Card from '../ui/Card';
import { Activity, AlertTriangle, ShieldCheck, Heart, GitBranch } from 'lucide-react';

/* 
  --- 3D ANATOMICAL COORDINATE PLACEMENTS ---
  Hotspots on 3D mannequin using [x, y, z]:
  - x: Left (-)/Right (+)
  - y: Down (-)/Up (+)
  - z: Back (-)/Front (+)
*/
const ANATOMICAL_POINTS: HeatPoint[] = [
  {
    id: "head",
    label: "Head",
    description: "Cranial tension & migraine reported across 3 consecutive check-ins. Correlated with late sleep logs (after 1:30 AM).",
    position: [0, 175, 0], // Head zone
    color: "#EF4444", // Glowing red
    intensity: 0.95
  },
  {
    id: "neck",
    label: "Neck / Throat",
    description: "Recurrent dyspnea & dry cough. Safety Layer Rule triggered: recurrent breathing difficulty in patient with cardiovascular history -> Clinician review flagged.",
    position: [0, 155, 0], // Neck zone
    color: "#F59E0B", // Glowing amber
    intensity: 0.85
  },
  {
    id: "heart",
    label: "Chest / Heart",
    description: "Cardiovascular risk focal zone. Smartwatch vitals: Systolic BP 142 mmHg, resting HR 98 bpm, pulse pressure 50 mmHg. Fed directly into the ML risk pipeline.",
    position: [0.02, 135, 0.12], // Heart zone
    color: "#EF4444", // Glowing red
    intensity: 0.98
  },
  {
    id: "stomach",
    label: "Stomach / GI",
    description: "Visceral epigastric discomfort & acid reflux. OpenFDA checked against active NSAID prescription for potential GI ulceration conflict.",
    position: [0, 110, 0.12], // Abdomen zone
    color: "#10B981", // Glowing green
    intensity: 0.7
  },
  {
    id: "knee",
    label: "Knee / Joint",
    description: "Bilateral joint stiffness and mild chronic inflammation recorded in lifestyle logs. Monitored for mobility impact.",
    position: [-0.1, 40, 0.12], // Knee joint zone
    color: "#A78BFA", // Glowing violet
    intensity: 0.75
  }
];

export const AboutBodyModelSection: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<string>("Chest / Heart");
  const [modelHeight, setModelHeight] = useState<string>("750px");

  React.useEffect(() => {
    const handleResize = () => {
      setModelHeight(window.innerWidth < 768 ? "420px" : "750px");
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activePointDetails = ANATOMICAL_POINTS.find(p => p.label === selectedPoint) || ANATOMICAL_POINTS[2];

  return (
    <div className="body-model-section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }} className="body-section-responsive">
        
        {/* Left Side: Explanatory Text & Interactive Hotspots */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Interactive Mannequin & Symptom Heatmap
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
            Visual Longitudinal Symptom Mapping
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Swasthya AI dynamically highlights anatomical zones based on <strong>symptom frequency and recency</strong> across daily voice check-ins. The 3D model renders with a semi-transparent shader so internal clinical risk markers and longitudinal patterns remain immediately visible to the doctor.
          </p>

          {/* Pill Card Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {ANATOMICAL_POINTS.map((point) => {
              const isActive = selectedPoint === point.label;
              return (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point.label)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    border: isActive ? `1.5px solid ${point.color}` : '1.5px solid var(--border)',
                    backgroundColor: isActive ? `${point.color}15` : 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
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
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Activity size={18} style={{ color: activePointDetails.color }} />
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {activePointDetails.label} Hotspot Details
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
                      Active Graph Marker
                    </span>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {activePointDetails.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <GitBranch size={14} style={{ color: activePointDetails.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Traversed & linked through Neo4j AuraDB health graph history.
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
          box-shadow: var(--shadow-md);
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
