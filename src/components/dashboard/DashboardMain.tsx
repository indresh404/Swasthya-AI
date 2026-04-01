'use client'

import React from 'react';
import { motion } from 'framer-motion';
import HealthSummaryCard from './HealthSummaryCard';
import RiskSpeedometer from './RiskSpeedometer';
import BodySystemCards from './BodySystemCards';
import VitalsGraph from './VitalsGraph';
import RiskTrendChart from './RiskTrendChart';
import SchemesBanner from './SchemesBanner';
import ActivityGraph from './ActivityGraph';
import { patient } from '@/data/mockPatient';
import { Activity } from 'lucide-react';

interface DashboardMainProps {
  onBodyMapOpen: () => void;
}

export default function DashboardMain({ onBodyMapOpen }: DashboardMainProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 pb-6"
    >
      <header className="mb-6 md:mb-8 pt-2">
        <h2 className="font-sora text-3xl font-bold text-blue-900 tracking-tight">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, <span className="text-blue-600">{patient.name.split(' ')[0]}</span></h2>
        <p className="text-sm text-text-secondary font-medium mt-2">Here is your daily health overview.</p>
      </header>
      
      {/* 3D Body Map Banner */}
      <button 
        onClick={onBodyMapOpen}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-6 md:p-8 flex items-center justify-between shadow-xl ring-1 ring-blue-500/20 group hover:shadow-2xl transition-all"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-colors" />
        
        <div className="flex items-center gap-6 relative z-10 w-full text-left">
          <div className="w-14 h-14 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            <Activity className="text-green-400 group-hover:animate-pulse" size={28} />
          </div>
          <div>
            <h3 className="font-sora text-lg md:text-xl font-bold text-white mb-1 tracking-wide">
              Diagnostic 3D Body Map
            </h3>
            <p className="text-sm font-dm-sans text-blue-100/90 hidden sm:block">
              Click to view your interactive 3D health visualizations and diagnostic markers.
            </p>
            <p className="text-sm font-dm-sans text-blue-100/90 sm:hidden">
              Click to view interactive 3D health mapping.
            </p>
          </div>
        </div>
      </button>

      {/* Top Banner */}
      <SchemesBanner />

      {/* Top Row: AI Summary + Risk Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthSummaryCard summary="Your vital signs are stable today. Fasting sugar is slightly elevated compared to last week. Remember to take Metformin post-dinner." />
        </div>
        <div className="lg:col-span-1 min-h-[220px]">
          <RiskSpeedometer score={patient.riskScore} />
        </div>
      </div>

      {/* System Indices */}
      <div>
        <BodySystemCards indices={patient.healthIndices} />
      </div>

      {/* Middle Row: Vitals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[320px]">
          <VitalsGraph />
        </div>
        <div className="min-h-[320px]">
          <ActivityGraph />
        </div>
      </div>

      {/* Bottom Row: Risk Trend */}
      <div className="grid grid-cols-1 md:gap-6">
        <div className="min-h-[300px] w-full">
          <RiskTrendChart />
        </div>
      </div>
    </motion.div>
  );
}
