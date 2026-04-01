'use client'

import React from 'react';
import { motion } from 'framer-motion';
import WeeklySummaryCard from './WeeklySummaryCard';
import AIChatBot from './AIChatBot';
import CheckinHistory from './CheckinHistory';

export default function CheckinMain() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full flex flex-col pb-12"
    >
      <WeeklySummaryCard />
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-[60%] flex flex-col">
          <AIChatBot />
        </div>
        <div className="w-full lg:w-[40%] flex flex-col">
          <CheckinHistory />
        </div>
      </div>
    </motion.div>
  );
}
