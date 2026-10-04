// src/components/about/ScrollNavigator.tsx
import React, { useState, useEffect } from 'react';

interface SectionItem {
  id: string;
  label: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'about-hero', label: 'Overview' },
  { id: 'bodymap-section', label: '3D Body' },
  { id: 'patient-graph-section', label: 'Patient Graph' },
  { id: 'family-graph-section', label: 'Family Tree' },
  { id: 'workflow-section', label: 'Agent Workflow' },
  { id: 'agents-section', label: 'Agent Mesh' },
  { id: 'modules-section', label: 'Clinical Modules' },
  { id: 'model-section', label: 'ML Risk Model' },
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
        setScrollProgress(Math.min(Math.max(scrollTop / totalHeight, 0), 1));
      } else {
        setScrollProgress(0);
      }

      let currentSection = SECTIONS[0].id;
      let closestDistance = Infinity;
      
      const viewportCenter = window.innerHeight * 0.4;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          
          if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
            currentSection = section.id;
            closestDistance = 0;
            break;
          }
          
          const distanceToCenter = Math.min(
            Math.abs(rect.top - viewportCenter),
            Math.abs(rect.bottom - viewportCenter)
          );

          if (distanceToCenter < closestDistance) {
            closestDistance = distanceToCenter;
            currentSection = section.id;
          }
        }
      }

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        currentSection = SECTIONS[SECTIONS.length - 1].id;
      }

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(document.body);
    const timeoutId = setTimeout(handleScroll, 500);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="scroll-navigator-container">
      {/* Expanding Glass Morphism Background Card */}
      <div className="glass-card-bg" />

      {/* Progress Track Background */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          bottom: '20px',
          right: '23px',
          width: '2px',
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          borderRadius: '4px',
          zIndex: 0
        }}
      >
        {/* Animated Progress Fill */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0066FF',
            borderRadius: '4px',
            transformOrigin: 'top',
            transform: `scaleY(${scrollProgress})`,
            boxShadow: '0 0 15px rgba(0, 102, 255, 0.8), 0 0 30px rgba(0, 102, 255, 0.4)',
            transition: 'transform 0.1s linear'
          }}
        />
      </div>

      {/* Interactive Nodes / Dots */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {SECTIONS.map((sec, idx) => {
          const isActive = activeSection === sec.id;
          const sectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
          const isFilled = idx <= sectionIndex;

          return (
            <div 
              key={sec.id}
              onClick={() => handleScrollTo(sec.id)}
              className="scroll-nav-node-wrapper"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '28px',
                cursor: 'pointer',
              }}
            >
              {/* Text Label */}
              <span className={`scroll-nav-label ${isActive ? 'active' : ''}`}>
                {sec.label}
              </span>

              {/* Node Dot Container */}
              <div style={{
                width: '16px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div 
                  className={isActive ? 'active-pulse' : ''}
                  style={{
                    width: isActive ? '14px' : (isFilled ? '10px' : '8px'),
                    height: isActive ? '14px' : (isFilled ? '10px' : '8px'),
                    borderRadius: '50%',
                    background: isActive 
                      ? 'linear-gradient(135deg, #0066FF, #0099FF)'
                      : (isFilled 
                        ? 'linear-gradient(135deg, #0066FF, #0099FF)' 
                        : 'rgba(128, 128, 128, 0.3)'),
                    border: isActive 
                      ? '2px solid rgba(255, 255, 255, 0.9)' 
                      : (isFilled ? 'none' : '1px solid rgba(128, 128, 128, 0.4)'),
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isActive 
                      ? '0 0 15px rgba(0, 102, 255, 0.8), 0 0 30px rgba(0, 102, 255, 0.4)' 
                      : (isFilled 
                        ? '0 0 10px rgba(0, 102, 255, 0.4)' 
                        : 'none'),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .scroll-navigator-container {
          position: fixed;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          z-index: 100;
          padding: 20px 16px;
        }

        @media (max-width: 1024px) {
          .scroll-navigator-container {
            display: none !important;
          }
        }

        .glass-card-bg {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 48px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          z-index: -1;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .scroll-navigator-container:hover .glass-card-bg {
          width: 180px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .scroll-nav-label {
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-right: 16px;
          white-space: nowrap;
          color: rgba(0, 0, 0, 0.6);
        }

        .scroll-nav-label.active {
          opacity: 1;
          transform: translateX(0);
          color: #000000;
          font-weight: 700;
        }

        .scroll-navigator-container:hover .scroll-nav-label {
          opacity: 1;
          transform: translateX(0);
        }

        .scroll-nav-node-wrapper:hover .scroll-nav-label {
          color: #0066FF !important;
          text-shadow: none !important;
        }

        .scroll-nav-node-wrapper:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.6), 0 0 15px rgba(0, 102, 255, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(0, 102, 255, 0), 0 0 30px rgba(0, 102, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0), 0 0 15px rgba(0, 102, 255, 0.6); }
        }
        
        .active-pulse {
          animation: pulse-ring 2.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @media (prefers-color-scheme: dark) {
          .glass-card-bg {
            background: rgba(15, 20, 30, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          .scroll-navigator-container:hover .glass-card-bg {
            background: rgba(15, 20, 30, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          .scroll-nav-label {
            color: rgba(255, 255, 255, 0.6);
          }
          .scroll-nav-label.active {
            color: #FFFFFF;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
          .scroll-nav-node-wrapper:hover .scroll-nav-label {
            text-shadow: 0 0 10px rgba(0, 102, 255, 0.4) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollNavigator;