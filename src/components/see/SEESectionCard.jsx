import React, { useState } from 'react';
import { CheckCircle2, Plus, RefreshCw, Save } from 'lucide-react';
import SEEStatusBadge from './SEEStatusBadge';

export default function SEESectionCard({ title, value, approved, onChange, onApprove, onRegenerate }) {
  const [editing, setEditing] = useState(false);
  const text = typeof value === 'string' ? value : JSON.stringify(value || [], null, 2);

  return (
    <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-xl font-black">{title}</h3>
          <div className="mt-2"><SEEStatusBadge>{approved ? 'Approved' : 'Needs Review'}</SEEStatusBadge></div>
        </div>
        <button onClick={onApprove} className="rounded-2xl bg-emerald-300/15 p-3 text-emerald-100 active:scale-95"><CheckCircle2 className="h-5 w-5" /></button>
      </div>

      {editing ? (
        <textarea className="min-h-[180px] w-full rounded-[24px] p-4 font-mono text-xs" value={text} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-[24px] bg-white/8 p-4 text-xs leading-relaxed text-slate-200">{text}</pre>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button onClick={() => setEditing(!editing)} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black text-white">{editing ? <Save className="mx-auto mb-1 h-4 w-4" /> : null}{editing ? 'Save' : 'Edit'}</button>
        <button onClick={onRegenerate} className="rounded-2xl bg-blue-300/15 px-3 py-3 text-xs font-black text-blue-100"><RefreshCw className="mx-auto mb-1 h-4 w-4" />Regenerate</button>
        <button onClick={() => onChange(`${text}\n\n- New item`)} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black text-white"><Plus className="mx-auto mb-1 h-4 w-4" />Add Item</button>
        <button onClick={onApprove} className="rounded-2xl bg-emerald-300/15 px-3 py-3 text-xs font-black text-emerald-100"><CheckCircle2 className="mx-auto mb-1 h-4 w-4" />Approve</button>
      </div>
    </section>
  );
}