import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PilotCard({ icon: Icon, title, body, to, action = 'Open', tone = 'blue', children }) {
  const tones = {
    blue: 'from-blue-400/18 to-cyan-300/8',
    green: 'from-emerald-400/18 to-teal-300/8',
    gold: 'from-amber-300/18 to-orange-300/8',
    violet: 'from-violet-400/18 to-fuchsia-300/8',
    slate: 'from-white/12 to-white/5',
  };

  const content = (
    <div className={`rounded-[30px] bg-gradient-to-br ${tones[tone] || tones.blue} border border-white/12 p-5 shadow-xl backdrop-blur-2xl active:scale-[0.985] transition h-full`}>
      <div className="flex items-start justify-between gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/12 border border-white/10 flex items-center justify-center shrink-0">
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        {to && <ChevronRight className="w-5 h-5 text-slate-300 mt-3" />}
      </div>
      <h3 className="text-lg font-bold font-sans mt-4 tracking-tight">{title}</h3>
      {body && <p className="text-sm text-slate-300 mt-2 leading-relaxed">{body}</p>}
      {children}
      {to && <p className="text-sm font-bold text-white mt-4">{action}</p>}
    </div>
  );

  return to ? <Link to={to} className="block h-full no-underline">{content}</Link> : content;
}