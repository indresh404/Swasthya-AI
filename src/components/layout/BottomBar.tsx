'use client'

import React from 'react';
import { Home, MessageSquare, Bot, Pill, User } from 'lucide-react';
import { Section } from '@/hooks/useSection';

interface BottomBarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

export default function BottomBar({ activeSection, setActiveSection }: BottomBarProps) {
  const items: { id: Section | 'ai'; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'checkin', label: 'Check-in', icon: MessageSquare },
    { id: 'ai', label: 'AI Check-in', icon: Bot },
    { id: 'medicine', label: 'Meds', icon: Pill },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-4 w-[min(95vw,420px)] pb-safe outline-none">
      <div className="bg-white/90 backdrop-blur-xl border border-blue-500/10 rounded-full h-[68px] flex items-center justify-between px-3 shadow-[0_8px_40px_rgba(37,99,235,0.18)]">
        {items.map((item) => {
          const isActive = activeSection === item.id || (item.id === 'ai' && activeSection === 'checkin');
          
          if (item.id === 'ai') {
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection('checkin' as Section)}
                className="relative -top-7 group flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-[0_8px_32px_rgba(37,99,235,0.5)] border-[5px] border-white group-hover:scale-105 transition-transform">
                  <Bot size={28} className={isActive ? 'animate-pulse' : ''} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-300 ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-blue-500 font-medium'
              }`}
            >
              <item.icon 
                size={isActive ? 22 : 20} 
                className={`transition-all duration-300 ${isActive ? 'mb-1 drop-shadow-sm text-blue-600' : 'mb-0.5 opacity-80'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] transition-all duration-300`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
