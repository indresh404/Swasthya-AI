// src/components/about/AboutHero.tsx
import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export const AboutHero: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Copy current URL to clipboard
    const pageUrl = window.location.href;
    navigator.clipboard.writeText(pageUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <div
      className="about-hero"
      style={{
        padding: '120px 24px 40px 24px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
    >

      <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-1.5px', lineHeight: 1.15 }}>
        Swasthya AI Platform Architecture
      </h1>
      <p style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px 0', fontWeight: 600, maxWidth: '680px' }}>
        The Complete Picture Before Every Prescription.
      </p>

      <style>{`
        .share-architecture-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.2), var(--shadow-lg) !important;
        }
        .share-architecture-btn:active {
          transform: translateY(1px);
        }
        @media (max-width: 768px) {
          .about-hero {
            padding: 90px 16px 30px 16px !important;
          }
          .about-hero h1 {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }
          .about-hero p {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutHero;
