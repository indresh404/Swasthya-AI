'use client'

import React from 'react';
import { Bell, Activity } from 'lucide-react';
import { Section } from '@/hooks/useSection';
import { motion } from 'framer-motion';

interface TopBarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  setBodyMapOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as Section, label: 'Dashboard' },
  { id: 'checkin' as Section, label: 'Daily Check-in' },
  { id: 'medicine' as Section, label: 'Medicines' },
  { id: 'profile' as Section, label: 'Profile' },
];

export default function TopBar({ activeSection, setActiveSection, setBodyMapOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-card-border shadow-sm px-4 md:px-8 flex items-center justify-between h-[72px] shrink-0">
      
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('dashboard')}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md border-2 border-white/50">
          <span className="font-sora font-extrabold text-white text-lg">S</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <span className="font-sora font-bold text-blue-900 text-xl tracking-tight">Swasthya</span>
          <span className="font-sora font-extrabold text-blue-500 text-xl">AI</span>
        </div>
      </div>

      {/* Desktop Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-2 p-1.5 rounded-full border border-card-border shadow-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive ? 'text-blue-700' : 'text-text-secondary hover:text-blue-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Body Map Button */}
        <button
          onClick={() => setBodyMapOpen(true)}
          className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-950 to-blue-900 rounded-full hover:from-black hover:to-gray-900 transition-all shadow-md group border border-blue-800/50"
        >
          <Activity size={16} className="text-green-400 group-hover:animate-pulse" strokeWidth={3} />
          <span className="hidden md:inline text-xs font-bold text-white tracking-widest uppercase">3D Map</span>
        </button>

        {/* Sync Status (Mobile) */}
        <div className="flex md:hidden items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-card-border shadow-sm text-blue-600">
          <span className="font-sora font-bold text-[12px]">{NAV_ITEMS.find(i => i.id === activeSection)?.label}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-full hover:bg-surface-2 transition-colors text-text-secondary bg-surface border border-card-border/50 shadow-sm active:scale-95">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-risk-red rounded-full border-2 border-white pointer-events-none"></span>
        </button>

        {/* User Mini Profile */}
        <button onClick={() => setActiveSection('profile')} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 font-sora text-sm font-bold text-blue-700 ring-2 ring-white shadow-sm border border-card-border cursor-pointer hover:bg-blue-200 transition-colors active:scale-95">
          AM
        </button>

      </div>
    </header>
  );
}
