// src/pages/About.tsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import AboutHero from '../components/about/AboutHero';
import AboutBodyModelSection from '../components/about/AboutBodyModelSection';
import PatientMemoryGraph from '../components/about/PatientMemoryGraph';
import FamilyGeneticsGraph from '../components/about/FamilyGeneticsGraph';
import AgentWorkflowSection from '../components/about/AgentWorkflowSection';
import AgentShowcase from '../components/about/AgentShowcase';
import FeatureShowcase from '../components/about/FeatureShowcase';
import ModelSection from '../components/about/ModelSection';
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

      {/* 1. Hero & Philosophy Section */}
      <section id="about-hero">
        <AboutHero />
      </section>

      {/* 2. 3D Body Mannequin Symptom Heatmap */}
      <section id="bodymap-section">
        <AboutBodyModelSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />
      
      {/* 3. Patient Health Memory Graph Builder */}
      <section id="patient-graph-section">
        <PatientMemoryGraph />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 4. Family Genetics & Exposure Graph */}
      <section id="family-graph-section">
        <FamilyGeneticsGraph />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 5. Agent Workflow Architecture & Lifecycle Diagram */}
      <section id="workflow-section">
        <AgentWorkflowSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 6. 12-Agent Specialization Mesh & Live Sandbox Simulator */}
      <section id="agents-section">
        <AgentShowcase />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 7. Clinical Modules & Surfaces */}
      <section id="modules-section">
        <FeatureShowcase />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 8. ML Cardiovascular Risk Prediction & 3D Brain Particle Animation */}
      <section id="model-section">
        <ModelSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 9. Production Tech Stack */}
      <section id="techstack-section">
        <TechStackSection />
      </section>

      <div style={{ borderBottom: '1px solid var(--border)', width: '100%', margin: '20px 0' }} />

      {/* 10. Technical FAQs */}
      <section id="faq-section">
        <FAQSection />
      </section>

      <Footer />
    </div>
  );
};

export default About;