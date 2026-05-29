import React from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ProfileRecoveryDashboard from '@/components/profile/ProfileRecoveryDashboard';
import ProfileHubSections from '@/components/profile/ProfileHubSections';

export default function Profile() {
  return (
    <PilotShell title="Profile" subtitle="Your personal recovery hub.">
      <ProfileRecoveryDashboard />
      <ProfileHubSections />
    </PilotShell>
  );
}