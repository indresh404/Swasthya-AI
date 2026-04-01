'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import aiPulse from '../../../public/animations/ai_pulse.json';

interface HealthSummaryCardProps {
  summary: string;
}

export default function HealthSummaryCard({ summary }: HealthSummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0f2b5b] via-[#163e80] to-[#1a4a9e] rounded-2xl p-7 shadow-card relative h-full flex flex-col justify-between overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/20 transition-all duration-500" />
      
      <div className="relative">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-sora text-base font-semibold text-white tracking-tight">AI Health Analysis</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20 text-[10px] font-bold text-blue-200 uppercase tracking-widest animate-pulse">Live</span>
          </div>
          <div className="w-10 h-10">
            <Lottie animationData={aiPulse} loop={true} />
          </div>
        </header>

        <p className="font-dm-sans text-sm leading-[1.8] text-white/80 font-normal">
          {summary}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 relative">
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[11px] font-semibold text-white">85% Adherence</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-risk-orange" />
          <span className="text-[11px] font-semibold text-white">3 Active Flags</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-risk-yellow" />
          <span className="text-[11px] font-semibold text-white">30-day Trend ↑</span>
        </div>
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">✦ Swasthya AI Engine 2.0</span>
        <span className="text-[10px] text-white/40">Today 8:00 AM</span>
      </footer>
    </div>
  );
}
