'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface RiskSpeedometerProps {
  score: number;
}

export default function RiskSpeedometer({ score }: RiskSpeedometerProps) {
  // Needle rotation: 0 score = -90deg, 100 score = 90deg (semicircle)
  // Actually, let's map 0-100 to 0-180 degrees
  const angle = (score / 100) * 180 - 90;

  const getRiskColor = (s: number) => {
    if (s < 40) return 'var(--risk-green)';
    if (s < 70) return 'var(--risk-yellow)';
    if (s < 85) return 'var(--risk-orange)';
    return 'var(--risk-red)';
  };

  const getRiskLabel = (s: number) => {
    if (s < 40) return 'Low Risk';
    if (s < 70) return 'Moderate Risk';
    if (s < 85) return 'Elevated Risk';
    return 'High Risk';
  };

  return (
    <div className="bg-white rounded-2xl p-7 shadow-card border border-card-border flex flex-col items-center">
      <h3 className="font-sora text-sm font-semibold text-text-secondary self-start mb-6">Health Risk Score</h3>
      
      <div className="relative w-full max-w-[280px]">
        <svg viewBox="0 0 280 180" className="w-full">
          {/* Background Track */}
          <path
            d="M 40 150 A 100 100 0 0 1 240 150"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Segments */}
          {/* Green: 0-40% */}
          <path
            d="M 40 150 A 100 100 0 0 1 101.8 71.4"
            fill="none"
            stroke="var(--risk-green)"
            strokeWidth="20"
            strokeDasharray="0"
          />
          {/* Yellow: 40-70% */}
          <path
            d="M 101.8 71.4 A 100 100 0 0 1 202.8 81.3"
            fill="none"
            stroke="var(--risk-yellow)"
            strokeWidth="20"
          />
          {/* Orange: 70-85% */}
          <path
            d="M 202.8 81.3 A 100 100 0 0 1 234.6 114.1"
            fill="none"
            stroke="var(--risk-orange)"
            strokeWidth="20"
          />
          {/* Red: 85-100% */}
          <path
            d="M 234.6 114.1 A 100 100 0 0 1 240 150"
            fill="none"
            stroke="var(--risk-red)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            style={{ originX: "140px", originY: "150px" }}
          >
            <line
              x1="140" y1="150"
              x2="140" y2="60"
              stroke="var(--blue-900)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="140" cy="150" r="6" fill="var(--blue-900)" />
          </motion.g>
        </svg>

        {/* Center Label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div className="font-mono text-4xl font-bold text-blue-900 leading-none">{score}</div>
          <div className="font-sora text-xs font-semibold mt-1" style={{ color: getRiskColor(score) }}>
            {getRiskLabel(score)}
          </div>
        </div>

        {/* Min/Max Labels */}
        <div className="absolute bottom-0 left-6 text-[10px] text-text-muted font-medium uppercase tracking-wider">Low</div>
        <div className="absolute bottom-0 right-6 text-[10px] text-text-muted font-medium uppercase tracking-wider">High</div>
      </div>

      <div className="w-full mt-6 flex items-center justify-between border-t border-card-border pt-4">
        <div className="text-xs font-medium text-risk-orange flex items-center gap-1">
          <span>↑ +4 pts</span>
          <span className="text-text-muted font-normal">from last week</span>
        </div>
        <div className="px-2 py-1 bg-surface-2 rounded-full text-[10px] text-text-secondary font-medium">
          Updated Today
        </div>
      </div>
    </div>
  );
}
