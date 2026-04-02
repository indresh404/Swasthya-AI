'use client'

import React from 'react';
import { motion } from 'framer-motion';
import HealthSummaryCard from './HealthSummaryCard';
import RiskSpeedometer from './RiskSpeedometer';
import AIClinicalInsights from './AIClinicalInsights';
import { SystemGrid } from './SystemGrid';
import LiveVitalsChart from './LiveVitalsChart';
import RiskTrendChart from './RiskTrendChart';
import WatchAnalyticsRow from './WatchAnalyticsRow';
import SleepCycleChart from './SleepCycleChart';
import SchemesBanner from './SchemesBanner';
import { patient } from '@/data/mockPatient';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface DashboardMainProps {
  onBodyMapOpen: () => void;
}

export default function DashboardMain({ onBodyMapOpen }: DashboardMainProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-[1200px] mx-auto space-y-10 pb-24 px-4 md:px-0"
    >
      <header className="mb-4 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
               <ShieldCheck size={16} className="text-primary" />
             </div>
             <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Clinical Health ID: #SW-9431</span>
           </div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline font-extrabold text-3xl md:text-5xl text-on-surface tracking-tight"
          >
            Welcome back, <span className="text-primary">{patient.name.split(' ')[0]}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body font-medium text-on-surface-variant mt-2 max-w-xl"
          >
            Your individualized health intelligence hub is ready.
          </motion.p>
        </div>
      </header>

      {/* 1. RISK SCORE (FIRST) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <RiskSpeedometer score={67} />
        </div>
      </section>

      {/* 2. SCHEME OVERVIEW (BELOW RISK) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-[0.3em]">Matched Health Schemes</h3>
           <div className="h-[1px] flex-1 mx-2 md:mx-6 bg-surface-container" />
        </div>
        <SchemesBanner />
      </section>

      {/* 3. 3D BODY MODEL BANNER (BELOW SCHEME) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <motion.button
          onClick={onBodyMapOpen}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10 px-6 py-8 md:px-10 md:py-10 bg-black text-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/10 group overflow-hidden relative"
        >
          {/* Abstract background pulse */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700" />
          
          <div className="flex items-center gap-5 md:gap-8 relative z-10">
            <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
              <Activity size={28} className="text-secondary animate-pulse md:hidden" />
              <Activity size={40} className="text-secondary animate-pulse hidden md:block" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary animate-pulse" />
                 <span className="text-[10px] md:text-[11px] font-bold text-outline uppercase tracking-[0.2em] md:tracking-[0.3em]">AI Visualization</span>
              </div>
              <h3 className="font-headline font-extrabold text-xl md:text-4xl tracking-tight leading-tight mb-1 md:mb-2 break-words">3D Diagnostic Body Map</h3>
              <p className="text-white/60 font-medium max-w-sm text-xs hidden md:block">Rotate and inspect your physiological hotspots identified by AI analysis.</p>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:items-end relative z-10 shrink-0 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
             <div className="text-[10px] md:text-[11px] font-extrabold text-outline uppercase tracking-widest whitespace-nowrap">Click here to view</div>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:translate-x-2 transition-all">
                <span className="text-lg md:text-xl">→</span>
             </div>
          </div>
        </motion.button>
      </section>

      {/* 4. AI CLINICAL INSIGHTS */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450 fill-mode-both">
        <AIClinicalInsights />
      </section>

      {/* 5. WATCH METRICS */}
      <section>
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-extrabold text-outline uppercase tracking-[0.3em] flex items-center gap-2">
               <Zap size={14} className="text-secondary" />
               Smart Watch Intelligence
            </h3>
            <div className="h-[1px] flex-1 mx-2 md:mx-6 bg-surface-container" />
         </div>
         <WatchAnalyticsRow />
      </section>

      {/* 6. HEALTH INDEX GRID */}
      <section>
        <SystemGrid />
      </section>

      {/* 7. SLEEP & RECOVERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <SleepCycleChart />
        </div>
        <div className="lg:col-span-5 h-full">
           <HealthSummaryCard summary={patient.aiSummary} />
        </div>
      </div>

      {/* 8. VITALS & FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <LiveVitalsChart />
        </div>
        <div className="lg:col-span-4">
          <RiskTrendChart />
        </div>
      </div>
    </motion.div>
  );
}
