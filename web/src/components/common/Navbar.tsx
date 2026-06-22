// src/components/common/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from '../ui/Button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isSkipLogin = localStorage.getItem('skipLogin') === 'true';

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: isMobile ? (scrolled ? '8px' : '12px') : (scrolled ? '12px' : '20px'),
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 'calc(100% - 24px)' : (scrolled ? 'calc(100% - 64px)' : 'calc(100% - 48px)'),
          maxWidth: '1200px',
          height: isMobile ? (scrolled ? '52px' : '58px') : (scrolled ? '60px' : '72px'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 24px',
          zIndex: 1000,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: 'var(--navbar-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: isMobile ? (scrolled ? '12px' : '16px') : (scrolled ? '16px' : '24px'),
          boxShadow: scrolled ? 'var(--shadow-lg)' : 'var(--shadow)',
          boxSizing: 'border-box'
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px' }}>Swasthya AI</span>
        </div>

        {/* Navigation Links - Desktop Only */}
        <div className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/about')}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === '/about' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            About Swasthya AI
          </button>
        </div>

        {/* Right Actions - Desktop Only */}
        <div className="navbar-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(isSkipLogin ? '/dashboard' : '/auth')}
          >
            Doctor Hub &rarr;
          </Button>
        </div>

        {/* Hamburger Mobile Menu Toggle Button */}
        <div className="navbar-mobile-toggle" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Floating Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div
          className="navbar-mobile-dropdown"
          style={{
            position: 'fixed',
            top: isMobile ? (scrolled ? '68px' : '78px') : (scrolled ? '80px' : '100px'),
            left: '12px',
            right: '12px',
            backgroundColor: 'var(--navbar-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 999,
            boxShadow: 'var(--shadow-lg)',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease'
          }}
        >
          <button
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 4px',
              textAlign: 'left'
            }}
          >
            Home
          </button>
          <button
            onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === '/about' ? 'var(--accent)' : 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 4px',
              textAlign: 'left'
            }}
          >
            About Swasthya AI
          </button>
          <div style={{ borderBottom: '1px solid var(--border)', margin: '4px 0' }} />
          <Button
            variant="primary"
            onClick={() => { navigate(isSkipLogin ? '/dashboard' : '/auth'); setMobileMenuOpen(false); }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Doctor Hub &rarr;
          </Button>
        </div>
      )}

      {/* Styled Responsive Classes */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop-links {
            display: none !important;
          }
          .navbar-desktop-actions {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;