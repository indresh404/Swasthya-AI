import React from 'react';
import { motion } from 'framer-motion';
import BrainAnimation from '../Brain/Brain';

const ModelSection: React.FC = () => {
  return (
    <section style={{ position: 'relative', padding: '80px 5%' }}>
      <div style={{ margin: '0 auto', maxWidth: '1152px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Cognitive Risk Prioritization
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
            An explainable machine learning pipeline designed to help neurologists prioritize patients for further diagnostic evaluation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'var(--surface)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent)', fontSize: '1.3rem' }}>
                The Purpose
              </h3>
              <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                This model estimates the probability that a patient belongs to a higher-risk cognitive group based on clinical and MRI-derived features. It ranks patients into <strong>LOW / MEDIUM / HIGH</strong> priority bands, ensuring those who need specialized scans (MRI/PET) the most get seen faster.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                background: 'var(--surface)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent)', fontSize: '1.3rem' }}>
                Dataset & Validation
              </h3>
              <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Built using the OASIS cohort, utilizing cross-sectional demographic and structural MRI data (eTIV, nWBV, ASF). The model uses a strict patient-level train/test split to prevent data leakage and ensure real-world validity.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'var(--surface)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent)', fontSize: '1.3rem' }}>
                Explainability First
              </h3>
              <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Swasthya AI never diagnoses. Every risk score is accompanied by the specific factors that contributed to the model's output (using SHAP). A neurologist sees exactly why a patient was flagged (e.g., MMSE score, age, nWBV), completely removing the "black box" nature of typical AI tools.
              </p>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', minHeight: '360px', alignItems: 'center', justifyContent: 'center' }}>
            <BrainAnimation style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelSection;
