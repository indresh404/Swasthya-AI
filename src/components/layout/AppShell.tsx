'use client'

import React from 'react';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { Section } from '@/hooks/useSection';
import { Toaster } from 'react-hot-toast';

interface AppShellProps {
  children: React.ReactNode;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  setBodyMapOpen: (open: boolean) => void;
}

export default function AppShell({ 
  children, 
  activeSection, 
  setActiveSection, 
  setBodyMapOpen 
}: AppShellProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-surface overflow-hidden">
      <TopBar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        setBodyMapOpen={setBodyMapOpen}
      />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-28 md:pb-8 pt-6 w-full relative">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-full flex flex-col">
          {children}
        </div>
      </main>

      <BottomBar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #dbeafe',
            boxShadow: '0 4px 24px rgba(37,99,235,0.07)',
          }
        }}
      />
    </div>
  );
}
