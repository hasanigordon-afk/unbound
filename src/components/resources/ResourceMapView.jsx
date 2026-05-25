import React from 'react';
import { MapPinned } from 'lucide-react';

export default function ResourceMapView({ resources }) {
  return (
    <section className="rounded-[34px] border border-white/12 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
      <div className="relative h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        {resources.slice(0, 12).map((resource, index) => (
          <div key={resource.id} className="absolute rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-950 shadow-xl" style={{ left: `${12 + (index * 23) % 72}%`, top: `${12 + (index * 17) % 72}%` }}>
            <MapPinned className="mr-1 inline h-4 w-4 text-blue-600" /> {resource.name}
          </div>
        ))}
      </div>
    </section>
  );
}