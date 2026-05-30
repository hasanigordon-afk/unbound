import React from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ProfileRecoveryDashboard from '@/components/profile/ProfileRecoveryDashboard';
import EmergencySupportSection from '@/components/profile/EmergencySupportSection';
import ProfileHubSections from '@/components/profile/ProfileHubSections';

export default function Profile() {
  return (
    <PilotShell title="Profile" subtitle="Your personal recovery hub.">
      <ProfileRecoveryDashboard />
      <EmergencySupportSection />
      <ProfileHubSections />
    </PilotShell>
  );
}