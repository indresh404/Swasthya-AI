'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { medicines } from '@/data/mockMedicines';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import checkmarkAnim from '../../../public/animations/checkmark.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Group medicines by time slots roughly based on the mock data string match
const BLOCKS = [
  { id: 'morning', label: 'Morning 8AM', filterTime: '08:00' },
  { id: 'afternoon', label: 'Afternoon 1PM', filterTime: '13:00' },
  { id: 'evening', label: 'Evening 6PM', filterTime: '20:00' }, // mock data uses 20:00 for Metformin
  { id: 'night', label: 'Night 9PM', filterTime: '21:00' },
];

export default function MedicineSchedule() {
  const [currentTime, setCurrentTime] = useState('');
  
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    medicines.forEach(m => {
      m.times.forEach((t, i) => {
        initial[`${m.id}-${t}`] = m.takenToday[i] || false;
      });
    });
    return initial;
  });

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkTaken = (medId: string, medName: string, dosage: string, time: string) => {
    setTakenMap(prev => ({ ...prev, [`${medId}-${time}`]: true }));
    toast.success(`${medName} ${dosage} marked as taken`, {
      icon: '✅',
      style: { fontWeight: 600, fontSize: '14px', borderRadius: '12px' },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-card-border overflow-hidden">
      <header className="p-6 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-sora text-lg font-bold text-blue-900">Today's Schedule</h3>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
          <Clock size={14} className="text-blue-500" />
          <span className="font-mono text-sm font-bold text-slate-700">{currentTime || '--:--'}</span>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {BLOCKS.map(block => {
          const blockMeds = medicines.filter(m => m.times.includes(block.filterTime));
          
          if (blockMeds.length === 0) return null;

          return (
            <div key={block.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="font-sora text-sm font-bold text-text-primary">{block.label}</h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 uppercase">
                  {blockMeds.length} medicine{blockMeds.length > 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-[1px] bg-card-border" />
              </div>

              <div className="space-y-3">
                {blockMeds.map(med => {
                  const isTaken = takenMap[`${med.id}-${block.filterTime}`];
                  
                  return (
                    <MedicineCard 
                      key={`${med.id}-${block.filterTime}`}
                      med={med}
                      time={block.filterTime}
                      isTaken={isTaken}
                      onMarkTaken={() => handleMarkTaken(med.id, med.name, med.dosage, block.filterTime)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MedicineCard({ med, time, isTaken, onMarkTaken }: { med: any, time: string, isTaken: boolean, onMarkTaken: () => void }) {
  const [played, setPlayed] = useState(false);

  return (
    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${isTaken ? 'bg-green-50/30 border-green-100' : 'bg-white border-card-border shadow-sm hover:border-blue-200'}`}>
      
      <div className="flex items-center gap-3 w-full sm:w-[40%]">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: med.color }} />
        <div>
          <h5 className="font-sora text-sm font-bold text-blue-900 leading-tight">{med.name}</h5>
          <span className="inline-block mt-1 font-mono text-[10px] font-semibold bg-surface-2 text-text-secondary px-1.5 py-0.5 rounded">
            {med.dosage}
          </span>
        </div>
      </div>

      <div className="w-full sm:w-[30%]">
        <span className="text-[11px] font-medium text-text-secondary bg-surface px-2 py-1 rounded-md border border-card-border">
          {med.condition}
        </span>
      </div>

      <div className="w-full sm:w-[30%] flex justify-end">
        {isTaken ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full w-fit">
            <div className="w-5 h-5 flex items-center justify-center -ml-1">
              <Lottie 
                animationData={checkmarkAnim} 
                loop={false} 
                autoplay={true}
                onComplete={() => setPlayed(true)}
              />
            </div>
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest leading-none">Taken</span>
          </div>
        ) : (
          <button
            onClick={onMarkTaken}
            className="px-5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded-full text-xs font-bold w-full sm:w-auto text-center"
          >
            Mark Taken
          </button>
        )}
      </div>

    </div>
  );
}
