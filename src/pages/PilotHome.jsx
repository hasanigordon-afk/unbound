import React, { useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import HomeViewToggle from '@/components/pilot/home/HomeViewToggle';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';
import CounselorHomeView from '@/components/pilot/home/CounselorHomeView';

export default function PilotHome() {
  const [activeView, setActiveView] = useState('client');
  const activeRoleLabel = {
    client: 'Personal comeback dashboard.',
    counselor: 'Aftercare planning command center.',
    sponsor: 'Support and accountability view.',
    po: 'Compliance and progress overview.',
    mentor: 'Growth coaching dashboard.',
    veteran: 'Veteran comeback dashboard.',
  }[activeView] || 'Personal comeback dashboard.';

  return (
    <PilotShell
      title="ReZilient"
      subtitle={activeRoleLabel}
      activeView={activeView}
    >
      <HomeViewToggle activeView={activeView} onChange={setActiveView} />
      {activeView === 'counselor' ? <CounselorHomeView /> : <ClientHomeView activeRole={activeView} />}
    </PilotShell>
  );
}