'use client'

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { vitals30Days } from '@/data/mockVitals';

const last7Days = vitals30Days.slice(-7);

const TABS = [
  { id: 'heartRate', label: 'Heart Rate', color: '#2563eb', fill: '#dbeafe' },
  { id: 'spo2', label: 'SpO2', color: '#10b981', fill: '#d1fae5' },
  { id: 'sleep', label: 'Sleep', color: '#8b5cf6', fill: '#ede9fe' },
];

export default function VitalsGraph() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-card-border h-full flex flex-col hover:border-blue-200 transition-colors">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="font-sora text-sm font-semibold text-text-secondary">Vitals · Last 7 Days</h3>
        <div className="flex bg-surface p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab.id === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-500/10' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last7Days}>
            <defs>
              <linearGradient id="colorVitals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeTab.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={activeTab.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              dy={10}
            />
            <YAxis 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: 'var(--shadow-card)',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'JetBrains Mono'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={activeTab.id} 
              stroke={activeTab.color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVitals)" 
              dot={{ r: 4, fill: activeTab.color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
