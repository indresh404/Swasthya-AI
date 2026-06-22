// src/components/about/ScrollNavigator.tsx
import React, { useState, useEffect } from 'react';

interface SectionItem {
  id: string;
  label: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'about-hero', label: 'Hero Section' },
  { id: 'bodymap-section', label: '3D Body Model' },
  { id: 'patient-graph-section', label: 'Patient Graph' },
  { id: 'family-graph-section', label: 'Family Warning' },
  { id: 'modules-section', label: 'Clinical Modules' },
  { id: 'agents-section', label: '11-Agent Mesh' },
  { id: 'techstack-section', label: 'Tech Stack' },
  { id: 'faq-section', label: 'FAQs' }
];

export const ScrollNavigator: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('about-hero');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const docEl = document.documentElement;
      const body = document.body;
      
      const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop || 0;
      const scrollHeight = docEl.scrollHeight || body.scrollHeight || 0;
      const clientHeight = window.innerHeight || docEl.clientHeight || 0;
      
      const totalHeight = scrollHeight - clientHeight;
      if (totalHeight > 0) {
        // Clamp between 0 and 1
        setScrollProgress(Math.min(Math.max(scrollTop / totalHeight, 0), 1));
      } else {
        setScrollProgress(0);
      }

      let currentSection = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    handleScroll();
    const timeoutId = setTimeout(handleScroll, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        right: '32px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        zIndex: 100,
        pointerEvents: 'none'
      }}
      className="scroll-navigator-fixed"
    >
      {/* Background Track */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          bottom: '10px',
          right: '6px', // Aligned perfectly with the center of the 14px dots
          width: '2px',
          backgroundColor: 'var(--border, rgba(150, 150, 150, 0.2))',
          borderRadius: '4px',
          zIndex: 0
        }}
      >
        {/* Animated Progress Line (Hardware Accelerated) */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0066FF',
            borderRadius: '4px',
            transformOrigin: 'top',
            transform: `scaleY(${scrollProgress})`,
            boxShadow: '0 0 10px rgba(0, 102, 255, 0.6)',
            transition: 'transform 0.1s linear'
          }}
        />
      </div>

      {/* Nodes / Dots */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '320px',
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      >
        {SECTIONS.map((sec, idx) => {
          const isActive = activeSection === sec.id;
          const sectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
          const isFilled = idx <= sectionIndex;

          return (
            <div 
              key={sec.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer',
                width: '180px',
                height: '24px' // Gives a slightly taller hit-area for clicking
              }}
              onClick={() => handleScrollTo(sec.id)}
              className="scroll-nav-node-wrapper group"
            >
              {/* Tooltip Label */}
              <span 
                className="scroll-nav-label"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary, #888)',
                  marginRight: '16px',
                  backgroundColor: isActive ? 'rgba(0, 102, 255, 0.95)' : 'var(--surface, rgba(255, 255, 255, 0.8))',
                  backdropFilter: 'blur(8px)',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border, #eaeaea)',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0) scale(1)' : 'translateX(10px) scale(0.95)',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like easing
                  pointerEvents: 'none',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 102, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                  whiteSpace: 'nowrap'
                }}
              >
                {sec.label}
              </span>

              {/* Node Dot Container (keeps dot centered during scale) */}
              <div style={{
                width: '14px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexShrink: 0
              }}>
                {/* Node Dot */}
                <div 
                  className={isActive ? 'active-pulse' : ''}
                  style={{
                    width: isActive ? '12px' : '8px',
                    height: isActive ? '12px' : '8px',
                    borderRadius: '50%',
                    backgroundColor: isFilled ? '#0066FF' : 'var(--surface, #fff)',
                    border: isFilled ? 'none' : '2px solid var(--border, #ccc)',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        /* Hover state for non-active labels */
        .scroll-nav-node-wrapper:hover .scroll-nav-label {
          opacity: 1 !important;
          transform: translateX(0) scale(1) !important;
        }
        
        /* Click interaction scale */
        .scroll-nav-node-wrapper:active {
          transform: scale(0.96);
          transition: transform 0.1s ease;
        }

        /* Subtle pulse for the active dot */
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.6); }
          100% { box-shadow: 0 0 0 8px rgba(0, 102, 255, 0); }
        }
        
        .active-pulse {
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @media (max-width: 1024px) {
          .scroll-navigator-fixed {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollNavigator;