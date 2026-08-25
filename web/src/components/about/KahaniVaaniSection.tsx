import React from 'react';
import { motion } from 'framer-motion';
import storyVideo from '../../assets/story_animation.mp4';

const KahaniVaaniSection: React.FC = () => {
  return (
    <div style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Subtle Background Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '60px',
          flexWrap: 'wrap'
        }}
      >
        <motion.div 
          style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '9/16',
              borderRadius: '32px',
              overflow: 'hidden',
              background: 'var(--surface)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              position: 'relative'
            }}
          >
            <video
              src={storyVideo}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '24px'
              }}
            />
          </div>
        </motion.div>

        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Cognitive Engagement
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ 
                fontSize: '3.5rem', 
                fontWeight: 800,
                margin: 0, 
                background: 'linear-gradient(90deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px'
              }}
            >
              Kahani-Vaani
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ fontSize: '1.4rem', margin: '8px 0 0 0', color: 'var(--accent)', fontWeight: 600 }}
            >
              Longitudinal Cognitive Recall Tracking
            </motion.h3>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontSize: '1.15rem', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}
          >
            Each morning, a short voice-narrated story (like a Panchatantra tale) plays in the patient's chosen language. That evening, the app asks one specific recall question about it.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.1)' }}
            style={{
              background: 'linear-gradient(145deg, var(--surface) 0%, rgba(255,255,255,0.02) 100%)',
              padding: '30px',
              borderRadius: '24px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginTop: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>Why it matters</h4>
            <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              The system records recall accuracy and response latency, storing each session in the health graph. Over multiple sessions, this builds a continuous memory-recall trend that a single clinical snapshot cannot produce. It acts as supporting context for the neurologist, independent of the clinical risk model.
            </p>
          </motion.div>
          
          <motion.ul 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } }
            }}
            style={{ listStyleType: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {[
              "Multilingual (Hindi, Marathi, English via Sarvam AI)",
              "Framed as a light daily activity, not a test",
              "Non-diagnostic, context-building"
            ].map((text, i) => (
              <motion.li 
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 500 }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '28px', 
                  height: '28px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981', 
                  borderRadius: '50%',
                  fontSize: '0.9rem'
                }}>✓</span> 
                {text}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </div>
  );
};

export default KahaniVaaniSection;
