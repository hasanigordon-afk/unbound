import React from 'react';
import {
  AICompanionCarouselSection,
  CommunityCarouselSection,
  MissionCarouselSection,
  PillarsCarouselSection,
  ResourceCarouselSection,
  RoadmapCarouselSection,
  WellnessCarouselSection,
  WinsCarouselSection,
} from './CarouselHomeSections';

export default function ClientHomeView() {
  return (
    <div className="space-y-8 overflow-hidden">
      <RoadmapCarouselSection />
      <MissionCarouselSection />
      <PillarsCarouselSection />
      <WinsCarouselSection />
      <ResourceCarouselSection />
      <CommunityCarouselSection />
      <WellnessCarouselSection />
      <AICompanionCarouselSection />
    </div>
  );
}