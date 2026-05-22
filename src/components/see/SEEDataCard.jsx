import React from 'react';

export default function SEEDataCard({ title, icon: Icon, children, tone = 'blue' }) {
  const toneClass = tone === 'rose' ? 'bg-rose-300/15 text-rose-100 border-rose-200/20' : tone === 'emerald' ? 'bg-emerald-300/15 text-emerald-100 border-emerald-200/20' : tone === 'amber' ? 'bg-amber-300/15 text-amber-100 border-amber-200/20' : 'bg-blue-300/15 text-blue-100 border-blue-200/20';
  return (
    <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        {Icon && <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}><Icon className="h-5 w-5" /></div>}
        <h3 className="font-sans text-xl font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}