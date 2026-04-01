'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Pill, Sparkles } from 'lucide-react';

export default function WeeklySummaryCard() {
  const stats = [
    { icon: <CheckCircle2 size={20} className="text-green-400" />, text: "No new critical alerts this week", color: "text-green-50" },
    { icon: <AlertTriangle size={20} className="text-risk-orange" />, text: "Lower back pain flagged · 3 consecutive days", color: "text-orange-50" },
    { icon: <Pill size={20} className="text-blue-300" />, text: "Metformin missed twice · Adherence 85%", color: "text-blue-50" },
  ];

  return (
    <div className="bg-gradient-to-r from-[#1a4a9e] to-[#2563eb] rounded-2xl p-6 shadow-card mb-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="summary-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#summary-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold leading-tight ${stat.color}`}>
                {stat.text}
              </span>
              {i < stats.length - 1 && (
                <div className="hidden lg:block w-[1px] h-8 bg-white/10 ml-6" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-white/60 text-[11px] font-bold uppercase tracking-widest bg-black/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm self-end lg:self-center">
          <Sparkles size={14} className="text-blue-300 animate-pulse" />
          7-day AI Summary · Apr 1, 8:00 AM
        </div>
      </div>
    </div>
  );
}
