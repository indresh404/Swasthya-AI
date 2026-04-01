'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, PlusCircle, Clock } from 'lucide-react';
import { useConflictCheck } from '@/hooks/useConflictCheck';
import ConflictWarning from './ConflictWarning';
import { medicines } from '@/data/mockMedicines';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (med: any) => void;
}

const COMMON_DRUGS = [
  "Aspirin", "Ibuprofen", "Omeprazole", "Lisinopril", "Amlodipine", "Levothyroxine", "Atorvastatin"
];

export default function AddMedicineModal({ isOpen, onClose, onAdd }: AddMedicineModalProps) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  
  const { checkConflict } = useConflictCheck();

  const handleSelect = (drug: string) => {
    setSelectedMeds(prev => prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]);
  };

  const handleNext = () => {
    setStep(2);
  };

  const conflicts = selectedMeds
    .map(med => checkConflict(med, medicines.map(m => m.name)))
    .filter(Boolean);

  const hasHighRisk = conflicts.some(c => c?.severity === 'danger');

  const filteredDrugs = COMMON_DRUGS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <header className="p-4 border-b border-card-border flex items-center justify-between bg-surface">
              <h2 className="font-sora text-sm font-bold text-blue-900">Add New Medicine</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-2 text-text-muted transition-colors">
                <X size={18} />
              </button>
            </header>

            <div className="p-6 overflow-y-auto no-scrollbar min-h-[350px]">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search medicine name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-card-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-text-muted"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Common Medicines</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredDrugs.map(drug => {
                        const isSelected = selectedMeds.includes(drug);
                        return (
                          <button
                            key={drug}
                            onClick={() => handleSelect(drug)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-surface border-card-border text-text-secondary hover:border-blue-300'
                            }`}
                          >
                            {drug}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {conflicts.map((conflict, i) => (
                      conflict && <ConflictWarning key={i} conflict={conflict as any} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-text-secondary font-medium pb-4 border-b border-card-border">
                    Configure schedule for <span className="font-bold text-blue-900">{selectedMeds.join(', ')}</span>
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg, 1 tablet"
                      className="w-full bg-surface border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-text-primary placeholder:text-text-muted/70"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-1">Time & Frequency</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-500 bg-blue-50 text-blue-700 text-xs font-bold transition-all shadow-sm">
                        <Clock size={14} /> Morning
                      </button>
                      <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-card-border bg-surface text-text-secondary hover:border-blue-200 text-xs font-bold transition-all">
                        <Clock size={14} /> Afternoon
                      </button>
                      <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-card-border bg-surface text-text-secondary hover:border-blue-200 text-xs font-bold transition-all">
                        <Clock size={14} /> Evening
                      </button>
                      <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-card-border bg-surface text-text-secondary hover:border-blue-200 text-xs font-bold transition-all">
                        <Clock size={14} /> Night
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="p-4 border-t border-card-border bg-surface flex items-center justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selectedMeds.length === 0 || hasHighRisk}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAdd({ name: selectedMeds[0] });
                    onClose();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <PlusCircle size={14} />
                  Add to Schedule
                </button>
              )}
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
