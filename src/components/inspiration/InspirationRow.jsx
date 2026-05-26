import React from 'react';
import InspirationCard from './InspirationCard';

export default function InspirationRow({ title, items, type, emptyText, onOpen, onSave, onShare, onReport }) {
  return (
    <section className="space-y-3">
      <h2 className="font-sans text-2xl font-black text-white">{title}</h2>
      {items?.length ? (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {items.map((item) => <InspirationCard key={item.id} item={item} type={type} onOpen={onOpen} onSave={onSave} onShare={onShare} onReport={onReport} />)}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 text-sm font-bold text-slate-300">{emptyText}</div>
      )}
    </section>
  );
}