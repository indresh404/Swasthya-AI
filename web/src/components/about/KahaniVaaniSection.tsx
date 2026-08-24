import React from 'react';
import { motion } from 'framer-motion';

const KahaniVaaniSection: React.FC = () => {
  return (
    <div style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '350px',
              height: '500px',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'var(--surface)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}
          >
            <video
              src="/src/assets/story_animation.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px'
              }}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary)' }}>Kahani-Vaani</h2>
          <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--accent)', fontWeight: 500 }}>
            Longitudinal Cognitive Recall Tracking
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            Each morning, a short voice-narrated story (like a Panchatantra tale) plays in the patient's chosen language. That evening, the app asks one specific recall question about it.
          </p>
          <div
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              marginTop: '10px'
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Why it matters</h4>
            <p style={{ margin: 0, lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              The system records recall accuracy and response latency, storing each session in the health graph. Over multiple sessions, this builds a continuous memory-recall trend that a single clinical snapshot cannot produce. It acts as supporting context for the neurologist, independent of the clinical risk model.
            </p>
          </div>
          <ul style={{ listStyleType: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span> Multilingual (Hindi, Marathi, English via Sarvam AI)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span> Framed as a light daily activity, not a test
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span> Non-diagnostic, context-building
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default KahaniVaaniSection;
