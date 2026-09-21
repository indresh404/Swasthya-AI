import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientRecord } from '../data/clinicalData';
import PatientHeader from '../components/patient/PatientHeader';
import PatientBodyModel, { HeatPoint } from '../components/patient/PatientBodyModel';
import PatientHealthGraph from '../components/patient/PatientHealthGraph';
import PatientRiskTrend from '../components/patient/PatientRiskTrend';
import PatientSymptomTimeline from '../components/patient/PatientSymptomTimeline';
import PatientFamilyPanel from '../components/patient/PatientFamilyPanel';
import PatientAIInsights from '../components/patient/PatientAIInsights';
import DoctorPrescriptionSection, { HistoryMedRecord, PATIENT_LIFETIME_MED_HISTORY } from '../components/patient/DoctorPrescriptionSection';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// Indresh Suresh's actual clinical hotspots mapping
const INDRESH_HEATPOINTS: HeatPoint[] = [
  {
    id: "head",
    label: "Head & Cranial",
    description: "Localized frontal headache, severity 5/10 logged.",
    position: [0, 1.8, 0],
    color: "#EAB308", // Yellow
    intensity: 0.6
  },
  {
    id: "back",
    label: "Adrenal & Lower Back",
    description: "High recurring fatigue (3 logs this month, severity 7/10).",
    position: [0, 0.8, -0.15],
    color: "#EF4444", // Red
    intensity: 0.85
  }
];

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const currentPatient = useMemo(() => getPatientRecord(id), [id]);

  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isQueued, setIsQueued] = useState(false);

  // Dynamic Patient Medication History State initialized per patient
  const [medHistory, setMedHistory] = useState<HistoryMedRecord[]>(() => {
    return currentPatient.medications.map((m, idx) => ({
      id: `patient_med_${idx}`,
      name: m,
      generic: `${m.split(' ')[0]} Active Compound`,
      dosage: m.split(' ')[1] || 'As Directed',
      frequency: 'Once Daily (8:00 AM)',
      period: 'Jan 2026 - Present',
      status: 'Active',
      adherencePct: 92 - idx * 6,
      dosesTaken: `${28 - idx * 2} / 30 doses logged on mobile app`,
      lastLogged: 'Today at 8:05 AM',
      prescribedBy: 'Dr. Divya Sharma',
      notes: 'Monitored daily on patient mobile app.'
    }));
  });

  // Re-sync medication state when switching patient profile routes
  useEffect(() => {
    setMedHistory(
      currentPatient.medications.map((m, idx) => ({
        id: `patient_med_${idx}`,
        name: m,
        generic: `${m.split(' ')[0]} Active Compound`,
        dosage: m.split(' ')[1] || 'As Directed',
        frequency: 'Once Daily (8:00 AM)',
        period: 'Jan 2026 - Present',
        status: 'Active',
        adherencePct: 92 - idx * 6,
        dosesTaken: `${28 - idx * 2} / 30 doses logged on mobile app`,
        lastLogged: 'Today at 8:05 AM',
        prescribedBy: 'Dr. Divya Sharma',
        notes: 'Monitored daily on patient mobile app.'
      }))
    );
  }, [currentPatient]);

  const handleAddMedication = (name: string, dosage: string, frequency: string, instructions: string) => {
    const cleanBaseName = name.trim().split(' ')[0].toLowerCase();

    setMedHistory(prev => {
      // De-duplicate: check if this medication compound already exists in history
      const existingIdx = prev.findIndex(rec => {
        const recBaseName = rec.name.toLowerCase().split(' ')[0];
        return recBaseName.includes(cleanBaseName) || cleanBaseName.includes(recBaseName);
      });

      if (existingIdx !== -1) {
        // Update existing record to Active with new dosage & instructions
        const updated = [...prev];
        const startPeriod = updated[existingIdx].period.split(' - ')[0] || 'Sep 2026';
        updated[existingIdx] = {
          ...updated[existingIdx],
          name: `${name.trim()} ${dosage}`,
          dosage: dosage || updated[existingIdx].dosage,
          frequency: frequency || updated[existingIdx].frequency,
          period: `${startPeriod} - Present`,
          status: 'Active',
          notes: instructions || 'Updated prescription by doctor.'
        };
        return updated;
      } else {
        // Add new record
        const newRecord: HistoryMedRecord = {
          id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: `${name.trim()} ${dosage}`,
          generic: `${name.trim()} Active Compound`,
          dosage: dosage || 'As Directed',
          frequency: frequency || 'Once Daily',
          period: 'Sep 2026 - Present',
          status: 'Active',
          adherencePct: 100,
          dosesTaken: 'Newly prescribed by doctor',
          lastLogged: 'Just prescribed',
          prescribedBy: 'Dr. Divya Sharma',
          notes: instructions || 'Newly prescribed.'
        };
        return [newRecord, ...prev];
      }
    });
  };

  const handleDiscontinueMedication = (id: string, name: string) => {
    const cleanBaseName = name.trim().split(' ')[0].toLowerCase();

    setMedHistory(prev => prev.map(rec => {
      const recBaseName = rec.name.toLowerCase().split(' ')[0];
      // Match by exact ID OR drug base name to guarantee 100% uniformity across all panels
      if (rec.id === id || recBaseName.includes(cleanBaseName) || cleanBaseName.includes(recBaseName)) {
        const startPeriod = rec.period.includes(' - ') ? rec.period.split(' - ')[0] : 'Jan 2026';
        return {
          ...rec,
          status: 'Discontinued' as const,
          period: `${startPeriod} - Discontinued Today`
        };
      }
      return rec;
    }));
  };

  const handleQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuery.trim()) return;

    const query = qaQuery.toLowerCase();
    
    // Semantic answer matching
    if (query.includes('fatigue') || query.includes('tired') || query.includes('exhausted')) {
      setQaAnswer("Indresh's fatigue is closely coupled with late sleeping habits (retires past 1:30 AM) and insufficient sleep duration (6 hours average). Critically, Vitamin D3 levels are severely deficient (18 ng/mL), acting as a physiological metabolic blocker.");
      setIsQueued(false);
    } else if (query.includes('sugar') || query.includes('diabetes') || query.includes('hba1c') || query.includes('glucose')) {
      setQaAnswer("HbA1c stands at 6.8% (glycemic load in diabetic threshold). Indresh takes Metformin 500mg daily. Prediabetes is genetic (Mother: prediabetic). High desk screen time (10+ hrs) and sedentary behaviors are major lifestyle factors.");
      setIsQueued(false);
    } else if (query.includes('bp') || query.includes('blood pressure') || query.includes('hypertension')) {
      setQaAnswer("Blood pressure is elevated at 138/88 mmHg. Indresh takes Lisinopril 10mg daily for pressure regulation. Parent nodes indicate Father has documented hypertension.");
      setIsQueued(false);
    } else {
      setQaAnswer(null);
      setIsQueued(true);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
      
      {/* 1. Header and Vitals row */}
      <PatientHeader patient={currentPatient} />

      {/* 2. SECTION 1: Knowledge Graph + 3D Anatomical Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="patient-grid-responsive">
        <div>
          <PatientHealthGraph />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
            Dynamic Symptom Heatmap
          </h3>
          <PatientBodyModel heatPoints={INDRESH_HEATPOINTS} height="520px" />
        </div>
      </div>

      {/* 3. SECTION 2: Risk Trajectory + Doctor Q&A Agent Loop */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="patient-grid-responsive">
        <PatientRiskTrend />

        {/* Doctor QA Panel */}
        <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              Doctor Q&A Agent Loop
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
              Query the patient's records. Unresolvable clinical questions are queued for the patient's next check-in.
            </p>

            <form onSubmit={handleQaSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <Input
                placeholder="Ask about fatigue, blood pressure, sugar, etc."
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary">Ask Agent</Button>
            </form>

            {qaAnswer && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius)', backgroundColor: 'var(--accent-light)', borderLeft: '4px solid var(--accent)', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)', animation: 'fadeIn 0.2s ease-out' }}>
                💡 <strong>Agent response:</strong> {qaAnswer}
              </div>
            )}

            {isQueued && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius)', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #EAB308', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)', animation: 'fadeIn 0.2s ease-out' }}>
                ⏳ <strong>Loop queued:</strong> The system doesn't have this record yet. A patient-friendly question has been queued for Indresh's next daily check-in check.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 4. SECTION 3: DOCTOR PRESCRIPTION & REAL-TIME DRUG CONFLICT ENGINE */}
      <DoctorPrescriptionSection
        medHistory={medHistory}
        onAddMedication={handleAddMedication}
        onDiscontinueMedication={handleDiscontinueMedication}
      />

      {/* 5. SECTION 4: AI Insights, Family Risk & Symptom History Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }} className="patient-grid-responsive">
        
        {/* Left Sub-Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PatientAIInsights />
          <PatientFamilyPanel />
        </div>

        {/* Right Sub-Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PatientSymptomTimeline />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .patient-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientProfile;
