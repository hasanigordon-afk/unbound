import React, { useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import HomeViewToggle from '@/components/pilot/home/HomeViewToggle';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';
import CounselorHomeView from '@/components/pilot/home/CounselorHomeView';

export default function PilotHome() {
  const [activeView, setActiveView] = useState('client');

  return (
    <PilotShell
      title="ReZilient Dashboard"
      subtitle="One recovery support app with focused dashboards for clients and counselors."
    >
      <HomeViewToggle activeView={activeView} onChange={setActiveView} />
      {activeView === 'client' ? <ClientHomeView /> : <CounselorHomeView />}
    </PilotShell>
  );
}