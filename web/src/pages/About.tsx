// src/pages/About.tsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import AboutHero from '../components/about/AboutHero';
import AboutBodyModelSection from '../components/about/AboutBodyModelSection';
import HealthMemoryBuilder from '../components/about/HealthMemoryBuilder';
import FeatureShowcase from '../components/about/FeatureShowcase';
import AgentShowcase from '../components/about/AgentShowcase';
import TechStackSection from '../components/about/TechStackSection';
import FAQSection from '../components/about/FAQSection';
import Footer from '../components/common/Footer';
import ScrollNavigator from '../components/about/ScrollNavigator';

export const About: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <Navbar />
      
      {/* Floating vertical section navigator */}
      <ScrollNavigator />

      <div id="about-hero">
        <AboutHero />
      </div>

      <div id="bodymap-section">
        <AboutBodyModelSection />
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      <div>
        <HealthMemoryBuilder />
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      <div id="modules-section">
        <FeatureShowcase />
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      <div id="agents-section">
        <AgentShowcase />
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      <div id="techstack-section">
        <TechStackSection />
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      <div id="faq-section">
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
};

export default About;
