// src/components/about/FAQSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Card from '../ui/Card';

interface FAQItem {
  q: string;
  a: string;
  category: string;
  color: string;
}

const FAQS: FAQItem[] = [
  {
    q: "What makes Swasthya AI fundamentally different from a stateless chatbot?",
    a: "Every existing health chatbot treats each conversation as isolated. It does not remember that you had the same fever three weeks ago, that your father has diabetes, or that this is the fourth time this month you reported fatigue. Swasthya AI builds a connected, longitudinal health graph in Neo4j AuraDB. Without memory, there is no insight, only response.",
    category: "Core Philosophy",
    color: "#0066FF"
  },
  {
    q: "Why use Neo4j AuraDB (Graph) alongside Supabase (SQL)?",
    a: "Health data is fundamentally relational: a symptom links to prior episodes, to affected body zones, to family hereditary profiles, and to active prescriptions. Neo4j stores this graph memory for real-time risk traversal and explainability. Supabase handles structured transactional data (user accounts, authentication, appointment slots, and medicine registries).",
    category: "Data Architecture",
    color: "#8B5CF6"
  },
  {
    q: "How does the Deterministic Safety Layer prevent LLM hallucinations?",
    a: "No triage or escalation decision relies on an LLM's stochastic output. The LLM's job is strictly to extract symptom entities into validated Pydantic JSON schemas. Pure-Python deterministic rules evaluate the extracted fields (e.g. recurrent dyspnea + cardiovascular history) to assign escalation levels (URGENT_EVALUATION) with traceable rule IDs.",
    category: "Safety & Compliance",
    color: "#EF4444"
  },
  {
    q: "How does Sarvam AI voice integration support Indian languages?",
    a: "Patients can converse naturally by voice in Hindi, Marathi, or English. Sarvam AI's speech-to-text (STT) transcribes the audio, our Onboarding/Check-In agents extract structured medical markers, and Sarvam's text-to-speech (TTS) synthesizes grounded empathetic audio replies back to the patient.",
    category: "Multilingual Voice",
    color: "#EC4899"
  },
  {
    q: "How does the Closed-Loop Doctor Q&A work?",
    a: "When a doctor asks a question in the dashboard, the system answers ONLY from graph records with citations. If the data is missing, it marks the answer as 'not grounded', rewrites the question into a patient-friendly prompt, and queues it for the patient's next daily check-in. Once answered, the graph updates and the doctor is notified.",
    category: "Clinical Loop",
    color: "#10B981"
  },
  {
    q: "How does the OpenFDA drug conflict check work?",
    a: "Before any new medicine is saved to the patient's tracker or reminders, the Medicine Agent executes a synchronous OpenFDA API call against all active prescriptions. If a severe drug-drug interaction is detected, saving is gated and a clear plain-language warning is displayed immediately.",
    category: "Drug Safety",
    color: "#F59E0B"
  },
  {
    q: "How does Jan Aushadhi generic price comparison save money?",
    a: "The system matches branded prescriptions against the official Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) generic database. It calculates real patient cost savings and can generate a pharmacist-ready summary PDF to hand over at Jan Aushadhi Kendra stores.",
    category: "Financial Care",
    color: "#06B6D4"
  },
  {
    q: "What ML model is used for cardiovascular risk prediction?",
    a: "Swasthya AI uses exactly one ML model: an explainable, calibrated classifier (evaluated across Logistic Regression, Random Forest, and XGBoost with 5-fold CV) trained on Kaggle's Cardiovascular Disease dataset (~70,000 records). It outputs calibrated probabilities in LOW (<0.35), MEDIUM (0.35–0.65), and HIGH (>0.65) bands alongside SHAP factor breakdowns.",
    category: "Machine Learning",
    color: "#3B82F6"
  }
];

export const FAQSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto 85px auto', padding: '0 24px', boxSizing: 'border-box', width: '100%' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0', textAlign: 'center' }}>
        Frequently Asked Questions
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px', lineHeight: 1.6 }}>
        Technical details regarding Swasthya AI's knowledge graph, safety boundaries, and machine learning models.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FAQS.map((faq, idx) => {
          const isOpen = activeIdx === idx;
          return (
            <Card
              key={idx}
              hoverable
              style={{
                position: 'relative',
                padding: '24px 28px',
                backgroundColor: 'var(--surface)',
                cursor: 'pointer',
                border: isOpen ? `1.5px solid ${faq.color}` : '1.5px solid var(--border)',
                borderRadius: '18px',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                boxSizing: 'border-box',
                boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}
              onClick={() => setActiveIdx(isOpen ? null : idx)}
            >
              {/* Colored left bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: faq.color
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span 
                    style={{ 
                      fontSize: '9px', 
                      fontWeight: 800, 
                      color: faq.color, 
                      backgroundColor: `${faq.color}15`, 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px'
                    }}
                  >
                    {faq.category}
                  </span>
                  <HelpCircle size={14} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 15 }}
                    style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <ChevronDown size={18} style={{ color: isOpen ? faq.color : 'var(--text-secondary)' }} />
                  </motion.div>
                </div>
              </div>

              {/* Accordion Answer */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: { type: "spring", stiffness: 140, damping: 16 },
                        opacity: { duration: 0.2, delay: 0.05 }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: { type: "spring", stiffness: 140, damping: 16 },
                        opacity: { duration: 0.15 }
                      }
                    }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div 
                      style={{ 
                        paddingTop: '16px', 
                        fontSize: '14px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6, 
                        borderTop: '1px solid var(--border)', 
                        marginTop: '16px' 
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
