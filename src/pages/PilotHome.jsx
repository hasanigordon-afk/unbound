import React, { useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import HomeViewToggle from '@/components/pilot/home/HomeViewToggle';
import ReZilientWelcomeIntro from '@/components/pilot/home/ReZilientWelcomeIntro';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';
import CounselorHomeView from '@/components/pilot/home/CounselorHomeView';

export default function PilotHome() {
  const [activeView, setActiveView] = useState('client');
  const [showIntro, setShowIntro] = useState(true);

  return (
    <PilotShell
      title="ReZilient Dashboard"
      subtitle="One recovery support app with focused dashboards for clients and counselors."
      activeView={activeView}
    >
      {showIntro ? (
        <ReZilientWelcomeIntro onContinue={() => setShowIntro(false)} />
      ) : (
        <>
          <HomeViewToggle activeView={activeView} onChange={setActiveView} />
          {activeView === 'client' ? <ClientHomeView /> : <CounselorHomeView />}
        </>
      )}
    </PilotShell>
  );
}