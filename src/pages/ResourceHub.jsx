import React from 'react';
import { Briefcase, Car, HeartPulse, Home, MapPinned, Shield, Users, Utensils } from 'lucide-react';
import WorkingSectionHub from '@/components/pilot/WorkingSectionHub';

export default function ResourceHub() {
  return <WorkingSectionHub title="Resource Hub" subtitle="Local assistance and practical support in one place." primaryAction={{ title: 'Nearby Resources', description: 'Food, transportation, housing, shelters, staffing agencies, veteran support, community help, and recovery resources.' }} sections={[
    { title: 'Food resources', icon: Utensils, description: 'Food pantries and meal support.', items: ['Nearby', 'Open now', 'Saved'] },
    { title: 'Transportation', icon: Car, description: 'Rides, bus routes, and appointment transportation.', items: ['Routes', 'Rides', 'Planning'] },
    { title: 'Housing', icon: Home, description: 'Housing resources and stability supports.', items: ['Sober living', 'Applications', 'Support'] },
    { title: 'Shelters', icon: Shield, description: 'Emergency shelter and short-term safety options.', items: ['Emergency', 'Nearby', 'Contact'] },
    { title: 'Staffing agencies', icon: Briefcase, description: 'Job placement and work-readiness support.', items: ['Jobs', 'Interviews', 'Resume'] },
    { title: 'Veteran support', icon: Users, description: 'Veteran-specific help and benefits resources.', items: ['VA', 'Peer support', 'Benefits'] },
    { title: 'Community help', icon: MapPinned, description: 'Local organizations and practical support.', items: ['Local', 'Trusted', 'Useful'] },
    { title: 'Recovery resources', icon: HeartPulse, description: 'Recovery meetings and support services.', items: ['Meetings', 'Groups', 'Care'] },
  ]} />;
}