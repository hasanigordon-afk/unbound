import React from 'react';

export default function HomeViewToggle({ activeView, onChange }) {
  const views = [
    { id: 'client', label: 'Client' },
    { id: 'counselor', label: 'Counselor' },
    { id: 'sponsor', label: 'Sponsor' },
    { id: 'po', label: 'PO' },
    { id: 'mentor', label: 'Mentor' },
    { id: 'veteran', label: 'Veteran' },
  ];

  return (
    <div className="sticky top-[88px] z-20 mb-5 rounded-[28px] border border-white/12 bg-[#07101f]/70 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,.42)] backdrop-blur-2xl">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`min-h-[52px] min-w-[92px] rounded-[22px] px-4 text-sm font-black transition active:scale-95 ${
              activeView === view.id
                ? 'bg-gradient-to-br from-white via-amber-50 to-amber-200 text-slate-950 shadow-[0_0_34px_rgba(240,183,83,.24)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}