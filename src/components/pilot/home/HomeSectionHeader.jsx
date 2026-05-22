import React from 'react';

export default function HomeSectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">{eyebrow}</p>}
      <h2 className="mt-1 font-sans text-2xl font-black tracking-tight text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm font-bold text-slate-300">{subtitle}</p>}
    </div>
  );
}