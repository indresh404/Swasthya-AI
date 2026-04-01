'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface BodySystemCardsProps {
  indices: Record<string, { score: number; label: string; icon: string; status: string }>;
}

const getScoreColor = (score: number) => {
  if (score > 80) return 'text-green-600';
  if (score > 60) return 'text-blue-600';
  return 'text-risk-orange';
};

const getBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'good':
      return 'bg-green-100/50 text-green-700 ring-1 ring-green-600/20';
    case 'monitor':
      return 'bg-blue-100/50 text-blue-700 ring-1 ring-blue-600/20';
    case 'watch':
      return 'bg-orange-100/50 text-orange-700 ring-1 ring-orange-600/20';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getProgressColor = (score: number) => {
  if (score > 80) return 'bg-green-500';
  if (score > 60) return 'bg-blue-500';
  return 'bg-risk-orange';
};

export default function BodySystemCards({ indices }: BodySystemCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {Object.entries(indices).map(([key, data], index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, boxShadow: 'var(--shadow-elevated)' }}
          className="bg-white rounded-2xl p-5 shadow-card border border-card-border flex flex-col justify-between group transition-shadow duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl drop-shadow-sm">{data.icon}</span>
              <span className="font-sora text-sm font-semibold text-text-secondary">{data.label}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles(data.status)}`}>
              {data.status}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className={`font-mono text-3xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}
            </span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Score</span>
          </div>

          <div className="mt-4 w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
              className={`h-full rounded-full ${getProgressColor(data.score)} shadow-[0_0_8px_rgba(37,99,235,0.2)]`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
