import React from 'react';
import HomeSummaryCard from './HomeSummaryCard';

export default function HomeCarouselSection({ eyebrow, title, items, moduleKey, moduleStates = {}, activityCounts = {}, onTrack, onTogglePin }) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">{eyebrow}</p>
        <h3 className="mt-1 font-sans text-2xl font-black text-white">{title}</h3>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar">
        <div className="flex snap-x snap-mandatory gap-4">
          {items.map((item) => {
            const key = moduleKey(title, item.title);
            return (
              <div key={item.title} className="min-w-[84%] snap-start sm:min-w-[420px] lg:min-w-[360px]">
                <HomeSummaryCard {...item} sectionTitle={title} moduleState={moduleStates[key]} activityCount={activityCounts[key] || 0} onTrack={onTrack} onTogglePin={onTogglePin} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}