'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import AdherenceChart from './AdherenceChart';
import MedicineSchedule from './MedicineSchedule';
import AddMedicineModal from './AddMedicineModal';

export default function MedicineMain() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora text-xl font-bold text-blue-900">Treatment Plan</h2>
          <p className="text-sm text-text-secondary font-medium mt-1">Manage prescriptions and track adherence</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-sora font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
             Add Medicine
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <MedicineSchedule />
        </div>
        
        <div className="xl:col-span-1 space-y-6">
          <AdherenceChart />
          
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h4 className="font-sora text-sm font-bold text-blue-900 mb-1">AI Recommendation</h4>
              <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                Try setting your evening Metformin reminder closer to your usual dinner time (8:30 PM) to improve absorption and avoid empty stomach side effects.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddMedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={(med) => console.log('Added', med)} 
      />
    </motion.div>
  );
}
