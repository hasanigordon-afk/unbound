import React from 'react';

export default function HomeViewToggle({ activeView, onChange }) {
  const views = [
    { id: 'client', label: 'Client View' },
    { id: 'counselor', label: 'Counselor / Rehab View' },
  ];

  return (
    <div className="sticky top-[88px] z-20 mb-5 rounded-[28px] border border-white/12 bg-white/10 p-1.5 backdrop-blur-2xl shadow-2xl">
      <div className="grid grid-cols-2 gap-1">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`min-h-[54px] rounded-[22px] text-sm font-black transition active:scale-95 ${
              activeView === view.id
                ? 'bg-white text-slate-950 shadow-xl'
                : 'bg-transparent text-slate-300 hover:bg-white/8'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}