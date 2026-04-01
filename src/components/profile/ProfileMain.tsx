'use client'

import React from 'react';
import { motion } from 'framer-motion';
import ProfileCard from './ProfileCard';
import FamilyQRCard from './FamilyQRCard';
import FamilyMembersGrid from './FamilyMembersGrid';
import MedicalTimeline from './MedicalTimeline';

export default function ProfileMain() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-sora text-xl font-bold text-blue-900">Your Identity</h2>
          <p className="text-sm text-text-secondary font-medium mt-1">Manage personal data, family connections, and medical history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <ProfileCard />
         </div>
         <div className="lg:col-span-1 min-h-[220px]">
            <FamilyQRCard />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 min-h-[500px]">
            <MedicalTimeline />
         </div>
         <div className="lg:col-span-1 min-h-[500px]">
            <FamilyMembersGrid />
         </div>
      </div>

    </motion.div>
  );
}
