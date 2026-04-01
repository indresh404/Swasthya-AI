'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { checkinHistory } from '@/data/mockCheckins';

export default function CheckinHistory() {
  const [expandedDate, setExpandedDate] = useState<string | null>(checkinHistory[0].date);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'flagged': return { bg: 'bg-risk-red/10', text: 'text-risk-red', icon: <AlertCircle size={14} /> };
      case 'watch': return { bg: 'bg-risk-yellow/10', text: 'text-risk-yellow', icon: <Clock size={14} /> };
      default: return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle size={14} /> };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-card-border h-[600px] flex flex-col overflow-hidden">
      <header className="p-6 border-b border-card-border">
        <h3 className="font-sora text-base font-bold text-blue-900 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Past 7 Days
        </h3>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3">
        {checkinHistory.map((item) => {
          const isExpanded = expandedDate === item.date;
          const styles = getSeverityStyles(item.severity);
          
          return (
            <div 
              key={item.date}
              className={`rounded-xl border transition-all duration-300 ${
                isExpanded ? 'border-blue-200 bg-blue-50/30' : 'border-card-border bg-white hover:border-blue-100'
              }`}
            >
              <button
                onClick={() => setExpandedDate(isExpanded ? null : item.date)}
                className="w-full text-left p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{item.date}</span>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                      {styles.icon}
                      {item.severity}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary truncate font-medium">
                    {item.summary}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-text-muted"
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      <div className="h-[1px] bg-blue-100/50 w-full" />
                      {item.questions.map((q, i) => (
                        <div key={i} className="space-y-2">
                          <p className="text-[11px] font-bold text-blue-700 leading-relaxed">Q: {q.q}</p>
                          <p className="text-xs text-text-primary leading-relaxed bg-white/50 p-3 rounded-lg border border-blue-50/50">
                            {q.a || <span className="italic text-text-muted">Awaiting your response...</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
