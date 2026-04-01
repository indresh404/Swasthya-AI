'use client'

import React from 'react';
import { patient } from '@/data/mockPatient';
import { MapPin, Phone, Activity, ShieldCheck } from 'lucide-react';

export default function ProfileCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-card-border h-full flex flex-col justify-center">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        {/* Avatar Area */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-4 border-white shadow-md">
            <span className="font-sora text-3xl font-bold text-blue-700">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white shadow-sm ring-1 ring-green-600/20">
            <ShieldCheck size={14} />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-sora text-2xl font-bold text-blue-900">{patient.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 mt-2">
              <span className="text-sm font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-card-border">{patient.age} yrs</span>
              <span className="text-sm font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-card-border">{patient.gender}</span>
              <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-100">
                <Activity size={14} className="text-risk-red" />
                <span className="font-bold">{patient.bloodGroup}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold tracking-wide">
              <MapPin size={14} className="text-blue-400" /> {patient.city}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold tracking-wide">
              <Phone size={14} className="text-blue-400" /> +91 98765 43210
            </div>
          </div>
        </div>

        {/* Stats Area */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto mt-4 md:mt-0 max-w-[240px] md:max-w-none mx-auto">
          <div className="bg-surface p-4 rounded-xl border border-card-border text-center flex flex-col justify-center min-w-[90px] shadow-sm">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Height</p>
            <p className="font-mono text-xl font-bold text-blue-900">178 cm</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-card-border text-center flex flex-col justify-center min-w-[90px] shadow-sm">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Weight</p>
            <p className="font-mono text-xl font-bold text-blue-900">76 kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
