import React from 'react';
import RoadmapCommandCenter from './RoadmapCommandCenter';
import MissionBoard from './MissionBoard';
import CorePillarsGrid from './CorePillarsGrid';
import WinsSupportAIResources from './WinsSupportAIResources';
import AIAftercareEngine from './AIAftercareEngine';
import PositiveCommunityHub from './PositiveCommunityHub';

export default function ClientHomeView() {
  return (
    <div className="space-y-5">
      <RoadmapCommandCenter />
      <MissionBoard />
      <CorePillarsGrid />
      <WinsSupportAIResources />
      <AIAftercareEngine />
      <PositiveCommunityHub />
    </div>
  );
}