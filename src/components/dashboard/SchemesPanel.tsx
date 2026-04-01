'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, MapPin, FileText } from 'lucide-react';
import { schemes } from '@/data/schemes';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SchemesPanel({ open, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-blue-50 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-blue-900">
                  Government Schemes
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  4 schemes match your profile
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Scheme cards */}
            <div className="p-6 space-y-4">
              {schemes.map((scheme) => {
                const isExpanded = expandedId === scheme.id;
                return (
                  <motion.div
                    key={scheme.id}
                    layout
                    className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderLeft: '4px solid #10B981' }}
                  >
                    {/* Collapsed header */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : scheme.id)
                      }
                      className="w-full text-left px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex-1 mr-4">
                        <h4 className="font-bold text-blue-900 text-sm">
                          {scheme.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Coverage: {scheme.coverage}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-blue-50 pt-4">
                            {/* Categories */}
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                Covers
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {scheme.covers.map((cat) => (
                                  <span
                                    key={cat}
                                    className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Eligibility */}
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                Eligibility
                              </span>
                              <p className="text-sm text-slate-700 mt-1">
                                {scheme.eligibility}
                              </p>
                            </div>

                            {/* Documents */}
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                Required Documents
                              </span>
                              <ul className="mt-1.5 space-y-1">
                                {scheme.documents.map((doc) => (
                                  <li
                                    key={doc}
                                    className="text-xs text-slate-600 flex items-center"
                                  >
                                    <span className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Hospitals */}
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                Nearby Hospitals
                              </span>
                              <ul className="mt-1.5 space-y-1.5">
                                {scheme.hospitals.map((h) => (
                                  <li
                                    key={h.name}
                                    className="text-xs text-slate-600 flex items-center justify-between bg-blue-50/50 px-3 py-2 rounded-lg"
                                  >
                                    <span>{h.name}</span>
                                    <span className="text-blue-500 font-medium">
                                      {h.distance}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
