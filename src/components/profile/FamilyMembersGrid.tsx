'use client'

import React from 'react';
import { familyMembers } from '@/data/mockFamily';
import { AlertCircle, Plus, Users, ShieldCheck } from 'lucide-react';

export default function FamilyMembersGrid() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-card-border p-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <h3 className="font-sora text-base font-bold text-blue-900 flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          Linked Family
        </h3>
        <button className="text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full ring-1 ring-blue-500/20 shadow-sm">
          <Plus size={14} />
          Add Member
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {familyMembers.map((member) => (
          <div key={member.id} className="p-4 rounded-xl border border-card-border bg-surface flex flex-col hover:border-blue-200 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-sora font-bold text-blue-700 text-sm shadow-sm ring-2 ring-white">
                {member.avatar}
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                member.riskLevel === 'Elevated' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : member.riskLevel === 'Moderate'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                Score: {member.riskScore}
              </span>
            </div>

            <div className="flex-1">
              <h4 className="font-sora text-sm font-bold text-blue-900 group-hover:text-blue-600 transition-colors">{member.name}</h4>
              <p className="text-[11px] text-text-secondary font-bold mt-0.5 uppercase tracking-wide">{member.relation} · {member.age} yrs</p>
              
              <div className="mt-3 flex flex-wrap gap-1.5">
                {member.conditions.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-md bg-white border border-card-border text-[10px] text-text-muted font-bold truncate max-w-full shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {member.riskLevel === 'Elevated' ? (
              <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between gap-1.5 text-risk-red text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Action Required
                </span>
                <span className="px-2 py-0.5 bg-red-50 rounded text-[9px] uppercase tracking-widest text-red-600 font-bold border border-red-100 cursor-pointer hover:bg-red-100 transition-colors shadow-sm">Review</span>
              </div>
            ) : member.riskLevel === 'Moderate' ? (
              <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between gap-1.5 text-risk-orange text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-orange" />
                  Monitor
                </span>
              </div>
            ) : (
               <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between gap-1.5 text-green-600 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Stable
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
