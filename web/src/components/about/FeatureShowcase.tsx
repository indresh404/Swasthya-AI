// src/components/about/FeatureShowcase.tsx
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mic, 
  Calendar, 
  Activity, 
  Users, 
  ShieldAlert, 
  DollarSign, 
  MapPin, 
  Heart, 
  Watch, 
  RefreshCw, 
  QrCode, 
  FileText, 
  Sliders, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import Card from '../ui/Card';

interface FeatureItem {
  icon: React.ReactNode;
  name: string;
  surface: 'Patient App' | 'Doctor Dashboard' | 'Both Surfaces';
  description: string;
  tag: string;
}

const ALL_FEATURES: FeatureItem[] = [
  {
    icon: <MessageSquare size={22} style={{ color: '#0066FF' }} />,
    name: "Conversational Onboarding",
    surface: "Patient App",
    tag: "Voice / Text",
    description: "No tedious forms. An empathetic multi-turn AI conversation extracts chronic conditions, medicines, allergies, surgeries, and family history into graph nodes."
  },
  {
    icon: <Mic size={22} style={{ color: '#0066FF' }} />,
    name: "Sarvam AI Multilingual Voice",
    surface: "Patient App",
    tag: "Speech-to-Speech",
    description: "Speak or type in Hindi, Marathi, or English. Audio is transcribed via Sarvam AI, symptoms are extracted, and personalized audio responses are synthesized."
  },
  {
    icon: <Calendar size={22} style={{ color: '#0066FF' }} />,
    name: "Daily Adaptive Check-In",
    surface: "Patient App",
    tag: "Dynamic Memory",
    description: "Generates 2 to 3 adaptive daily questions derived from the patient's own past history (e.g. 'How is your back pain compared to 3 days ago?'). Never static."
  },
  {
    icon: <Activity size={22} style={{ color: '#0066FF' }} />,
    name: "3D Anatomical Symptom Heatmap",
    surface: "Both Surfaces",
    tag: "3D Visualization",
    description: "Interactive 3D body model highlighting hotspots based on symptom frequency and recency. Semi-transparent rendering keeps internal risk markers visible."
  },
  {
    icon: <Users size={22} style={{ color: '#0066FF' }} />,
    name: "Family Group & Genetic Traversal",
    surface: "Patient App",
    tag: "Privacy Graph",
    description: "Create or join a family circle via Code/QR. Each member's record remains private, while hereditary risk context (father's diabetes -> user's risk) propagates."
  },
  {
    icon: <ShieldAlert size={22} style={{ color: '#EF4444' }} />,
    name: "Gating OpenFDA Drug Conflict Checker",
    surface: "Both Surfaces",
    tag: "Hard Safety Gate",
    description: "Every new medicine is synchronously checked against active prescriptions through OpenFDA before it is saved. Prevents dangerous adverse interactions."
  },
  {
    icon: <DollarSign size={22} style={{ color: '#10B981' }} />,
    name: "Jan Aushadhi Price Savings",
    surface: "Patient App",
    tag: "Generic Subsidy",
    description: "Compares expensive branded prescriptions with Jan Aushadhi generic equivalents, calculates real savings, and exports a pharmacist-ready summary PDF."
  },
  {
    icon: <MapPin size={22} style={{ color: '#10B981' }} />,
    name: "Jan Aushadhi Store Locator",
    surface: "Patient App",
    tag: "Affordable Access",
    description: "Integrated dataset lookup allowing patients to locate nearest government Jan Aushadhi Kendra pharmacy outlets across Indian cities."
  },
  {
    icon: <Heart size={22} style={{ color: '#EF4444' }} />,
    name: "Cardiovascular Risk Score",
    surface: "Both Surfaces",
    tag: "Calibrated ML",
    description: "Calculates calibrated CVD risk probability and places patients in LOW / MEDIUM / HIGH bands alongside exact SHAP factor breakdowns."
  },
  {
    icon: <Watch size={22} style={{ color: '#8B5CF6' }} />,
    name: "Smartwatch Simulator",
    surface: "Patient App",
    tag: "Telemetry Ingestion",
    description: "Demonstration simulator streaming heart rate, SpO2, and blood pressure into the health graph to trigger preemptive risk evaluations."
  },
  {
    icon: <RefreshCw size={22} style={{ color: '#0066FF' }} />,
    name: "Closed-Loop Doctor Q&A",
    surface: "Both Surfaces",
    tag: "Self-Healing Loop",
    description: "When a doctor asks a question lacking graph records, the system rewrites it into a patient-friendly prompt for the next check-in to close the loop."
  },
  {
    icon: <QrCode size={22} style={{ color: '#0066FF' }} />,
    name: "Instant QR / ID Patient Lookup",
    surface: "Doctor Dashboard",
    tag: "Rapid Intake",
    description: "Clinicians scan a QR code or enter an ID to load the patient's full longitudinal health story in seconds, cutting the 10-minute visit reconstruction in half."
  }
];

export const FeatureShowcase: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Patient App' | 'Doctor Dashboard'>('All');

  const filteredFeatures = ALL_FEATURES.filter(f => {
    if (filter === 'All') return true;
    return f.surface === filter || f.surface === 'Both Surfaces';
  });

  return (
    <div 
      className="features-showcase-container"
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px', boxSizing: 'border-box' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Comprehensive Surface Capabilities
          </span>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
          Platform Clinical Modules & Surfaces
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          Designed across two unified interfaces: the <strong>Patient App (React Native + Expo)</strong> for building health memory and the <strong>Doctor Dashboard (React + Vite)</strong> for rapid clinical synthesis.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {['All', 'Patient App', 'Doctor Dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              style={{
                padding: '8px 18px',
                borderRadius: '99px',
                border: filter === tab ? '1.5px solid #0066FF' : '1px solid var(--border)',
                backgroundColor: filter === tab ? 'rgba(0, 102, 255, 0.08)' : 'var(--surface)',
                color: filter === tab ? '#0066FF' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div 
        style={{ 
          boxSizing: 'border-box' 
        }} 
        className="clinical-modules-grid"
      >
        {filteredFeatures.map((f, idx) => (
          <Card
            key={idx}
            hoverable
            className="clinical-module-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '24px',
              backgroundColor: 'var(--surface)',
              borderRadius: '20px',
              height: '100%',
              boxSizing: 'border-box',
              border: '1.5px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 102, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {f.icon}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#0066FF',
                  backgroundColor: 'rgba(0, 102, 255, 0.08)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}
              >
                {f.tag}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                {f.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {f.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <style>{`
        .clinical-modules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .clinical-module-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .clinical-module-card:hover {
          border-color: #0066FF !important;
          background-color: rgba(0, 102, 255, 0.02) !important;
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.1) !important;
          transform: translateY(-3px);
        }

        @media (max-width: 1024px) {
          .clinical-modules-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .features-showcase-container {
            padding: 0 16px 40px 16px !important;
          }
          .clinical-modules-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .features-showcase-container h2 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureShowcase;
