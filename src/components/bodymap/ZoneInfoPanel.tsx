'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { X, Activity } from 'lucide-react';

interface ZoneInfoPanelProps {
  zoneId: string;
  data: {
    level: 'green' | 'yellow' | 'orange' | 'red';
    symptoms: string[];
    lastLogged: string;
    aiRec: string;
  };
  onClose: () => void;
}

export default function ZoneInfoPanel({ zoneId, data, onClose }: ZoneInfoPanelProps) {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'red': return 'bg-risk-red text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'yellow': return 'bg-yellow-400 text-slate-900';
      case 'green': return 'bg-green-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col pointer-events-auto h-full max-h-[500px]">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
        <h3 className="font-sora text-lg font-bold text-white capitalize flex items-center gap-2">
          {zoneId.replace(/([A-Z])/g, ' $1').trim()}
          <span className={`w-2.5 h-2.5 rounded-full ${getLevelColor(data.level).split(' ')[0]} animate-pulse`} />
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        <div>
          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
             <span className="w-1 h-3 bg-white/20 rounded-full" />
             Reported Symptoms
          </h4>
          <ul className="space-y-2">
            {data.symptoms.map((symp, i) => (
              <li key={i} className="text-xs text-white/90 bg-white/5 p-2.5 rounded-xl border border-white/5 font-medium leading-relaxed shadow-sm">
                {symp}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
             <span className="w-1 h-3 bg-white/20 rounded-full" />
             Last Logged
          </h4>
          <p className="text-xs font-bold text-white/80 bg-white/5 px-3 py-1.5 rounded-lg w-fit border border-white/5">{data.lastLogged}</p>
        </div>

        <div className="mt-auto pt-2">
          <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 blur-xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Activity size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">AI Recommendation</span>
            </div>
            <p className="text-[11px] text-blue-100/90 leading-relaxed font-semibold relative z-10 bg-black/20 p-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
              {data.aiRec}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
