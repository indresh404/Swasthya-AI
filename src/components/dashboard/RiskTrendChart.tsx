'use client'

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from 'recharts';
import { vitals30Days } from '@/data/mockVitals';

export default function RiskTrendChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const level = payload[0].value > 70 ? 'High' : payload[0].value > 40 ? 'Moderate' : 'Low';
      return (
        <div className="bg-white p-3 border border-card-border rounded-xl shadow-card">
          <p className="text-[10px] text-text-muted font-bold uppercase mb-1">{label}</p>
          <p className="font-mono text-sm font-bold text-blue-900">Risk: {payload[0].value}</p>
          <p className="text-[10px] font-semibold text-blue-500 mt-1">Level: {level}</p>
        </div>
      );
    }
    return null;
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.label === 'Symptom spike') {
      return (
        <g>
          <Dot cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
            Symptom spike
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-card-border h-full flex flex-col">
      <header className="mb-6">
        <h3 className="font-sora text-sm font-semibold text-text-secondary">30-Day Risk Trend</h3>
        <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">Health Variance Monitor</p>
      </header>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={vitals30Days}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              hide 
            />
            <YAxis 
              hide 
              domain={[0, 100]} 
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#f97316" strokeDasharray="3 3" label={{ position: 'right', value: 'High', fill: '#f97316', fontSize: 10 }} />
            <ReferenceLine y={40} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Low', fill: '#10b981', fontSize: 10 }} />
            <Area 
              type="monotone" 
              dataKey="riskScore" 
              stroke="#2563eb" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRisk)" 
              dot={<CustomizedDot />}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
