import React, { useEffect, useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';
import CounselorHomeView from '@/components/pilot/home/CounselorHomeView';
import HomeViewToggle from '@/components/pilot/home/HomeViewToggle';
import { useAuth } from '@/lib/AuthContext';
import { isStaff } from '@/lib/roles';

export default function PilotHome() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('client');
  const canViewCounselorHome = isStaff(user);

  useEffect(() => {
    if (!canViewCounselorHome && activeView === 'counselor') {
      setActiveView('client');
    }
  }, [activeView, canViewCounselorHome]);

  return (
    <PilotShell
      title="ReZilient"
      subtitle="Built For Life's Biggest Comebacks"
    >
      {canViewCounselorHome && <HomeViewToggle activeView={activeView} onChange={setActiveView} />}
      {canViewCounselorHome && activeView === 'counselor' ? <CounselorHomeView /> : <ClientHomeView />}
    </PilotShell>
  );
}
