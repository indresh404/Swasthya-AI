'use client'

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', taken: 4, skipped: 0 },
  { day: 'Tue', taken: 3, skipped: 1 },
  { day: 'Wed', taken: 4, skipped: 0 },
  { day: 'Thu', taken: 2, skipped: 2 },
  { day: 'Fri', taken: 4, skipped: 0 },
  { day: 'Sat', taken: 3, skipped: 1 },
  { day: 'Sun', taken: 2, skipped: 0 }, // partial today mock
];

export default function AdherenceChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const taken = payload[0].value || 0;
      const skipped = payload[1]?.value || 0;
      const total = taken + skipped;
      const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
      
      return (
        <div className="bg-white p-4 border border-card-border rounded-xl shadow-card min-w-[140px]">
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-3 border-b border-card-border pb-2">{label}</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Taken
              </span>
              <span className="font-mono text-green-700">{taken}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-risk-red"></span> Skipped
              </span>
              <span className="font-mono text-risk-red">{skipped}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-card-border flex justify-between items-center text-sm">
              <span className="text-blue-900 font-bold">Adherence</span>
              <span className="font-mono font-bold text-blue-600">{percent}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-card-border w-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-sora text-base font-bold text-blue-900">Weekly Adherence</h3>
          <p className="text-[11px] text-text-muted mt-1 uppercase tracking-widest font-semibold">Medicine Tracker Activity</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 shadow-sm w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest">85% Adherence · 4/7 perfect days</span>
        </div>
      </header>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
              dy={16} 
            />
            <YAxis hide domain={[0, 'dataMax + 1']} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.5 }} />
            
            <Bar dataKey="taken" stackId="a" fill="#10b981" animationDuration={1500} radius={[0, 0, 6, 6]} />
            <Bar dataKey="skipped" stackId="a" fill="#ef4444" animationDuration={1500} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
