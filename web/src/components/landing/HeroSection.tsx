// src/components/landing/HeroSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    localStorage.setItem('skipLogin', 'true');
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px 24px',
        zIndex: 5,
        position: 'relative',
        maxWidth: '850px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '28px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: 'pulse 2s infinite' }} />
        Voice-Enabled Multilingual Health Memory
      </div>

      <h1
        style={{
          fontSize: '64px',
          fontWeight: 900,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          color: 'var(--text-primary)',
          margin: '0 0 24px 0',
        }}
        className="hero-title-responsive"
      >
        Your Clinical Practice,{' '}
        <span style={{
          backgroundImage: 'linear-gradient(135deg, #0474FC 0%, #00d2ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          Powered by Memory.
        </span>
      </h1>

      <p
        style={{
          fontSize: '22px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          margin: '0 0 40px 0',
          maxWidth: '650px',
          fontWeight: 600
        }}
        className="hero-subtitle-responsive"
      >
        The Complete Picture Before Every Prescription.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/auth')}
          style={{
            boxShadow: '0 10px 20px rgba(4, 116, 252, 0.25)',
            border: 'none',
          }}
        >
          Login as Doctor
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkip}
          style={{
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          Skip & Explore Workspace &rarr;
        </Button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .hero-title-responsive {
            font-size: 42px !important;
          }
          .hero-subtitle-responsive {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
