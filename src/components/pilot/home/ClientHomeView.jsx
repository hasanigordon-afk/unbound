import React from 'react';
import RoadmapCommandCenter from './RoadmapCommandCenter';
import MissionBoard from './MissionBoard';
import CorePillarsGrid from './CorePillarsGrid';
import WinsSupportAIResources from './WinsSupportAIResources';

export default function ClientHomeView() {
  return (
    <div className="space-y-5">
      <RoadmapCommandCenter />
      <MissionBoard />
      <CorePillarsGrid />
      <WinsSupportAIResources />
    </div>
  );
}