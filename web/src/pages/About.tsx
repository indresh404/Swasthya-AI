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
import KahaniVaaniSection from '../components/about/KahaniVaaniSection';
import ModelSection from '../components/about/ModelSection';

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

      {/* Hero Section */}
      <section id="about-hero">
        <AboutHero />
      </section>

      {/* 3D Body Model Section */}
      <section id="bodymap-section">
        <AboutBodyModelSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />
      
      {/* Patient Graph Section */}
      <section id="patient-graph-section">
        <HealthMemoryBuilder />
      </section>

      {/* Family Warning Section - Added missing section */}
      <section id="family-graph-section">
        <div style={{ padding: '40px 0' }}>
          {/* Family Genetics Graph component would go here */}
          {/* You can add the FamilyGeneticsGraph component if available */}
        </div>
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* Clinical Modules Section */}
      <section id="modules-section">
        <FeatureShowcase />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* Agents Section */}
      <section id="agents-section">
        <AgentShowcase />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* Kahani Vaani Section */}
      <section id="kahanivaani-section">
        <KahaniVaaniSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* Model Section */}
      <section id="model-section">
        <ModelSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* Tech Stack Section */}
      <section id="techstack-section">
        <TechStackSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* FAQ Section */}
      <section id="faq-section">
        <FAQSection />
      </section>

      <Footer />
    </div>
  );
};

export default About;