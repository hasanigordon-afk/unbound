import React from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ProfileHubSections from '@/components/profile/ProfileHubSections';

export default function Profile() {
  return (
    <PilotShell title="Profile" subtitle="Your personal recovery hub.">
      <ProfileHubSections />
    </PilotShell>
  );
}