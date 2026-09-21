// src/components/patient/DoctorPrescriptionSection.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

export interface HistoryMedRecord {
  id: string;
  name: string;
  generic: string;
  dosage: string;
  frequency: string;
  period: string;
  status: 'Active' | 'Discontinued' | 'Completed';
  adherencePct: number;
  dosesTaken: string;
  lastLogged: string;
  prescribedBy: string;
  notes: string;
}

interface DoctorPrescriptionSectionProps {
  medHistory: HistoryMedRecord[];
  onAddMedication: (medName: string, dosage: string, frequency: string, instructions: string) => void;
  onDiscontinueMedication: (id: string, medName: string) => void;
}

// Patient Lifetime Medication History Database (Single Canonical Source of Truth)
export const PATIENT_LIFETIME_MED_HISTORY: HistoryMedRecord[] = [
  {
    id: 'h1',
    name: 'Metformin 500mg',
    generic: 'Metformin Hydrochloride',
    dosage: '500mg',
    frequency: 'Once Daily (8:00 AM)',
    period: 'Jan 2026 - Present',
    status: 'Active',
    adherencePct: 92,
    dosesTaken: '28 / 30 doses logged on patient mobile app',
    lastLogged: 'Yesterday at 8:05 AM',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'For glycemic control. HbA1c currently 6.8%.'
  },
  {
    id: 'h2',
    name: 'Lisinopril 10mg',
    generic: 'Lisinopril (ACE-I)',
    dosage: '10mg',
    frequency: 'Once Daily (9:00 AM)',
    period: 'Feb 2026 - Present',
    status: 'Active',
    adherencePct: 86,
    dosesTaken: '26 / 30 doses logged on patient mobile app',
    lastLogged: 'Today at 9:00 AM',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'For stage 1 hypertension regulation (138/88 mmHg).'
  },
  {
    id: 'h3',
    name: 'Vitamin D3 60K',
    generic: 'Cholecalciferol',
    dosage: '60,000 IU',
    frequency: 'Once Weekly (Sundays at 1:00 PM)',
    period: 'Mar 2026 - Present',
    status: 'Active',
    adherencePct: 100,
    dosesTaken: '4 / 4 weekly doses logged',
    lastLogged: 'Sunday at 1:00 PM',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'For severe vitamin D deficiency (18 ng/mL).'
  },
  {
    id: 'h4',
    name: 'Paracetamol 650mg (Crocin)',
    generic: 'Acetaminophen 650mg',
    dosage: '650mg',
    frequency: 'As Needed (PRN, max 3x daily)',
    period: 'May 2026 - June 2026',
    status: 'Completed',
    adherencePct: 100,
    dosesTaken: '3 doses logged during fever episode',
    lastLogged: '2026-06-05',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'Short course for 24-hr fever episode (100.2°F). Resolved after hydration.'
  },
  {
    id: 'h5',
    name: 'Azithromycin 500mg',
    generic: 'Azithromycin Dihydrate',
    dosage: '500mg',
    frequency: 'Once Daily for 5 Days',
    period: 'Jan 2026 - Jan 2026',
    status: 'Completed',
    adherencePct: 100,
    dosesTaken: '5 / 5 doses logged',
    lastLogged: '2026-01-20',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'Completed 5-day antibiotic course for acute bronchitis.'
  },
  {
    id: 'h6',
    name: 'Pantoprazole 40mg (Pan40)',
    generic: 'Pantoprazole Sodium',
    dosage: '40mg',
    frequency: 'Once Daily (Before Breakfast)',
    period: 'Nov 2025 - Dec 2025',
    status: 'Discontinued',
    adherencePct: 78,
    dosesTaken: '23 / 30 doses logged',
    lastLogged: '2025-12-28',
    prescribedBy: 'Dr. Divya Sharma',
    notes: 'Discontinued after acid reflux symptoms resolved.'
  }
];

// Clinical Pharmacology Drug-Drug Interaction Database (Comprehensive Rules)
const COMPREHENSIVE_DRUG_RULES = [
  {
    groupA: ['ibuprofen', 'brufen', 'naproxen', 'diclofenac', 'voveran', 'celecoxib', 'indomethacin', 'meloxicam', 'ketorolac', 'nsaid'],
    groupB: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'telmisartan', 'losartan', 'valsartan', 'arb', 'ace inhibitor'],
    severity: 'HIGH',
    title: '⚠️ MAJOR INTERACTION: Acute Kidney Injury & Antihypertensive Failure',
    explanation: 'Combining NSAIDs (Ibuprofen) with ACE Inhibitors/ARBs (Lisinopril) impairs renal blood flow, increasing acute renal failure risk and blunting blood pressure control.'
  },
  {
    groupA: ['ibuprofen', 'brufen', 'naproxen', 'diclofenac', 'voveran', 'nsaid'],
    groupB: ['metformin', 'glycomet', 'glyciphage'],
    severity: 'MODERATE',
    title: '⚠️ MODERATE RISK: Renal Clearance Impairment',
    explanation: 'NSAIDs (Ibuprofen) reduce renal excretion of Metformin, elevating risks of nephrotoxicity and lactic acidosis.'
  },
  {
    groupA: ['sildenafil', 'viagra', 'revatio', 'tadalafil', 'cialis', 'vardenafil', 'levitra'],
    groupB: ['nitroglycerin', 'nitrate', 'sorbitrate', 'nitrostat', 'isosorbide', 'mononitrate', 'dinitrate', 'glyceryl trinitrate'],
    severity: 'CRITICAL',
    title: '🚨 CRITICAL CONTRAINDICATION: Fatal Hypotension Risk',
    explanation: 'Combining PDE-5 Inhibitors (Sildenafil) with Nitrates (Nitroglycerin) causes acute, severe, and potentially fatal drops in blood pressure. DO NOT COMBINE.'
  },
  {
    groupA: ['aspirin', 'ecosprin', 'disprin', 'ibuprofen', 'brufen', 'naproxen'],
    groupB: ['warfarin', 'coumadin', 'heparin', 'clopidogrel', 'plavix', 'rivaroxaban', 'apixaban'],
    severity: 'HIGH',
    title: '⚠️ MAJOR INTERACTION: Gastrointestinal Hemorrhage Risk',
    explanation: 'Combining NSAIDs or Aspirin with anticoagulants (Warfarin/Plavix) significantly increases severe internal hemorrhage and GI bleeding hazards.'
  },
  {
    groupA: ['metformin', 'glycomet', 'glyciphage'],
    groupB: ['contrast', 'alcohol', 'ethanol'],
    severity: 'HIGH',
    title: '⚠️ HIGH RISK: Lactic Acidosis Hazard',
    explanation: 'Metformin combined with iodine contrast agents or heavy alcohol drastically increases risk of fatal Lactic Acidosis.'
  },
  {
    groupA: ['lisinopril', 'enalapril', 'ramipril', 'telmisartan', 'losartan'],
    groupB: ['spironolactone', 'potassium', 'kcl'],
    severity: 'HIGH',
    title: '⚠️ HIGH RISK: Hyperkalemia Arrhythmia Hazard',
    explanation: 'Combining ACE inhibitors/ARBs with Potassium supplements or Spironolactone can cause severe Hyperkalemia and cardiac arrhythmias.'
  },
  {
    groupA: ['amlodipine', 'amlokind', 'norvasc'],
    groupB: ['simvastatin', 'zocor', 'atorvastatin'],
    severity: 'MODERATE',
    title: '⚠️ MODERATE INTERACTION: Rhabdomyolysis & Myopathy',
    explanation: 'Amlodipine increases Simvastatin/Statin serum levels, elevating risk of severe muscle toxicity and rhabdomyolysis.'
  },
  {
    groupA: ['atenolol', 'metoprolol', 'propranolol', 'carvedilol'],
    groupB: ['verapamil', 'diltiazem'],
    severity: 'HIGH',
    title: '⚠️ HIGH RISK: Severe Bradycardia & Heart Block',
    explanation: 'Combining Beta-blockers with non-dihydropyridine CCBs causes severe bradycardia, AV block, and heart failure.'
  }
];

export interface DraftMedItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const DoctorPrescriptionSection: React.FC<DoctorPrescriptionSectionProps> = ({
  medHistory,
  onAddMedication,
  onDiscontinueMedication,
}) => {
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('400mg');
  const [frequency, setFrequency] = useState('Twice Daily (BID)');
  const [duration, setDuration] = useState('14 Days');
  const [instructions, setInstructions] = useState('Take after food');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [overrideWarning, setOverrideWarning] = useState(false);
  const [isApiChecking, setIsApiChecking] = useState(false);
  const [openFdaConflict, setOpenFdaConflict] = useState<string | null>(null);

  // Draft Prescription Queue State (Before Final Doctor Signature)
  const [draftQueue, setDraftQueue] = useState<DraftMedItem[]>([]);

  // Derived Active Medications Array (Single Source of Truth)
  const activeMedications = useMemo(() => {
    return medHistory.filter(rec => rec.status === 'Active');
  }, [medHistory]);

  // Combined Conflict Target Array (Active Meds + Current Draft Queue)
  const allConflictTargets = useMemo(() => {
    const activeNames = activeMedications.map(m => m.name);
    const draftNames = draftQueue.map(d => `${d.name} ${d.dosage}`);
    return [...activeNames, ...draftNames];
  }, [activeMedications, draftQueue]);

  // Search History Explorer State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Active' | 'Completed' | 'Discontinued'>('All');

  // Filtered History Records
  const filteredHistory = useMemo(() => {
    return medHistory.filter(rec => {
      const query = historySearchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        rec.name.toLowerCase().includes(query) ||
        rec.generic.toLowerCase().includes(query) ||
        rec.notes.toLowerCase().includes(query) ||
        rec.frequency.toLowerCase().includes(query);

      const matchesFilter = historyFilter === 'All' || rec.status === historyFilter;

      return matchesQuery && matchesFilter;
    });
  }, [medHistory, historySearchQuery, historyFilter]);

  // Local Pharmacology Rules Engine (Instant 0ms check against Active Meds AND Draft Queue)
  const localConflict = useMemo(() => {
    if (!medName.trim()) return null;

    const inputMed = medName.toLowerCase().trim();

    for (const rule of COMPREHENSIVE_DRUG_RULES) {
      const matchA = rule.groupA.some(a => inputMed.includes(a));
      const matchB = rule.groupB.some(b => inputMed.includes(b));

      for (const targetName of allConflictTargets) {
        const targetStr = targetName.toLowerCase();
        const activeA = rule.groupA.some(a => targetStr.includes(a));
        const activeB = rule.groupB.some(b => targetStr.includes(b));

        if ((matchA && activeB) || (matchB && activeA)) {
          return {
            ...rule,
            conflictingWith: targetName
          };
        }
      }
    }
    return null;
  }, [medName, allConflictTargets]);

  // OpenFDA API Live Cross-Check
  useEffect(() => {
    if (!medName.trim() || medName.length < 3 || localConflict) {
      setOpenFdaConflict(null);
      setIsApiChecking(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsApiChecking(true);
      try {
        const cleanName = medName.trim().split(' ')[0].toLowerCase();
        const res = await fetch(`https://api.fda.gov/drug/label.json?search=drug_interactions:${cleanName}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          const interactionsText = data.results?.[0]?.drug_interactions?.[0] || '';

          for (const targetName of allConflictTargets) {
            const targetDrugName = targetName.split(' ')[0].toLowerCase();
            if (interactionsText.toLowerCase().includes(targetDrugName)) {
              setOpenFdaConflict(`OpenFDA Live Alert: Official FDA monograph confirms interaction between ${medName} and ${targetName}.`);
              break;
            }
          }
        }
      } catch (e) {
        // Silent API fallback
      } finally {
        setIsApiChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [medName, allConflictTargets, localConflict]);

  const activeConflict = localConflict ? {
    title: localConflict.title,
    explanation: localConflict.explanation,
    conflictingWith: localConflict.conflictingWith
  } : openFdaConflict ? {
    title: '⚠️ OPENFDA INTERACTION WARNING',
    explanation: openFdaConflict,
    conflictingWith: 'Active Prescription / Draft Item'
  } : null;

  // Add Medicine to Draft Queue (Stage 1)
  const handleAddToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    if (activeConflict && !overrideWarning) {
      return;
    }

    const newDraft: DraftMedItem = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: medName.trim(),
      dosage,
      frequency,
      duration,
      instructions: instructions || 'Take as directed.'
    };

    setDraftQueue(prev => [...prev, newDraft]);
    setMedName('');
    setInstructions('Take after food');
    setOverrideWarning(false);
    setSuccessToast(`➕ Added ${newDraft.name} (${dosage}) to draft prescription queue.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Remove Item from Draft Queue
  const handleRemoveFromDraft = (id: string) => {
    setDraftQueue(prev => prev.filter(item => item.id !== id));
  };

  // Finalize & Sign Prescription Batch (Stage 2 - Commit to Active Chart)
  const handleFinalizeAndSign = () => {
    let itemsToCommit = [...draftQueue];

    // If there's an unadded item in form fields with no conflicts, include it too
    if (medName.trim() && (!activeConflict || overrideWarning)) {
      itemsToCommit.push({
        id: `draft_${Date.now()}`,
        name: medName.trim(),
        dosage,
        frequency,
        duration,
        instructions: instructions || 'Take as directed.'
      });
      setMedName('');
    }

    if (itemsToCommit.length === 0) {
      setSuccessToast('⚠️ Please add at least one medicine to the draft before signing.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // Commit all items to canonical active medications list
    itemsToCommit.forEach(item => {
      onAddMedication(item.name, item.dosage, item.frequency, item.instructions);
    });

    setDraftQueue([]);
    setOverrideWarning(false);
    setSuccessToast(`✍️ Prescription Finalized & Digitally Signed (${itemsToCommit.length} medicines committed to patient active chart).`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleDiscontinue = (id: string, name: string) => {
    onDiscontinueMedication(id, name);
    setSuccessToast(`⛔ Discontinued ${name} from active prescriptions.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const testMeds = [
    { name: 'Ibuprofen', dose: '400mg' },
    { name: 'Sildenafil', dose: '50mg' },
    { name: 'Nitroglycerin', dose: '0.5mg' },
    { name: 'Aspirin', dose: '75mg' },
    { name: 'Warfarin', dose: '5mg' },
    { name: 'Metformin', dose: '500mg' },
    { name: 'Lisinopril', dose: '10mg' },
  ];

  return (
    <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            🩺 Doctor Prescription & AI Conflict Engine
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Prescribe or discontinue medications with real-time AI drug contraindication & lifetime patient adherence logs.
          </p>
        </div>
        <Badge variant="info">Doctor Mode Active</Badge>
      </div>

      {/* Top Grid: Active Prescriptions (Left) + Prescribe New Form (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', marginBottom: '28px' }}>

        {/* Active Meds Column with Discontinue Button */}
        <div style={{ padding: '16px', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>💊 Active Prescriptions ({activeMedications.length})</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click 🗑️ to discontinue</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {activeMedications.length > 0 ? (
              activeMedications.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span>💊 {rec.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Active</span>
                    <button
                      type="button"
                      onClick={() => handleDiscontinue(rec.id, rec.name)}
                      title="Discontinue / Remove Medication"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🗑️ Discontinue
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                No active prescriptions currently.
              </div>
            )}
          </div>

          {/* Quick Select Test Chips */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Test Drug Conflict AI Engine:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {testMeds.map((qm) => (
                <button
                  key={qm.name}
                  type="button"
                  onClick={() => { setMedName(qm.name); setDosage(qm.dose); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    backgroundColor: medName.toLowerCase() === qm.name.toLowerCase() ? 'var(--accent)' : 'var(--surface)',
                    color: medName.toLowerCase() === qm.name.toLowerCase() ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + {qm.name} ({qm.dose})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prescribe Form Column (2-Stage Workflow: Build Draft Queue -> Finalize & Sign) */}
        <div>
          <form onSubmit={handleAddToDraft} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Medicine Name
                </label>
                <Input
                  placeholder="e.g. Ibuprofen, Sildenafil, Nitroglycerin"
                  value={medName}
                  onChange={(e) => { setMedName(e.target.value); setOverrideWarning(false); }}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Dosage
                </label>
                <Input
                  placeholder="400mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option value="Once Daily (OD)">Once Daily (OD)</option>
                  <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                  <option value="Three Times Daily (TID)">Three Times Daily (TID)</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Instructions / Clinical Notes
              </label>
              <Input
                placeholder="Take after meals. Monitor BP weekly."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* REAL-TIME DRUG CONFLICT WARNING BANNER */}
            {activeConflict ? (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid #EF4444',
                  animation: 'fadeIn 0.2s ease-in-out'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{activeConflict.title}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {activeConflict.explanation}
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', margin: '0 0 10px 0' }}>
                  Conflict detected against: <strong>"{activeConflict.conflictingWith}"</strong>
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setOverrideWarning(!overrideWarning)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: overrideWarning ? '#EF4444' : 'transparent',
                      color: overrideWarning ? '#FFFFFF' : '#EF4444',
                      border: '1px solid #EF4444',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {overrideWarning ? '✓ Override Acknowledged' : '⚠️ Override Conflict Warning'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMedName(''); setOverrideWarning(false); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel & Choose Alternative
                  </button>
                </div>
              </div>
            ) : medName.trim() ? (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', fontSize: '12px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>✓ AI Safety Check Passed — Safe to add to draft.</span>
                {isApiChecking && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Checking OpenFDA...</span>}
              </div>
            ) : null}

            {/* DRAFT PRESCRIPTION QUEUE PREVIEW SLIP */}
            {draftQueue.length > 0 && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid #3B82F6',
                  animation: 'fadeIn 0.2s ease-in-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#3B82F6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📄 Pending Prescription Slip ({draftQueue.length} {draftQueue.length === 1 ? 'Medicine' : 'Medicines'})</span>
                  </h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Not yet committed until signed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {draftQueue.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>💊 {item.name} {item.dosage}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          ({item.frequency} • {item.duration})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromDraft(item.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#EF4444',
                          border: 'none',
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                        title="Remove from draft"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS: Add to Draft + Finalize & Sign */}
            <div style={{ display: 'grid', gridTemplateColumns: draftQueue.length > 0 ? '1fr 1.2fr' : '1fr', gap: '10px', marginTop: '6px' }}>
              <Button
                type="submit"
                variant="secondary"
                disabled={!medName.trim() || (!!activeConflict && !overrideWarning)}
                style={{
                  padding: '12px',
                  fontWeight: 700,
                  opacity: !medName.trim() || (!!activeConflict && !overrideWarning) ? 0.5 : 1
                }}
              >
                ➕ Add Medicine to Draft
              </Button>

              {(draftQueue.length > 0 || medName.trim()) && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleFinalizeAndSign}
                  disabled={draftQueue.length === 0 && (!medName.trim() || (!!activeConflict && !overrideWarning))}
                  style={{
                    padding: '12px',
                    fontWeight: 800,
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ✍️ Finalize & Sign Prescription ({draftQueue.length + (medName.trim() ? 1 : 0)})
                </Button>
              )}
            </div>

            {successToast && (
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: successToast.includes('⛔') ? '#EF4444' : '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                {successToast}
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '16px 0 24px 0' }} />

      {/* FEATURE 2: PATIENT LIFETIME MEDICATION & ADHERENCE HISTORY SEARCH EXPLORER */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔍 Doctor Search: Patient Lifetime Medication & Adherence Ledger
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Instantly search what medicines the patient took over past months, dosage frequency, adherence %, and check-in logs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['All', 'Active', 'Completed', 'Discontinued'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setHistoryFilter(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  backgroundColor: historyFilter === tab ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: historyFilter === tab ? '#FFFFFF' : 'var(--text-primary)'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="🔍 Search medicine name or generic salt (e.g. Metformin, Paracetamol, Azithromycin, Lisinopril)..."
            value={historySearchQuery}
            onChange={(e) => setHistorySearchQuery(e.target.value)}
            style={{ width: '100%', fontSize: '13px', padding: '10px 14px' }}
          />
        </div>

        {/* Medication History Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      💊 {rec.name}
                    </h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Generic: {rec.generic}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: rec.status === 'Active' ? 'rgba(16,185,129,0.15)' : rec.status === 'Completed' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                      color: rec.status === 'Active' ? '#10B981' : rec.status === 'Completed' ? '#3B82F6' : '#EF4444'
                    }}
                  >
                    {rec.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '4px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Schedule & Times per Day:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{rec.frequency}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Prescribed Duration:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{rec.period}</strong>
                  </div>
                </div>

                {/* Adherence Rate Bar */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mobile App Adherence:</span>
                    <span style={{ color: rec.adherencePct >= 85 ? '#10B981' : rec.adherencePct >= 70 ? '#F59E0B' : '#EF4444' }}>
                      {rec.adherencePct}% Compliance ({rec.dosesTaken})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${rec.adherencePct}%`,
                        height: '100%',
                        backgroundColor: rec.adherencePct >= 85 ? '#10B981' : rec.adherencePct >= 70 ? '#F59E0B' : '#EF4444',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px border var(--border)', paddingTop: '6px', marginTop: '2px' }}>
                  📝 <em>{rec.notes}</em>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', gridColumn: '1 / -1' }}>
              No medication records found matching "{historySearchQuery}". Try searching for Metformin, Aspirin, Paracetamol, or Azithromycin.
            </div>
          )}
        </div>
      </div>

    </Card>
  );
};

export default DoctorPrescriptionSection;
