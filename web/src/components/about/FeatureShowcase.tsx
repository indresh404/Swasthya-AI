// src/components/about/FeatureShowcase.tsx
import React from 'react';
import { 
  MessageSquare, 
  Mic, 
  Calendar, 
  Activity, 
  Users, 
  ShieldAlert, 
  DollarSign,
  FileText
} from 'lucide-react';
import Card from '../ui/Card';

const FEATURES = [
  {
    icon: <MessageSquare size={22} style={{ color: 'var(--accent)' }} />,
    name: "Conversational Onboarding",
    description: "Multi-turn natural dialogue that replaces long medical forms, extracting initial conditions, medication records, allergies, and family history into the graph."
  },
  {
    icon: <Mic size={22} style={{ color: 'var(--accent)' }} />,
    name: "Voice-Enabled Chatbot",
    description: "Multilingual dialogue engine (Hindi, Marathi, English) via Sarvam AI. Transcribes patient voices, extracts symptoms, and maps them to past health patterns."
  },
  {
    icon: <Calendar size={22} style={{ color: 'var(--accent)' }} />,
    name: "Daily Adaptive Check-In",
    description: "Tailored check-in routines generating 2-3 dynamic questions based on current medications, active symptoms, and hereditary genetic risks."
  },
  {
    icon: <Activity size={22} style={{ color: 'var(--accent)' }} />,
    name: "3D Body Heatmap",
    description: "A 3D model highlighting active symptoms and pain zones dynamically based on check-in logs, helping practitioners trace historical patterns."
  },
  {
    icon: <Users size={22} style={{ color: 'var(--accent)' }} />,
    name: "Family Health Graph",
    description: "Traverses relationships in the graph (e.g. father -> diabetes -> user's elevated risk) without exposing any individual patient's private record."
  },
  {
    icon: <ShieldAlert size={22} style={{ color: 'var(--accent)' }} />,
    name: "Drug Interaction Check",
    description: "Performs synchronous OpenFDA checks before any medication reminder is saved, alerting the user about critical conflicts immediately."
  },
  {
    icon: <DollarSign size={22} style={{ color: 'var(--accent)' }} />,
    name: "Jan Aushadhi Savings",
    description: "Cross-checks branded prescriptions against the government generic medicine index, calculating savings and exporting generic alternatives for pharmacists."
  },
  {
    icon: <FileText size={22} style={{ color: 'var(--accent)' }} />,
    name: "Government Scheme Matcher",
    description: "Verifies income certificates and matches eligible low-income patients automatically with Ayushman Bharat and state insurance schemes."
  }
];

export const FeatureShowcase: React.FC = () => {
  return (
    <div 
      className="features-showcase-container"
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px', boxSizing: 'border-box' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
          Platform Clinical Modules
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Explore the clinical features and modules that drive Swasthya AI's health analytics.
        </p>
      </div>

      <div 
        style={{ 
          boxSizing: 'border-box' 
        }} 
        className="clinical-modules-grid"
      >
        {FEATURES.map((f, idx) => (
          <Card
            key={idx}
            hoverable
            className="clinical-module-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px 28px',
              backgroundColor: 'var(--surface)',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {f.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
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
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .clinical-module-card {
          border: 1.5px solid var(--border) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .clinical-module-card:hover {
          border-color: #0066FF !important;
          background-color: rgba(0, 102, 255, 0.04) !important;
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.1) !important;
          transform: translateY(-4px);
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
