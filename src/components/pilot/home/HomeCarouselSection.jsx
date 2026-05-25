import React from 'react';
import HomeSummaryCard from './HomeSummaryCard';

export default function HomeCarouselSection({ eyebrow, title, items }) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">{eyebrow}</p>
        <h3 className="mt-1 font-sans text-2xl font-black text-white">{title}</h3>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar">
        <div className="flex snap-x snap-mandatory gap-4">
          {items.map((item) => (
            <div key={item.title} className="min-w-[84%] snap-start sm:min-w-[420px] lg:min-w-[360px]">
              <HomeSummaryCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}