import React from 'react';
import {
  MissionCarouselSection,
  PillarsCarouselSection,
  ResourceCarouselSection,
  RoadmapCarouselSection,
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
    </div>
  );
}