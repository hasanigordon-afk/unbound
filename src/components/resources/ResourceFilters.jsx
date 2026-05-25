import React from 'react';
import { categories, filters } from './resourceUtils';

export default function ResourceFilters({ category, setCategory, activeFilters, toggleFilter }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', ...categories].map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${category === item ? 'bg-white text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}>{item}</button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((item) => (
          <button key={item} onClick={() => toggleFilter(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${activeFilters.includes(item) ? 'bg-blue-300 text-slate-950' : 'border border-white/12 bg-white/10 text-slate-200'}`}>{item}</button>
        ))}
      </div>
    </div>
  );
}