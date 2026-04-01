'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

interface ConflictWarningProps {
  conflict: {
    withMed: string;
    severity: 'high' | 'moderate' | 'low';
    message: string;
  };
}

export default function ConflictWarning({ conflict }: ConflictWarningProps) {
  const isHigh = conflict.severity === 'high';
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      className={`rounded-xl p-4 flex gap-3 shadow-sm border mt-4 overflow-hidden ${
        isHigh 
          ? 'bg-red-50/80 border-red-200 text-red-900' 
          : 'bg-orange-50/80 border-orange-200 text-orange-900'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isHigh ? (
          <AlertTriangle size={18} className="text-risk-red animate-pulse" />
        ) : (
          <Info size={18} className="text-risk-orange" />
        )}
      </div>
      
      <div className="flex-1">
        <h5 className={`font-sora text-xs font-bold mb-1 ${isHigh ? 'text-red-800' : 'text-orange-800'}`}>
          Interaction detected with {conflict.withMed}
        </h5>
        <p className={`text-[11px] leading-relaxed font-medium ${isHigh ? 'text-red-700/80' : 'text-orange-700/80'}`}>
          {conflict.message}
        </p>
      </div>
    </motion.div>
  );
}
