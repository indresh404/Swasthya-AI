'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const data = [
  { day: 'Mon', steps: 4200, calories: 1800 },
  { day: 'Tue', steps: 5100, calories: 2100 },
  { day: 'Wed', steps: 3800, calories: 1750 },
  { day: 'Thu', steps: 6500, calories: 2300 },
  { day: 'Fri', steps: 8100, calories: 2600 },
  { day: 'Sat', steps: 6800, calories: 2400 },
  { day: 'Sun', steps: 3200, calories: 1500 },
];

export default function ActivityGraph() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-card-border rounded-xl shadow-card min-w-[120px]">
          <p className="text-[10px] text-text-muted font-bold uppercase mb-2">{label}</p>
          <div className="space-y-1">
             <p className="text-xs font-bold text-blue-600">Steps: {payload[0].value}</p>
             <p className="text-xs font-bold text-orange-500">kcal: {payload[1].value}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 shadow-card border border-card-border h-full flex flex-col hover:border-blue-200 transition-colors">
      <header className="flex items-center justify-between mb-6">
        <h3 className="font-sora text-sm font-bold text-blue-900 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          Weekly Activity
        </h3>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-md border border-green-100 shadow-sm">
          +12% vs last week
        </span>
      </header>

      <div className="flex-1 min-h-[160px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
            <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
