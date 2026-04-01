'use client'

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, Download } from 'lucide-react';
import { patient } from '@/data/mockPatient';

export default function FamilyQRCard() {
  const qrData = JSON.stringify({
    name: patient.name,
    blood: patient.bloodGroup,
    emergencyContact: '+91 98765 43210',
    conditions: patient.conditions
  });

  return (
    <div className="bg-gradient-to-br from-blue-900 to-[#0f2b5b] rounded-2xl p-6 shadow-card text-white flex flex-col items-center justify-between h-full relative overflow-hidden group">
      {/* Decorative */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all duration-700 pointer-events-none" />
      
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <h3 className="font-sora text-sm font-bold flex items-center gap-2">
          <ShieldAlert size={16} className="text-risk-red animate-pulse" />
          Emergency QR
        </h3>
        <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white hover:text-white border border-white/10 backdrop-blur-sm shadow-sm ring-1 ring-white/10">
          <Download size={14} />
        </button>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] z-10 mt-2 mb-6 ring-4 ring-white/20">
        <QRCodeSVG 
          value={qrData}
          size={140}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="M"
          includeMargin={false}
        />
      </div>

      <p className="text-[11px] text-blue-100 text-center font-semibold leading-relaxed max-w-[200px] z-10 bg-black/20 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5 shadow-inner">
        Scan to access critical medical records instantly in an emergency.
      </p>
    </div>
  );
}
