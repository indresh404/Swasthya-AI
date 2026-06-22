// src/components/about/healthGraphData.ts
import React from 'react';

export interface NodeItem {
  id: string;
  label: string;
  type: string;
  details: string;
  x: number;
  y: number;
  step?: number;
}

export interface LinkItem {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  step?: number;
}

// ==========================================
// SIMPLIFIED PATIENT GRAPH DATASET
// ==========================================
export const GRAPH_DATA = {
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

export const getNodeDetails = (node: any) => {
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

export const computeRadialCoordinates = () => {
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

export const { nodes: PATIENT_NODES, links: PATIENT_LINKS } = computeRadialCoordinates();

export const PATIENT_STEPS = [
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

export const getNodeColor = (type: string) => {
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

export const getLinkColor = (link: LinkItem, nodes: NodeItem[]) => {
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
export const FAMILY_NODES: NodeItem[] = [
  { id: 'Indresh', label: 'Patient: Indresh', type: 'patient', details: 'Patient Profile, 20yo Male', x: 400, y: 325, step: 0 },
  { id: 'Child', label: 'Monish (child)', type: 'family', details: 'Child Profile, 12yo Male (Linked via family tree)', x: 400, y: 150, step: 1 },
  { id: 'child_disease', label: 'COVID-19 (Child\'s)', type: 'condition', details: 'Diagnosed: RT-PCR positive 2 days ago. Traversed via Family Genetics Agent.', x: 180, y: 150, step: 1 },
  { id: 'symptom1', label: 'Fever (101.5°F)', type: 'symptom', details: 'High body temperature. Reported via voice check-in.', x: 120, y: 325, step: 2 },
  { id: 'symptom2', label: 'Dry Cough', type: 'symptom', details: 'Persistent throat irritation, moderate severity.', x: 680, y: 325, step: 2 },
  { id: 'vital', label: 'SpO2: 95%', type: 'vital', details: 'Wearable oxygen saturation level (Borderline low).', x: 200, y: 500, step: 2 },
  { id: 'risk', label: 'COVID-19 Transmission Warning', type: 'risk', details: 'Random Forest Prediction: High Risk (94% confidence). Driven by: Fever, Cough, SpO2 (95%), and close contact with COVID-positive child Monish.', x: 600, y: 500, step: 4 }
];

export const FAMILY_LINKS: LinkItem[] = [
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

export const FAMILY_STEPS = [
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
