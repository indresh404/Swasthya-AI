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
    q: "What makes this different from a regular health chatbot?",
    a: "Unlike single-prompt chatbots that suffer from hallucination and lack explanation, Swasthya AI maps all patient logs to a structured Neo4j graph database. Insights are derived by traversing relationships (e.g. tracking specific symptom occurrences over time), making reasoning fully traceable.",
    category: "Architecture",
    color: "#0474FC" // Blue
  },
  {
    q: "Why a graph database instead of a normal database?",
    a: "Human health is highly interconnected. A relational database requires heavy, slow joins to connect symptoms, medication timings, family risk profiles, and lab reports. A graph database stores these connections directly as first-class relationships, enabling real-time risk propagation and family genetics tracing.",
    category: "Data Engineering",
    color: "#8B5CF6" // Purple
  },
  {
    q: "Does this provide medical diagnoses?",
    a: "No, Swasthya AI is a clinical assistant. It never makes unsupervised medical decisions. It extracts information, links relationships, matches government-approved eligibility rules, and flags severe patterns. It acts as an assistant for doctors, keeping them in control.",
    category: "Clinical Compliance",
    color: "#10B981" // Green
  },
  {
    q: "How does the voice feature work?",
    a: "It integrates Sarvam AI's speech API to handle transcription and text-to-speech rendering. Patients can click the mic button, speak naturally in Hindi, Marathi, or English, and the model will parse it into structured graph logs.",
    category: "Voice AI",
    color: "#EC4899" // Pink
  },
  {
    q: "Is patient data shared within a family?",
    a: "Patient privacy is strictly enforced. While family members share a group code to track hereditary patterns, only non-sensitive risk indicators (like a family history of diabetes) propagate through relationships. Specific doctor consultations or logs remain strictly private.",
    category: "Security & Privacy",
    color: "#F59E0B" // Amber
  },
  {
    q: "What happens if a doctor asks something the system doesn't know?",
    a: "The Doctor Q&A agent intercepts the query. If the patient's record lacks the required data, the agent translates the clinical question into a patient-friendly prompt and queues it for the patient's next daily check-in, closing the loop automatically.",
    category: "Edge Cases",
    color: "#06B6D4" // Cyan
  }
];

export const FAQSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto 85px auto', padding: '0 24px', boxSizing: 'border-box', width: '100%' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0', textAlign: 'center' }}>
        System FAQs
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '44px', lineHeight: 1.6 }}>
        Technical questions regarding Swasthya AI's knowledge model, compliance boundaries, and privacy structures.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                boxSizing: 'border-box',
                boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
              }}
              onClick={() => setActiveIdx(isOpen ? null : idx)}
            >
              {/* Sliding dynamic colored left bar */}
              <motion.div
                initial={{ height: '30%' }}
                animate={{ height: isOpen ? '100%' : '30%' }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '4px',
                  backgroundColor: faq.color
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* FAQ Category Tag */}
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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.5 }}>
                    <HelpCircle size={12} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </div>

                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', transition: 'color 0.2s ease' }}>
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

              {/* Accordian Answer */}
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
                        paddingTop: '20px', 
                        fontSize: '14px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6, 
                        borderTop: '1px solid var(--border)', 
                        marginTop: '20px' 
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent card closing when clicking content
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
