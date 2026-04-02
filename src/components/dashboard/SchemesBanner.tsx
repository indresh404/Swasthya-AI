'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { schemes } from '@/data/schemes';

export default function SchemesBanner() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.005 }}
        onClick={() => setIsPanelOpen(true)}
        className="relative overflow-hidden rounded-3xl bg-secondary p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl ring-1 ring-white/20 cursor-pointer group"
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl md:text-3xl shadow-inner">
            🏥
          </div>
          <div>
            <h3 className="font-sora text-base md:text-xl font-bold text-white mb-1">
              You may qualify for free government healthcare
            </h3>
            <p className="text-xs md:text-sm text-green-50 font-dm-sans opacity-95">
              3 schemes match your cardiac risk profile and location in Mumbai
            </p>
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsPanelOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary font-headline font-bold text-xs rounded-2xl shadow-lg hover:bg-surface transition-all group active:scale-95 whitespace-nowrap"
        >
          Click here to view
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      <AnimatePresence>
        {isPanelOpen && (
          <SchemesPanel onClose={() => setIsPanelOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function SchemesPanel({ onClose }: { onClose: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
      >
        <header className="p-6 border-b border-card-border flex items-center justify-between">
          <div>
            <h2 className="font-sora text-xl font-bold text-blue-900">Health Schemes</h2>
            <p className="text-xs text-text-muted mt-1 font-semibold uppercase tracking-wider">Matched to your profile</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-risk-red/10 hover:text-risk-red transition-colors flex items-center justify-center text-text-muted"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full w-fit mb-4">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">3 Potential Matches</span>
          </div>

          {schemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white border border-card-border rounded-xl shadow-sm overflow-hidden transition-all duration-300"
              style={{ borderLeft: `4px solid ${scheme.badgeColor}` }}
            >
              <button 
                onClick={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-sora text-sm font-bold text-blue-900">{scheme.name}</h4>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase">{scheme.shortName}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-green-600">{scheme.coverage}</span>
                    <span className="text-[10px] text-text-muted">coverage</span>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-blue-500 bg-blue-50/50 px-2 py-0.5 rounded-full w-fit">
                    ✓ {scheme.matchReason}
                  </div>
                </div>
                <div className={`mt-1 transform transition-transform duration-300 ${expandedId === scheme.id ? 'rotate-180' : ''}`}>
                  <ArrowRight size={16} className="rotate-90 text-text-muted" />
                </div>
              </button>

              <AnimatePresence>
                {expandedId === scheme.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-card-border space-y-4">
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div>
                          <p className="text-[10px] text-text-muted font-bold uppercase mb-1">Age Group</p>
                          <p className="text-xs font-semibold">{scheme.ageRange}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-text-muted font-bold uppercase mb-1">Eligibility</p>
                          <p className="text-xs font-semibold">{scheme.eligibility}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Required Documents</p>
                        <ul className="grid grid-cols-1 gap-2">
                          {scheme.documents.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                              <Shield size={12} className="text-blue-400" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Nearby Empanelled Hospitals</p>
                        <div className="space-y-2">
                          {scheme.hospitals.map((hosp, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-surface rounded-lg border border-card-border">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">🏥</span>
                                <span className="text-[11px] font-bold text-blue-900">{hosp.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-blue-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{hosp.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button className="w-full py-3 bg-blue-600 text-white font-sora font-semibold text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
                        Apply via Portal
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
