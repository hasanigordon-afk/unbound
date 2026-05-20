import React from 'react';
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react';

export default function SEEReviewSection({ title, items, onEdit, onDelete, onConfirm }) {
  return (
    <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <h3 className="mb-4 font-sans text-xl font-black">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-white/8 p-3 text-sm text-slate-300">No items extracted.</p>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sans font-black text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.detail || item.schedule_text || item.frequency || item.target || item.due_text || 'Ready for review'}</p>
                {item.needs_review && <span className="mt-2 inline-flex rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">Needs Review</span>}
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.confirmed ? 'bg-emerald-400/15 text-emerald-100' : 'bg-white/10 text-slate-300'}`}>{item.confirmed ? 'Confirmed' : 'Draft'}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => onEdit(item.id)} className="rounded-2xl bg-white/8 px-3 py-2 text-xs font-black text-slate-200 active:scale-95 transition"><Pencil className="mx-auto mb-1 h-4 w-4" />Edit</button>
              <button onClick={() => onDelete(item.id)} className="rounded-2xl bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-100 active:scale-95 transition"><Trash2 className="mx-auto mb-1 h-4 w-4" />Delete</button>
              <button onClick={() => onConfirm(item.id)} className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-xs font-black text-emerald-100 active:scale-95 transition"><CheckCircle2 className="mx-auto mb-1 h-4 w-4" />Confirm</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}