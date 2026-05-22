import React from 'react';
import {
  AICompanionCarouselSection,
  MissionCarouselSection,
  PillarsCarouselSection,
  ResourceCarouselSection,
  RoadmapCarouselSection,
  SupportCarouselSection,
  WinsCarouselSection,
} from './CarouselHomeSections';

export default function ClientHomeView() {
  return (
    <div className="space-y-8 overflow-hidden">
      <RoadmapCarouselSection />
      <MissionCarouselSection />
      <PillarsCarouselSection />
      <WinsCarouselSection />
      <SupportCarouselSection />
      <AICompanionCarouselSection />
      <ResourceCarouselSection />
    </div>
  );
}