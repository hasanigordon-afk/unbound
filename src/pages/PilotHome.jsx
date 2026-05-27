import React, { useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';
import CounselorHomeView from '@/components/pilot/home/CounselorHomeView';
import HomeViewToggle from '@/components/pilot/home/HomeViewToggle';

export default function PilotHome() {
  const [activeView, setActiveView] = useState('client');

  return (
    <PilotShell
      title="ReZilient"
      subtitle="Built For Life's Biggest Comebacks"
    >
      <HomeViewToggle activeView={activeView} onChange={setActiveView} />
      {activeView === 'counselor' ? <CounselorHomeView /> : <ClientHomeView />}
    </PilotShell>
  );
}