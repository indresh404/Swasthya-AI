'use client'

import React from 'react';
import { records } from '@/data/mockRecords';
import { Activity, Clock } from 'lucide-react';

export default function MedicalTimeline() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-card-border h-full flex flex-col overflow-hidden">
      <header className="p-6 border-b border-card-border flex items-center justify-between bg-surface">
        <h3 className="font-sora text-sm font-bold text-blue-900 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          Medical History
        </h3>
        <button className="text-[10px] font-bold text-text-muted hover:text-blue-600 transition-colors uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-card-border shadow-sm">
          View All
        </button>
      </header>

      <div className="p-6 overflow-y-auto w-full no-scrollbar relative flex-1 min-h-[400px]">
        {/* Timeline line */}
        <div className="absolute left-6 md:left-10 top-6 bottom-6 w-0.5 bg-card-border flex flex-col justify-between hidden md:flex">
            <div className="w-full h-12 bg-gradient-to-b from-white to-transparent absolute top-0" />
            <div className="w-full h-12 bg-gradient-to-t from-white to-transparent absolute bottom-0" />
        </div>
        
        <div className="space-y-6 relative md:pl-12">
          {records.map((record) => (
            <div key={record.id} className="relative group">
              <div className="absolute -left-12 top-0 mt-1 hidden md:block z-10">
                <div className="w-8 h-8 rounded-full bg-surface border border-card-border shadow-sm flex items-center justify-center text-sm ring-4 ring-white group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
                  {record.icon}
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-4 md:p-5 border border-card-border group-hover:border-blue-200 group-hover:shadow-sm transition-all md:mr-4 relative">
                 {/* Arrow pointer for desktop */}
                 <div className="hidden md:block absolute -left-[7px] top-4 w-3 h-3 bg-surface border-l border-t border-card-border transform -rotate-45 group-hover:border-blue-200 transition-colors" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-sora text-sm font-bold text-blue-900 leading-tight flex items-center gap-2">
                    <span className="md:hidden text-lg">{record.icon}</span> {record.title}
                  </h4>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white px-2 py-0.5 rounded-md border border-card-border w-fit shadow-sm">
                    <Clock size={10} />
                    {record.date}
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 text-blue-600">
                  {record.doctor}
                </p>
                <div className="mt-3 text-[11px] font-medium text-text-primary leading-relaxed bg-white p-3 rounded-xl border border-card-border shadow-sm">
                  {record.detail}
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
