// src/components/about/ModelSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import Heart3DModel, { CARDIAC_STRUCTURES } from './Heart3DModel';
import { 
  Heart, 
  Activity, 
  Cpu, 
  Sparkles, 
  Stethoscope
} from 'lucide-react';
import Card from '../ui/Card';
import useAnime from '../../hooks/useAnime';

export const ModelSection: React.FC = () => {
  const { staggerEntrance, transitionContent, animateClick, prefersReduced } = useAnime();
  
  // Selected Anatomical Structure (default to Left Ventricle)
  const [selectedStructureId, setSelectedStructureId] = useState<string>('left_ventricle');

  // Refs for Anime.js targets
  const sectionHeaderRef = useRef<HTMLDivElement>(null);
  const leftCardsRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  // Staggered Entrance on Initial Mount
  useEffect(() => {
    if (prefersReduced) return;

    if (sectionHeaderRef.current) {
      staggerEntrance(sectionHeaderRef.current, { delay: 100, duration: 600, offsetY: 14 });
    }
    if (leftCardsRef.current) {
      const cards = leftCardsRef.current.querySelectorAll('.stagger-card');
      staggerEntrance(cards, { delay: 250, staggerDelay: 80, offsetY: 12 });
    }
  }, [staggerEntrance, prefersReduced]);

  // Smooth Crossfade when Active Structure changes
  useEffect(() => {
    if (infoPanelRef.current) {
      transitionContent(infoPanelRef.current);
    }
  }, [selectedStructureId, transitionContent]);

  // Find active structure details
  const activeStructure = CARDIAC_STRUCTURES.find(s => s.id === selectedStructureId) || CARDIAC_STRUCTURES[1];

  return (
    <section style={{ position: 'relative', padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Section Header */}
      <div ref={sectionHeaderRef} style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Heart size={20} style={{ color: '#EF4444' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ML Intelligence Core
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
          Cardiovascular Risk Prediction Pipeline
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Swasthya AI uses <strong>exactly one ML model</strong> — an explainable, calibrated classifier for cardiovascular disease risk. Everything else is structured agents, deterministic safety rules, and graph traversals.
        </p>
      </div>

      {/* Grid: Left Explainers + Right 3D Heart Model & Anatomical Inspection Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.15fr',
          alignItems: 'start',
          gap: '36px',
        }}
        className="model-split-grid"
      >
        {/* LEFT COLUMN: Pipeline Explainers */}
        <div ref={leftCardsRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <Card 
            className="stagger-card"
            style={{
              padding: '22px 24px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} style={{ color: '#0066FF' }} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '17px', fontWeight: 800 }}>
                1. Purpose & Calibrated Bands
              </h3>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Given a patient's vital measurements, the model estimates the <strong>calibrated probability of cardiovascular disease</strong>, placing the patient in a <strong style={{ color: '#10B981' }}>LOW</strong> (&lt;0.35), <strong style={{ color: '#F59E0B' }}>MEDIUM</strong> (0.35–0.65), or <strong style={{ color: '#EF4444' }}>HIGH</strong> (&gt;0.65) band. It is a decision-support tool, not an unsupervised diagnosis.
            </p>
          </Card>

          <Card 
            className="stagger-card"
            style={{
              padding: '22px 24px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Cpu size={18} style={{ color: '#8B5CF6' }} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '17px', fontWeight: 800 }}>
                2. Dataset & Rigorous Validation
              </h3>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Trained on Kaggle's <strong>Cardiovascular Disease dataset (~70,000 records)</strong> using an 80/20 stratified split. Tested across Logistic Regression, Random Forest, and regularized XGBoost with <strong>5-fold CV</strong> and probability calibration (<code style={{ color: '#8B5CF6' }}>CalibratedClassifierCV</code>). Features include age, gender, BMI, systolic/diastolic BP, pulse pressure, cholesterol, glucose, smoking, and activity.
            </p>
          </Card>

          <Card 
            className="stagger-card"
            style={{
              padding: '22px 24px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={18} style={{ color: '#10B981' }} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '17px', fontWeight: 800 }}>
                3. SHAP Explainability & Missing Data
              </h3>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Every prediction ships with its top SHAP contributing factors (e.g. Systolic BP, Age, Cholesterol). Missing inputs (like unmeasured cholesterol) are imputed via pipeline transformers with missing flags, displaying a clear <em>Actual vs. Estimated</em> confidence level.
            </p>
          </Card>

        </div>

        {/* RIGHT COLUMN: 3D Visualization + Anatomical Inspection Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 3D Heart Anatomy Model Viewport */}
          <Heart3DModel 
            height="400px" 
            pulseRate={1.0}
            selectedStructureId={selectedStructureId}
            onSelectStructure={(id) => setSelectedStructureId(id)}
          />

          {/* Anatomical Structure Inspection Panel */}
          <Card
            style={{
              padding: '24px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} style={{ color: '#EF4444' }} />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Anatomical Landmark Inspection
                </h4>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Select structure to inspect
              </span>
            </div>

            {/* Structure Selection Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {CARDIAC_STRUCTURES.map((struct) => {
                const isSelected = selectedStructureId === struct.id;
                return (
                  <button
                    key={struct.id}
                    onClick={(e) => {
                      animateClick(e.currentTarget);
                      setSelectedStructureId(struct.id);
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '99px',
                      border: isSelected ? '1px solid #EF4444' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-secondary)',
                      color: isSelected ? '#EF4444' : 'var(--text-secondary)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {struct.name}
                  </button>
                );
              })}
            </div>

            {/* Animated Detail Card */}
            <div ref={infoPanelRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                    {activeStructure.name}
                  </h4>
                  <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    {activeStructure.medicalName} • {activeStructure.category}
                  </span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Active Landmark
                </span>
              </div>

              <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {activeStructure.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Hemodynamics
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {activeStructure.hemodynamicFunction}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Clinical Risk Correlate
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {activeStructure.associatedRiskFactor}
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .model-split-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ModelSection;
