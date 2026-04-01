'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import ZoneInfoPanel from './ZoneInfoPanel';
import { zoneRiskData } from '@/data/heatZones';

const Scene = dynamic(() => import('@/components/3d/Scene'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-blue-400 font-sora text-sm font-bold uppercase tracking-widest animate-pulse">Initializing 3D Engine...</p>
      </div>
    </div>
  )
});

interface BodyMapPanelProps {
  onClose: () => void;
}

export default function BodyMapPanel({ onClose }: BodyMapPanelProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zoneData = selectedZone ? zoneRiskData[selectedZone] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-blue-950/80 backdrop-blur-md"
      />
      
      {/* Main Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full lg:w-[calc(100%-80px)] bg-gradient-to-b from-[#050505] to-[#0a0a0a] shadow-2xl flex flex-col overflow-hidden border-l border-white/5"
      >
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 w-full p-6 flex flex-col md:flex-row md:items-center justify-between z-20 pointer-events-none gap-4">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-auto w-fit">
            <Activity className="text-green-400 animate-pulse" size={16} />
            <h2 className="font-sora text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
              Diagnostic Body Map
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[8px] text-blue-300 border border-blue-400/20">BETA</span>
            </h2>
          </div>

          <div className="pointer-events-auto flex items-center gap-3 self-end md:self-auto">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Drag to rotate</span>
              <div className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Click hotspots</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white flex items-center justify-center transition-colors border border-white/10 shadow-lg"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* 3D Canvas Area */}
        <div className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing">
          {/* Subtle grid background for 3D area to give a technical feel */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
               style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
               
          <Scene onSelect={setSelectedZone} selectedZone={selectedZone} />
        </div>

        {/* Info Panel Overlay */}
        <AnimatePresence>
          {selectedZone && zoneData && (
             <motion.div
               initial={{ opacity: 0, x: 20, scale: 0.95 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: 20, scale: 0.95 }}
               transition={{ type: 'spring', damping: 20, stiffness: 300 }}
               className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:top-24 md:bottom-24 w-auto md:w-full max-w-[340px] pointer-events-none z-30 flex items-center"
             >
                <ZoneInfoPanel zoneId={selectedZone} data={zoneData} onClose={() => setSelectedZone(null)} />
             </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
