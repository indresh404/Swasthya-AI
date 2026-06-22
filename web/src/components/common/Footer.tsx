// src/components/common/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        padding: '48px 24px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Swasthya AI</span>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/about')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            About Swasthya AI
          </button>
          <button
            onClick={() => navigate('/auth')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            Doctor Hub
          </button>
        </div>

        <div>
          &copy; {new Date().getFullYear()} Swasthya AI. Secure medical records ledger.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
