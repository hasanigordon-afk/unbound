import React from 'react';

const styles = {
  Draft: 'bg-slate-300/15 text-slate-100 border-white/10',
  'Needs Review': 'bg-amber-300/15 text-amber-100 border-amber-200/20',
  Approved: 'bg-blue-300/15 text-blue-100 border-blue-200/20',
  Executed: 'bg-emerald-300/15 text-emerald-100 border-emerald-200/20',
  'Missing Info': 'bg-orange-300/15 text-orange-100 border-orange-200/20',
  'High Risk': 'bg-rose-300/15 text-rose-100 border-rose-200/20',
  Completed: 'bg-emerald-300/15 text-emerald-100 border-emerald-200/20',
};

export default function SEEStatusBadge({ children }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${styles[children] || styles.Draft}`}>{children}</span>;
}