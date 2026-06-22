// src/components/about/HealthMemoryBuilder.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Volume2, 
  Database,
  CheckCircle2,
  FileText,
  Workflow,
  User,
  Users
} from 'lucide-react';
import Card from '../ui/Card';

interface NodeItem {
  id: string;
  label: string;
  type: string;
  details: string;
  x: number;
  y: number;
  step?: number;
}

interface LinkItem {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  step?: number;
}

// ==========================================
// SIMPLIFIED PATIENT GRAPH DATASET
// ==========================================
const GRAPH_DATA = {
  nodes: [
    { id: 'Indresh', label: 'Indresh', type: 'patient', radius: 36 },
    // Categories (7)
    { id: 'cat_facts', label: 'Facts', type: 'category', radius: 20 },
    { id: 'cat_surgeries', label: 'Surgeries', type: 'category', radius: 20 },
    { id: 'cat_medical_history', label: 'Medical History', type: 'category', radius: 20 },
    { id: 'cat_symptoms', label: 'Symptoms', type: 'category', radius: 20 },
    { id: 'cat_diseases', label: 'Diseases', type: 'category', radius: 20 },
    { id: 'cat_habits', label: 'Habits', type: 'category', radius: 20 },
    { id: 'cat_allergies', label: 'Allergies', type: 'category', radius: 20 },
    // Sub-nodes (14)
    { id: 'fac_age', label: '20yo Male', type: 'facts', radius: 12 },
    { id: 'fac_smoker', label: 'Non-Smoker', type: 'facts', radius: 12 },
    { id: 'sur_appendectomy', label: 'Appendectomy', type: 'surgeries', radius: 12 },
    { id: 'his_fracture', label: 'Tibia Fracture', type: 'medicalHistory', radius: 12 },
    { id: 'sym_fever', label: 'Fever', type: 'symptoms', radius: 12 },
    { id: 'sym_headache', label: 'Headache', type: 'symptoms', radius: 12 },
    { id: 'sym_fatigue', label: 'Fatigue', type: 'symptoms', radius: 12 },
    { id: 'dis_t2d', label: 'Type 2 Diabetes', type: 'disease', radius: 12 },
    { id: 'dis_htn', label: 'Hypertension', type: 'disease', radius: 12 },
    { id: 'hab_late', label: 'Late Sleeping', type: 'habits', radius: 12 },
    { id: 'hab_screen', label: 'Excess Screen', type: 'habits', radius: 12 },
    { id: 'alg_dust', label: 'Dust', type: 'allergies', radius: 12 },
    { id: 'alg_pollen', label: 'Pollen', type: 'allergies', radius: 12 },
  ],
  edges: [
    // Hierarchy
    { source: 'Indresh', target: 'cat_facts', weight: 3 },
    { source: 'Indresh', target: 'cat_surgeries', weight: 3 },
    { source: 'Indresh', target: 'cat_medical_history', weight: 3 },
    { source: 'Indresh', target: 'cat_symptoms', weight: 3 },
    { source: 'Indresh', target: 'cat_diseases', weight: 3 },
    { source: 'Indresh', target: 'cat_habits', weight: 3 },
    { source: 'Indresh', target: 'cat_allergies', weight: 3 },
    
    { source: 'cat_facts', target: 'fac_age' },
    { source: 'cat_facts', target: 'fac_smoker' },
    { source: 'cat_surgeries', target: 'sur_appendectomy' },
    { source: 'cat_medical_history', target: 'his_fracture' },
    { source: 'cat_habits', target: 'hab_late' },
    { source: 'cat_habits', target: 'hab_screen' },
    { source: 'cat_allergies', target: 'alg_dust' },
    { source: 'cat_allergies', target: 'alg_pollen' },
    { source: 'cat_diseases', target: 'dis_t2d' },
    { source: 'cat_diseases', target: 'dis_htn' },
    { source: 'cat_symptoms', target: 'sym_fever' },
    { source: 'cat_symptoms', target: 'sym_headache' },
    { source: 'cat_symptoms', target: 'sym_fatigue' },
    
    // Cross-links
    { source: 'hab_late', target: 'sym_fatigue', type: 'cross' },
    { source: 'dis_t2d', target: 'sym_fatigue', type: 'cross' },
  ],
};

const getNodeDetails = (node: any) => {
  switch (node.id) {
    case 'Indresh': return 'Patient Profile, 20yo Male. Primary node for multi-agent health memory traversal.';
    case 'cat_facts': return 'Facts Category: Holds core demographic background and personal stats.';
    case 'cat_surgeries': return 'Surgeries Category: Captures historical surgical procedures and operations.';
    case 'cat_medical_history': return 'Medical History Category: Tracks prior trauma, bone injuries, and genetic profiles.';
    case 'fac_age': return 'Age & Gender: Patient is a 20-year-old male.';
    case 'fac_smoker': return 'Smoking Status: Patient is a non-smoker.';
    case 'sur_appendectomy': return 'Appendectomy: Prior surgical removal of appendix.';
    case 'his_fracture': return 'Tibia Fracture: Prior history of bone trauma and orthopedic recovery.';
    case 'cat_symptoms': return 'Symptoms Category: Tracks active physical complaints reported by the patient.';
    case 'cat_diseases': return 'Diseases Category: Stores diagnosed chronic and clinical conditions.';
    case 'cat_habits': return 'Habits Category: Monitors behavioral patterns like screen time and sleep schedule.';
    case 'cat_allergies': return 'Allergies Category: Stores hypersensitivity profiles and drug contraindications.';
    case 'sym_fever': return 'Fever: Active core temperature fluctuation (101.5°F) reported via Sarvam speech logs.';
    case 'sym_headache': return 'Headache: Migraine-like cranial pain reported daily (Severity: High).';
    case 'sym_fatigue': return 'Fatigue: Chronic physical exhaustion, linked to late sleep schedule.';
    case 'dis_t2d': return 'Type 2 Diabetes: Chronic metabolic profile. Borderline HbA1c (6.8%) under Metformin therapy.';
    case 'dis_htn': return 'Hypertension: Diagnosed vascular condition. Current BP trend at 138/88 mmHg.';
    case 'hab_late': return 'Late Sleeping: Rest onset regularly after 1:30 AM, impacting sleep quality.';
    case 'hab_screen': return 'Excess Screen: Smartwatch logs show 7.5h average daily device interaction.';
    case 'alg_dust': return 'Dust Allergy: Triggers allergic rhinitis and dry throat irritation.';
    case 'alg_pollen': return 'Pollen Allergy: Seasonal hypersensitivity, cross-checked during spring/monsoon.';
    default: return `${node.label}: Active node of type ${node.type} in Indresh's health graph.`;
  }
};

const computeRadialCoordinates = () => {
  const centerX = 400;
  const centerY = 325;
  const R1 = 150; // radius of category circle
  const R2 = 270; // radius of subnode circle

  const nodes: NodeItem[] = [];
  const links: LinkItem[] = [];

  // Patient node
  const patientNode = GRAPH_DATA.nodes.find(n => n.type === 'patient');
  if (patientNode) {
    nodes.push({
      id: patientNode.id,
      label: patientNode.label,
      type: 'patient',
      details: 'Patient Profile, 20yo Male. Primary node for multi-agent health memory traversal.',
      x: centerX,
      y: centerY
    });
  }

  // Find category nodes
  const categories = GRAPH_DATA.nodes.filter(n => n.type === 'category');

  // Categories
  categories.forEach((cat, index) => {
    const angle = (index / categories.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + R1 * Math.cos(angle);
    const y = centerY + R1 * Math.sin(angle);
    
    nodes.push({
      id: cat.id,
      label: cat.label,
      type: 'category',
      details: getNodeDetails(cat),
      x,
      y
    });
  });

  // Subnodes grouping by parent category
  const subnodes = GRAPH_DATA.nodes.filter(n => n.type !== 'patient' && n.type !== 'category');
  
  // Find children for each category
  categories.forEach((cat, catIndex) => {
    const catAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2;
    
    // Find edges where source is this category
    const childEdges = GRAPH_DATA.edges.filter(e => e.source === cat.id);
    const childIds = childEdges.map(e => e.target);
    const catChildren = subnodes.filter(n => childIds.includes(n.id));

    catChildren.forEach((child, childIndex) => {
      const numChildren = catChildren.length;
      const spread = 0.35; // angle spacing between siblings
      const childAngle = catAngle + (childIndex - (numChildren - 1) / 2) * spread;
      
      const x = centerX + R2 * Math.cos(childAngle);
      const y = centerY + R2 * Math.sin(childAngle);

      nodes.push({
        id: child.id,
        label: child.label,
        type: child.type as any,
        details: getNodeDetails(child),
        x,
        y
      });
    });
  });

  // Map edges to links
  GRAPH_DATA.edges.forEach((e, idx) => {
    links.push({
      id: `pl-${idx}`,
      sourceId: e.source,
      targetId: e.target,
      label: e.type === 'cross' ? 'cross_link' : 'contains'
    });
  });

  return { nodes, links };
};

const { nodes: PATIENT_NODES, links: PATIENT_LINKS } = computeRadialCoordinates();

const PATIENT_STEPS = [
  {
    title: "1. Core Demographics & History Ingestion",
    description: "Multi-Agent Orchestrator triggers personal profile Ingestion, indexing facts (20yo Male, Non-Smoker), surgeries (Appendectomy), and medical history (Tibia Fracture) as core demographics connected to Indresh.",
    code: "CYPHER QUERY (Neo4j Ingestion):\nMERGE (p:Patient {id: 'Indresh', name: 'Indresh'})\nCREATE (p)-[:HAS_FACT]->(:Fact {label: '20yo Male'})\nCREATE (p)-[:HAS_SURGERY]->(:Surgery {name: 'Appendectomy'})\nCREATE (p)-[:HAS_HISTORY]->(:History {name: 'Tibia Fracture'})",
    agent: "Demographics & History Agent"
  },
  {
    title: "2. Habits & Allergy Profiling",
    description: "Lifestyle & Habit Tracker extracts routine patterns, capturing late sleep logs (after 1:30 AM), screen metrics, and maps environmental allergies (Dust, Pollen) for prescription checks.",
    code: "CYPHER QUERY (Neo4j Ingestion):\nMATCH (p:Patient {id: 'Indresh'})\nCREATE (p)-[:HAS_HABIT]->(:Habit {name: 'Late Sleeping'})\nCREATE (p)-[:HAS_ALLERGY]->(:Allergy {name: 'Dust'})",
    agent: "Habits & Allergies Profiler"
  },
  {
    title: "3. Chronic Conditions Mapping",
    description: "Clinical Graph Integration Agent maps diagnosed chronic diseases (Type 2 Diabetes, Hypertension) to the central profile node, linking them to clinical treatment pathways.",
    code: "CYPHER QUERY (Neo4j Ingestion):\nMATCH (p:Patient {id: 'Indresh'})\nCREATE (p)-[:HAS_DISEASE]->(d:Disease {name: 'Type 2 Diabetes'})\nCREATE (p)-[:HAS_DISEASE]->(d2:Disease {name: 'Hypertension'})",
    agent: "Clinical Graph Integration Agent"
  },
  {
    title: "4. Active Symptoms Ingestion",
    description: "Symptom & Allergy Mapping Agent logs current verbal complaints (Fever, Headache, Fatigue) from voice files and links them as active complaints.",
    code: "CYPHER QUERY (Neo4j Ingestion):\nMATCH (p:Patient {id: 'Indresh'})\nCREATE (p)-[:HAS_SYMPTOM]->(:Symptom {name: 'Fever', value: '101.5F'})\nCREATE (p)-[:HAS_SYMPTOM]->(:Symptom {name: 'Fatigue'})",
    agent: "Symptom Ingestion Agent"
  }
];

const getNodeColor = (type: string) => {
  switch (type) {
    case 'patient': return '#38bdf8'; // Sky Blue
    case 'family': return '#fbbf24'; // Amber
    case 'category': return '#a8a29e'; // Gray-stone
    case 'condition': return '#f87171'; // Red-orange
    case 'disease': return '#f87171'; // Red-orange
    case 'habit': return '#a78bfa'; // Violet
    case 'symptom': return '#f472b6'; // Pink
    case 'symptoms': return '#f472b6'; // Pink
    case 'vital': return '#2dd4bf'; // Teal
    case 'risk': return '#ef4444'; // Bright Red
    case 'lifestyle': return '#34d399'; // Emerald
    case 'allergies': return '#ec4899'; // Rose
    case 'facts': return '#fb7185'; // Rose-pink
    case 'surgeries': return '#c084fc'; // Light purple
    case 'medicalHistory': return '#e879f9'; // Fuchsia
    default: return '#94a3b8';
  }
};

const getLinkColor = (link: LinkItem, nodes: NodeItem[]) => {
  if (link.label === 'cross_link') return '#0066FF';
  
  const tNode = nodes.find(n => n.id === link.targetId);
  if (tNode) {
    if (tNode.type === 'patient') return '#38bdf8';
    if (tNode.type === 'category') {
      const type = tNode.id.replace('cat_', '');
      switch (type) {
        case 'facts': return '#fb7185';
        case 'surgeries': return '#c084fc';
        case 'medical_history': return '#e879f9';
        case 'symptoms': return '#f472b6';
        case 'diseases': return '#f87171';
        case 'habits': return '#a78bfa';
        case 'allergies': return '#ec4899';
        default: return '#52525b';
      }
    }
    return getNodeColor(tNode.type);
  }
  return '#52525b';
};

// ==========================================
// FAMILY GENETICS GRAPH DATASET
// ==========================================
const FAMILY_NODES: NodeItem[] = [
  { id: 'Indresh', label: 'Patient: Indresh', type: 'patient', details: 'Patient Profile, 20yo Male', x: 400, y: 325, step: 0 },
  { id: 'Child', label: 'Monish (child)', type: 'family', details: 'Child Profile, 12yo Male (Linked via family tree)', x: 400, y: 150, step: 1 },
  { id: 'child_disease', label: 'COVID-19 (Child\'s)', type: 'condition', details: 'Diagnosed: RT-PCR positive 2 days ago. Traversed via Family Genetics Agent.', x: 180, y: 150, step: 1 },
  { id: 'symptom1', label: 'Fever (101.5°F)', type: 'symptom', details: 'High body temperature. Reported via voice check-in.', x: 120, y: 325, step: 2 },
  { id: 'symptom2', label: 'Dry Cough', type: 'symptom', details: 'Persistent throat irritation, moderate severity.', x: 680, y: 325, step: 2 },
  { id: 'vital', label: 'SpO2: 95%', type: 'vital', details: 'Wearable oxygen saturation level (Borderline low).', x: 200, y: 500, step: 2 },
  { id: 'risk', label: 'COVID-19 Transmission Warning', type: 'risk', details: 'Random Forest Prediction: High Risk (94% confidence). Driven by: Fever, Cough, SpO2 (95%), and close contact with COVID-positive child Monish.', x: 600, y: 500, step: 4 }
];

const FAMILY_LINKS: LinkItem[] = [
  { id: 'l0', sourceId: 'Indresh', targetId: 'Child', label: 'related_to', step: 1 },
  { id: 'l1', sourceId: 'Child', targetId: 'child_disease', label: 'has_disease', step: 1 },
  { id: 'l2', sourceId: 'Indresh', targetId: 'symptom1', label: 'experiences', step: 3 },
  { id: 'l3', sourceId: 'Indresh', targetId: 'symptom2', label: 'experiences', step: 3 },
  { id: 'l4', sourceId: 'Indresh', targetId: 'vital', label: 'measured', step: 3 },
  { id: 'l6', sourceId: 'child_disease', targetId: 'risk', label: 'exposure vector', step: 4 },
  { id: 'l7', sourceId: 'vital', targetId: 'risk', label: 'triggers', step: 4 },
  { id: 'l8', sourceId: 'symptom2', targetId: 'risk', label: 'compounds', step: 4 },
  { id: 'l9', sourceId: 'Indresh', targetId: 'risk', label: 'flags alert', step: 4 }
];

const FAMILY_STEPS = [
  {
    title: "1. Onboarding & Family Exposure",
    description: "The patient's profile is loaded alongside their family branch. The Family Genetics Agent traverses the graph to find any active conditions in cohabiting family members.",
    code: 'CYPHER QUERY:\nMATCH (u:User {id: "indresh"})-[:RELATED_TO]->(f:FamilyMember)-[:HAS_DISEASE]->(d:Disease)\nRETURN f.relation, d.name\n\n[Found: Child Monish -> COVID-19]',
    agent: "Family Genetics Agent"
  },
  {
    title: "2. NLP Symptom Parsing",
    description: "The patient reports symptoms via a voice check-in. The NLP agent parses the log to extract symptom types, severities, and vital readings from wearable sensors.",
    code: 'EXTRACTED ENTITIES:\n- Symptom: "Fever" (101.5°F, Severity: Mild)\n- Symptom: "Dry Cough" (Severity: Moderate)\n- Vital: "SpO2 Oxygen Saturation" (95% via Smartwatch)',
    agent: "Sarvam Voice Agent"
  },
  {
    title: "3. Health Memory Graph Update",
    description: "The Workflow Orchestrator updates the active patient nodes and writes relationships in the Neo4j database, integrating the current check-in with their historical health memory.",
    code: 'CYPHER UPDATE:\nMERGE (u:User {id: "indresh"})\nCREATE (s1:Symptom {name: "Fever"})\nCREATE (s2:Symptom {name: "Dry Cough"})\nCREATE (u)-[:EXPERIENCES]->(s1)\nCREATE (u)-[:EXPERIENCES]->(s2)',
    agent: "Workflow Orchestrator"
  },
  {
    title: "4. Random Forest Inference",
    description: "The scikit-learn Random Forest model consumes the active features (Fever=1, Cough=1, SpO2=95, ExposureFlag=1) to estimate infection risk. The Escalation Agent generates a high risk alert and triggers doctor review.",
    code: 'MODEL INFERENCE (Random Forest):\nInputs: [Fever=1, Cough=1, SpO2=95, FamilyExposure=1]\nOutput Risk: HIGH (94% Confidence)\nExplanation: Exposure to COVID-positive child + symptoms + borderline low SpO2.',
    agent: "Random Forest Classifier"
  }
];

// ==========================================
// SUB-COMPONENT 1: PATIENT MEMORY GRAPH
// ==========================================
const PatientMemoryGraph: React.FC = () => {
  const [buildStepByStep, setBuildStepByStep] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    setHoveredNodeId(null);
    setSelectedNodeId(null);
    setCurrentStep(0);
  }, [buildStepByStep]);

  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setTime(prev => prev + 0.025);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const nextStep = () => {
    if (currentStep < PATIENT_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  const getPatientStepForNode = (nodeId: string) => {
    if (['Indresh', 'cat_facts', 'fac_age', 'fac_smoker', 'cat_surgeries', 'sur_appendectomy', 'cat_medical_history', 'his_fracture'].includes(nodeId)) return 1;
    if (['cat_habits', 'hab_late', 'hab_screen', 'cat_allergies', 'alg_dust', 'alg_pollen'].includes(nodeId)) return 2;
    if (['cat_diseases', 'dis_t2d', 'dis_htn'].includes(nodeId)) return 3;
    if (['cat_symptoms', 'sym_fever', 'sym_headache', 'sym_fatigue'].includes(nodeId)) return 4;
    return 1;
  };

  const activeNodes = buildStepByStep
    ? PATIENT_NODES.filter(n => getPatientStepForNode(n.id) <= currentStep)
    : PATIENT_NODES;

  const activeLinks = buildStepByStep
    ? PATIENT_LINKS.filter(l => getPatientStepForNode(l.sourceId) <= currentStep && getPatientStepForNode(l.targetId) <= currentStep)
    : PATIENT_LINKS;

  const getDriftedPosition = (node: NodeItem) => {
    const strength = node.id === 'Indresh' ? 1.0 : 2.5;
    const driftX = Math.sin(time + node.id.charCodeAt(0)) * strength;
    const driftY = Math.cos(time + (node.id.charCodeAt(1) || 0)) * strength;
    return {
      x: node.x + driftX,
      y: node.y + driftY
    };
  };

  const activeNodeFocusId = hoveredNodeId || selectedNodeId;
  const neighboringNodeIds = React.useMemo(() => {
    if (!activeNodeFocusId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeFocusId]);
    activeLinks.forEach(link => {
      if (link.sourceId === activeNodeFocusId) neighbors.add(link.targetId);
      if (link.targetId === activeNodeFocusId) neighbors.add(link.sourceId);
    });
    return neighbors;
  }, [activeNodeFocusId, activeLinks]);

  const activeNodeDetails = activeNodes.find(n => n.id === activeNodeFocusId);

  const getNodeRadius = (node: NodeItem, isHovered: boolean) => {
    const scaleFactor = isHovered ? 1.25 : 1.0;
    if (node.type === 'patient') return 36 * scaleFactor;
    if (node.type === 'category') return 20 * scaleFactor;
    return 12 * scaleFactor;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Sub-toggle for Patient Profile Graph builder mode */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {buildStepByStep ? 'Step-by-Step Profile Ingestion' : 'Unified Patient Context Graph'}
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
            {buildStepByStep 
              ? 'Watch how the multi-agent mesh extracts demographics, habits, conditions, and symptoms step-by-step.'
              : 'Interactive database schema illustrating Indresh\'s history, demographics, surgeries, habits, and symptoms.'
            }
          </p>
        </div>

        <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '30px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={() => setBuildStepByStep(false)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: !buildStepByStep ? 'var(--surface)' : 'transparent',
              color: !buildStepByStep ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: !buildStepByStep ? 'var(--shadow)' : 'none'
            }}
          >
            🌐 Complete Schema
          </button>
          <button
            onClick={() => {
              setBuildStepByStep(true);
              setCurrentStep(1);
            }}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: buildStepByStep ? 'var(--surface)' : 'transparent',
              color: buildStepByStep ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: buildStepByStep ? 'var(--shadow)' : 'none'
            }}
          >
            🛠️ Step-by-Step Builder
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'stretch' }} className="pipeline-grid">
        {/* Left Card: Obsidian-style Canvas */}
        <Card style={{ padding: '24px', backgroundColor: '#09090b', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '620px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: '#38bdf8' }} />
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#f4f4f5', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {buildStepByStep ? 'Step-by-Step Graph Build' : 'Patient Schema DB'}
              </span>
            </div>
            {buildStepByStep && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: PATIENT_STEPS.length + 1 }).map((_, i) => (
                  <div key={i} style={{ width: '18px', height: '5px', borderRadius: '2.5px', backgroundColor: i <= currentStep ? '#38bdf8' : '#27272a', transition: 'all 0.3s' }} />
                ))}
              </div>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div style={{ flex: 1, position: 'relative', minHeight: '480px', background: '#09090b', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.8, pointerEvents: 'none' }} />

            <svg width="100%" height="100%" viewBox="0 0 800 650" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717a" />
                </marker>
                <marker id="arrow-high" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-cross" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#60a5fa" />
                </marker>
              </defs>

              {/* Links */}
              <g>
                {activeLinks.map((link) => {
                  const sNode = activeNodes.find(n => n.id === link.sourceId);
                  const tNode = activeNodes.find(n => n.id === link.targetId);
                  if (!sNode || !tNode) return null;

                  const sourcePos = getDriftedPosition(sNode);
                  const targetPos = getDriftedPosition(tNode);

                  const isHovered = activeNodeFocusId && (link.sourceId === activeNodeFocusId || link.targetId === activeNodeFocusId);
                  const dim = activeNodeFocusId && !isHovered;
                  const isCross = link.label === 'cross_link';

                  const dx = targetPos.x - sourcePos.x;
                  const dy = targetPos.y - sourcePos.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const rTarget = getNodeRadius(tNode, activeNodeFocusId === tNode.id);
                  const x1 = sourcePos.x;
                  const y1 = sourcePos.y;
                  const x2 = targetPos.x - (dx / len) * (rTarget + 8);
                  const y2 = targetPos.y - (dy / len) * (rTarget + 8);

                  const linkColor = getLinkColor(link, PATIENT_NODES);
                  return (
                    <g key={link.id}>
                      <motion.line
                        x1={x1} y1={y1} x2={x1} y2={y1}
                        stroke={isHovered ? '#38bdf8' : linkColor}
                        strokeWidth={isHovered ? 3.5 : 2.5}
                        strokeDasharray={isCross ? "5,5" : undefined}
                        initial={{ x2: x1, y2: y1 }}
                        animate={{
                          x1: x1, y1: y1,
                          x2: x2, y2: y2,
                          stroke: isHovered ? '#38bdf8' : linkColor,
                          strokeWidth: isHovered ? 3.5 : 2.5,
                          opacity: dim ? 0.15 : (isHovered ? 1.0 : 0.35)
                        }}
                        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                        style={{ filter: isHovered ? `drop-shadow(0 0 4px ${linkColor})` : 'none' }}
                        markerEnd={`url(#${isHovered ? 'arrow-high' : 'arrow'})`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {activeNodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isNeighbor = activeNodeFocusId && neighboringNodeIds.has(node.id);
                  const dim = activeNodeFocusId && !isNeighbor;
                  
                  const pos = getDriftedPosition(node);
                  const color = getNodeColor(node.type);
                  const radius = getNodeRadius(node, isHovered);

                  return (
                    <g 
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                    >
                      {/* Glow halo */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius + 8, opacity: isHovered ? 0.25 : (isNeighbor ? 0.1 : 0.0) }}
                        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                        style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
                      />

                      {/* Main Node Circle */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        stroke={selectedNodeId === node.id ? '#0066FF' : '#09090b'}
                        strokeWidth={selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5)}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius, fill: color, stroke: selectedNodeId === node.id ? '#0066FF' : '#09090b', strokeWidth: selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5), opacity: dim ? 0.2 : 1 }}
                        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                        style={{ filter: isHovered || selectedNodeId === node.id ? `drop-shadow(0 0 8px ${color})` : 'none' }}
                      />

                      {node.type === 'patient' && (
                        <text x={pos.x} y={pos.y + 7} textAnchor="middle" fill="#ffffff" fontSize="20px" fontWeight="bold" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.2 : 1 }}>👤</text>
                      )}

                      {node.type === 'category' && (
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#ffffff" fontSize="11px" fontWeight="800" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.25 : 0.9 }}>{node.label.charAt(0)}</text>
                      )}

                      <motion.text
                        x={0} y={0} textAnchor="middle"
                        fill={isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196')}
                        fontSize="9px" fontWeight={isHovered ? '700' : '500'}
                        initial={{ x: 400, y: 325, opacity: 0 }}
                        animate={{ x: pos.x, y: pos.y + radius + 15, opacity: dim ? 0.15 : 1, fill: isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196') }}
                        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                        style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover details overlay */}
            <AnimatePresence>
              {activeNodeDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(24, 24, 27, 0.95)', backdropFilter: 'blur(10px)', border: `1px solid ${getNodeColor(activeNodeDetails.type)}`, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', pointerEvents: 'none', zIndex: 10 }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getNodeColor(activeNodeDetails.type) }} />
                      <strong style={{ fontSize: '13px', color: '#f4f4f5', textTransform: 'capitalize' }}>
                        {activeNodeDetails.type}: {activeNodeDetails.label}
                      </strong>
                    </div>
                    {selectedNodeId === activeNodeDetails.id && (
                      <span style={{ fontSize: '9px', color: '#38bdf8', fontWeight: 800 }}>📌 PINNED</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#a1a1aa', margin: 0, lineHeight: 1.4 }}>{activeNodeDetails.details}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 500 }}>💡 Hover to filter | Click node to PIN details.</span>
            {buildStepByStep && currentStep > 0 && (
              <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#e4e4e7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <RotateCcw size={11} /> Reset Graph
              </button>
            )}
          </div>
        </Card>

        {/* Right Card: Dynamic Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AnimatePresence mode="wait">
            {!buildStepByStep ? (
              <motion.div
                key={activeNodeFocusId ? `patient-focused-${activeNodeFocusId}` : "patient-explanation"}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                {activeNodeDetails ? (
                  <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: `1.5px solid ${getNodeColor(activeNodeDetails.type)}`, flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '16px', transition: 'border-color 0.3s ease', boxShadow: `0 10px 30px rgba(0,0,0,0.4)` }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: getNodeColor(activeNodeDetails.type), textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Selected {activeNodeDetails.type} Node
                        </span>
                        {selectedNodeId === activeNodeDetails.id && (
                          <span style={{ fontSize: '9px', backgroundColor: '#0066FF', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>📌 PINNED</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                        {activeNodeDetails.label}
                      </h3>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Clinical Description</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{activeNodeDetails.details}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

                    <div>
                      <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Connected Neighbors ({Math.max(0, neighboringNodeIds.size - 1)})</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Array.from(neighboringNodeIds).filter(nid => nid !== activeNodeFocusId).map(nid => {
                          const neighborNode = activeNodes.find(n => n.id === nid);
                          if (!neighborNode) return null;
                          return (
                            <button
                              key={nid}
                              onClick={() => setSelectedNodeId(neighborNode.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getNodeColor(neighborNode.type) }} />
                              {neighborNode.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />

                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cypher Query Match</span>
                      <code style={{ fontSize: '11px', color: getNodeColor(activeNodeDetails.type), fontFamily: 'monospace' }}>
                        {`MATCH (p:Patient {id: 'Indresh'})-[:HAS_${activeNodeDetails.type.toUpperCase()}]->(n {id: '${activeNodeDetails.id}'}) RETURN n`}
                      </code>
                    </div>
                  </Card>
                ) : (
                  <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Profile Context</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>Graph-Structured Patient Context</h3>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>In Swasthya AI, patients are represented not as rows in tables, but as a central profile node linked to key clinical dimensions. This prevents relational join overhead when looking up complex patient states.</p>
                    <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>MAPPED STRUCTURAL DOMAINS</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>👤 <strong>Demographics & Surgeries (Facts, Appendectomy)</strong>: Captures patient background and trauma histories.</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🧬 <strong>Diseases (Type 2 Diabetes, Hypertension)</strong>: Stored as condition nodes to cross-reference OpenFDA alerts.</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🏃 <strong>Lifestyle & Habits (Late Sleeping)</strong>: Monitored to extract active habits aggravating chronic fatigue.</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🍂 <strong>Allergies (Dust, Pollen)</strong>: Checked before doctor prescription approvals.</div>
                      </div>
                    </div>
                    <div style={{ borderBottom: '1px solid var(--border)', width: '100%' }} />
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CYPHER RELATION QUERY</span>
                      <code style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'monospace' }}>{'MATCH (p:Patient)-[r]->(node) RETURN type(r), node.name'}</code>
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="patient-step-explanation"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Workflow size={14} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Graph Build Pipeline</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Step {Math.min(currentStep + 1, PATIENT_STEPS.length)} of {PATIENT_STEPS.length}</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {currentStep === 0 ? (
                        <motion.div key="step-intro" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Begin Ingestion</h3>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>Watch how the multi-agent mesh extracts personal facts, logs habits, maps clinical diagnoses, and links allergies step-by-step.</p>
                          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <Volume2 size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                            <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0 }}>"My name is Indresh, 20yo Male. Had an appendectomy, non-smoker..."</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key={`step-${currentStep}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{PATIENT_STEPS[currentStep - 1].title}</h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>{PATIENT_STEPS[currentStep - 1].description}</p>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Active Supervised Agent</span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>🤖 {PATIENT_STEPS[currentStep - 1].agent}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                    {currentStep > 0 && (
                      <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
                        <ChevronLeft size={16} /> Back
                      </button>
                    )}
                    <button
                      onClick={currentStep < PATIENT_STEPS.length ? nextStep : reset}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: currentStep === PATIENT_STEPS.length ? '#10B981' : 'var(--text-primary)', color: currentStep === PATIENT_STEPS.length ? 'white' : 'var(--bg)', fontWeight: 800, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                    >
                      {currentStep === 0 ? (<><Play size={16} fill="currentColor" /> Start Pipeline</>) : currentStep === PATIENT_STEPS.length ? (<><CheckCircle2 size={16} /> Finish & Reset</>) : (<>Next Step <ChevronRight size={16} /></>)}
                    </button>
                  </div>
                </Card>

                <Card style={{ padding: '18px 24px', backgroundColor: '#0A0A0C', border: '1px solid var(--border)', borderRadius: '16px', fontFamily: 'Courier New, monospace', color: '#E4E4E7', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} style={{ color: '#E4E4E7' }} />
                      <span style={{ fontWeight: 800, color: '#E4E4E7', fontSize: '10px', textTransform: 'uppercase' }}>Clinical Ingestion Stream</span>
                    </div>
                    <span style={{ color: '#52525b', fontSize: '9px' }}>stdout</span>
                  </div>
                  <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5, minHeight: '90px' }}>
                    <code>{currentStep === 0 ? <span style={{ color: '#52525b' }}>// Run the pipeline to stream Cypher query results.</span> : PATIENT_STEPS[currentStep - 1].code}</code>
                  </pre>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT 2: FAMILY GENETICS WARNING GRAPH
// ==========================================
const FamilyGeneticsGraph: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setTime(prev => prev + 0.025);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const nextStep = () => {
    if (currentStep < FAMILY_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  const activeNodes = FAMILY_NODES.filter(n => n.step === undefined || n.step <= currentStep);
  const activeLinks = FAMILY_LINKS.filter(l => l.step === undefined || l.step <= currentStep);

  const getDriftedPosition = (node: NodeItem) => {
    const strength = node.id === 'Indresh' ? 1.0 : 2.5;
    const driftY = Math.cos(time + (node.id.charCodeAt(1) || 0)) * strength;
    return {
      x: node.x,
      y: node.y + driftY // only vertical drift for family tree layout clean feeling
    };
  };

  const activeNodeFocusId = hoveredNodeId || selectedNodeId;
  const neighboringNodeIds = React.useMemo(() => {
    if (!activeNodeFocusId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeFocusId]);
    activeLinks.forEach(link => {
      if (link.sourceId === activeNodeFocusId) neighbors.add(link.targetId);
      if (link.targetId === activeNodeFocusId) neighbors.add(link.sourceId);
    });
    return neighbors;
  }, [activeNodeFocusId, activeLinks]);

  const activeNodeDetails = activeNodes.find(n => n.id === activeNodeFocusId);

  const getNodeRadius = (node: NodeItem, isHovered: boolean) => {
    const scaleFactor = isHovered ? 1.25 : 1.0;
    if (node.type === 'patient') return 36 * scaleFactor;
    if (node.type === 'category' || node.type === 'family') return 20 * scaleFactor;
    return 12 * scaleFactor;
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Step-by-Step Family Genetics Warning
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
          Track the genetics traversal query in real-time, mapping active family exposure vectors to wearable vital inputs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'stretch' }} className="pipeline-grid">
        {/* Left Card: Obsidian-style Canvas */}
        <Card style={{ padding: '24px', backgroundColor: '#09090b', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '620px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#f4f4f5', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Family Genetics Warning Map
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FAMILY_STEPS.length + 1 }).map((_, i) => (
                <div key={i} style={{ width: '18px', height: '5px', borderRadius: '2.5px', backgroundColor: i <= currentStep ? '#38bdf8' : '#27272a', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div style={{ flex: 1, position: 'relative', minHeight: '480px', background: '#09090b', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.8, pointerEvents: 'none' }} />

            <svg width="100%" height="100%" viewBox="0 0 800 650" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <marker id="f-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717a" />
                </marker>
                <marker id="f-arrow-high" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
                </marker>
              </defs>

              {/* Links */}
              <g>
                {activeLinks.map((link) => {
                  const sNode = activeNodes.find(n => n.id === link.sourceId);
                  const tNode = activeNodes.find(n => n.id === link.targetId);
                  if (!sNode || !tNode) return null;

                  const sourcePos = getDriftedPosition(sNode);
                  const targetPos = getDriftedPosition(tNode);

                  const isHovered = activeNodeFocusId && (link.sourceId === activeNodeFocusId || link.targetId === activeNodeFocusId);
                  const dim = activeNodeFocusId && !isHovered;

                  const dx = targetPos.x - sourcePos.x;
                  const dy = targetPos.y - sourcePos.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const rTarget = getNodeRadius(tNode, activeNodeFocusId === tNode.id);
                  const x1 = sourcePos.x;
                  const y1 = sourcePos.y;
                  const x2 = targetPos.x - (dx / len) * (rTarget + 8);
                  const y2 = targetPos.y - (dy / len) * (rTarget + 8);

                  const linkColor = getLinkColor(link, FAMILY_NODES);
                  return (
                    <g key={link.id}>
                      <motion.line
                        x1={x1} y1={y1} x2={x1} y2={y1}
                        stroke={isHovered ? '#fbbf24' : linkColor}
                        strokeWidth={isHovered ? 3.5 : 2.5}
                        initial={{ x2: x1, y2: y1 }}
                        animate={{
                          x1: x1, y1: y1,
                          x2: x2, y2: y2,
                          stroke: isHovered ? '#fbbf24' : linkColor,
                          strokeWidth: isHovered ? 3.5 : 2.5,
                          opacity: dim ? 0.15 : (isHovered ? 1.0 : 0.6)
                        }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: isHovered ? `drop-shadow(0 0 4px ${linkColor})` : 'none' }}
                        markerEnd={`url(#${isHovered ? 'f-arrow-high' : 'f-arrow'})`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {activeNodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isNeighbor = activeNodeFocusId && neighboringNodeIds.has(node.id);
                  const dim = activeNodeFocusId && !isNeighbor;
                  
                  const pos = getDriftedPosition(node);
                  const color = getNodeColor(node.type);
                  const radius = getNodeRadius(node, isHovered);

                  return (
                    <g 
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                    >
                      {/* Glow halo */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius + 8, opacity: isHovered ? 0.25 : (isNeighbor ? 0.1 : 0.0) }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
                      />

                      {/* Main Node Circle */}
                      <motion.circle
                        cx={400} cy={325} r={0}
                        fill={color}
                        stroke={selectedNodeId === node.id ? '#fbbf24' : '#09090b'}
                        strokeWidth={selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5)}
                        initial={{ cx: 400, cy: 325, r: 0 }}
                        animate={{ cx: pos.x, cy: pos.y, r: radius, fill: color, stroke: selectedNodeId === node.id ? '#fbbf24' : '#09090b', strokeWidth: selectedNodeId === node.id ? 4.0 : (isHovered ? 3.0 : 2.5), opacity: dim ? 0.2 : 1 }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ filter: isHovered || selectedNodeId === node.id ? `drop-shadow(0 0 8px ${color})` : 'none' }}
                      />

                      {node.type === 'patient' && (
                        <text x={pos.x} y={pos.y + 7} textAnchor="middle" fill="#ffffff" fontSize="20px" fontWeight="bold" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.2 : 1 }}>👤</text>
                      )}

                      {node.type === 'family' && (
                        <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="#ffffff" fontSize="15px" style={{ pointerEvents: 'none', userSelect: 'none', opacity: dim ? 0.25 : 0.9 }}>👶</text>
                      )}

                      <motion.text
                        x={0} y={0} textAnchor="middle"
                        fill={isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196')}
                        fontSize="9px" fontWeight={isHovered ? '700' : '500'}
                        initial={{ x: 400, y: 325, opacity: 0 }}
                        animate={{ x: pos.x, y: pos.y + radius + 15, opacity: dim ? 0.15 : 1, fill: isHovered ? '#ffffff' : (isNeighbor ? '#e4e4e7' : '#8e9196') }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover details overlay */}
            <AnimatePresence>
              {activeNodeDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(24, 24, 27, 0.95)', backdropFilter: 'blur(10px)', border: `1px solid ${getNodeColor(activeNodeDetails.type)}`, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', pointerEvents: 'none', zIndex: 10 }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getNodeColor(activeNodeDetails.type) }} />
                      <strong style={{ fontSize: '13px', color: '#f4f4f5', textTransform: 'capitalize' }}>
                        {activeNodeDetails.type}: {activeNodeDetails.label}
                      </strong>
                    </div>
                    {selectedNodeId === activeNodeDetails.id && (
                      <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 800 }}>📌 PINNED</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#a1a1aa', margin: 0, lineHeight: 1.4 }}>{activeNodeDetails.details}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 500 }}>💡 Hover to filter | Click node to PIN details.</span>
            {currentStep > 0 && (
              <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#e4e4e7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <RotateCcw size={11} /> Reset Graph
              </button>
            )}
          </div>
        </Card>

        {/* Right Card: Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div
            key={`family-step-${currentStep}`}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Workflow size={14} style={{ color: '#fbbf24' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Genetics Exposure Pipeline</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Step {Math.min(currentStep + 1, FAMILY_STEPS.length)} of {FAMILY_STEPS.length}</span>
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 0 ? (
                    <motion.div key="f-step-intro" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Begin Exposure Evaluation</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>Family history and proximity transmission vectors are critical. Trigger the pipeline to check exposure warning alerts.</p>
                      <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <Volume2 size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0 }}>"I have dry cough, high fever, and my SpO2 is 95%..."</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={`f-step-${currentStep}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ minHeight: '170px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{FAMILY_STEPS[currentStep - 1].title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>{FAMILY_STEPS[currentStep - 1].description}</p>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Active Supervised Agent</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid #fbbf24' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>🤖 {FAMILY_STEPS[currentStep - 1].agent}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                {currentStep > 0 && (
                  <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                <button
                  onClick={currentStep < FAMILY_STEPS.length ? nextStep : reset}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: currentStep === FAMILY_STEPS.length ? '#10B981' : 'var(--text-primary)', color: currentStep === FAMILY_STEPS.length ? 'white' : 'var(--bg)', fontWeight: 800, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  {currentStep === 0 ? (<><Play size={16} fill="currentColor" /> Start Pipeline</>) : currentStep === FAMILY_STEPS.length ? (<><CheckCircle2 size={16} /> Finish & Reset</>) : (<>Next Step <ChevronRight size={16} /></>)}
                </button>
              </div>
            </Card>

            <Card style={{ padding: '18px 24px', backgroundColor: '#0A0A0C', border: '1px solid var(--border)', borderRadius: '16px', fontFamily: 'Courier New, monospace', color: '#E4E4E7', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} style={{ color: '#E4E4E7' }} />
                  <span style={{ fontWeight: 800, color: '#E4E4E7', fontSize: '10px', textTransform: 'uppercase' }}>Clinical Ingestion Stream</span>
                </div>
                <span style={{ color: '#52525b', fontSize: '9px' }}>stdout</span>
              </div>
              <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5, minHeight: '90px' }}>
                <code>{currentStep === 0 ? <span style={{ color: '#52525b' }}>// Run the pipeline to stream Cypher query results.</span> : FAMILY_STEPS[currentStep - 1].code}</code>
              </pre>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
export const HealthMemoryBuilder: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', width: '100%', maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 24px', boxSizing: 'border-box' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Interactive Health Memory Graphs
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Explore Swasthya AI's structured health graphs mapping patient records, demographics, medical history, and family genetics warnings.
        </p>
      </div>

      {/* Patient Health Graph section */}
      <div id="patient-graph-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <PatientMemoryGraph />
      </div>

      {/* Family Genetics warning section */}
      <div id="family-graph-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <FamilyGeneticsGraph />
      </div>
      
    </div>
  );
};

export default HealthMemoryBuilder;
