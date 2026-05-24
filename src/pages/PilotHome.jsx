import React from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ClientHomeView from '@/components/pilot/home/ClientHomeView';

export default function PilotHome() {
  return (
    <PilotShell
      title="ReZilient"
      subtitle="Your companion for recovery, accountability, structure, and rebuilding life."
    >
      <ClientHomeView />
    </PilotShell>
  );
}