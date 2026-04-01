'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import DashboardMain from '@/components/dashboard/DashboardMain';
import CheckinMain from '@/components/checkin/CheckinMain';
import MedicineMain from '@/components/medicine/MedicineMain';
import ProfileMain from '@/components/profile/ProfileMain';
import { useSection } from '@/hooks/useSection';
import dynamic from 'next/dynamic';

// Dynamic import for BodyMapPanel as it might contain heavy 3D components
const BodyMapPanel = dynamic(() => import('@/components/bodymap/BodyMapPanel'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">Loading Body Map...</div>
});

export default function Home() {
  const { activeSection, setActiveSection, bodyMapOpen, setBodyMapOpen } = useSection();

  return (
    <AppShell 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
      setBodyMapOpen={setBodyMapOpen}
    >
      <AnimatePresence mode="wait">
        {activeSection === 'dashboard' && <DashboardMain key="dashboard" onBodyMapOpen={() => setBodyMapOpen(true)} />}
        {activeSection === 'checkin'   && <CheckinMain   key="checkin"   />}
        {activeSection === 'medicine'  && <MedicineMain  key="medicine"  />}
        {activeSection === 'profile'   && <ProfileMain   key="profile"   />}
      </AnimatePresence>

      <AnimatePresence>
        {bodyMapOpen && (
          <BodyMapPanel onClose={() => setBodyMapOpen(false)} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
