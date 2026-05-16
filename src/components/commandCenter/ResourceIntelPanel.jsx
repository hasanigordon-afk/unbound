import React, { useState } from "react";
import { Building2, MapPin } from "lucide-react";

export default function ResourceIntelPanel({ resources = [] }) {
  const [view, setView] = useState("cards");
  if (!resources.length) return null;

  return (
    <section className="card p-6 space-y-5">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <p className="section-label">Resource AI</p>
          <h2 className="text-2xl font-serif font-semibold text-[var(--text)]">Local resource intelligence</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("cards")} className="btn-ghost min-h-0 py-2 px-4">Card View</button>
          <button onClick={() => setView("map")} className="btn-ghost min-h-0 py-2 px-4">Map View</button>
        </div>
      </div>
      {view === "map" ? (
        <div className="relative min-h-[340px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_30%_35%,rgba(91,141,239,.22),transparent_24%),radial-gradient(circle_at_70%_70%,rgba(240,183,83,.16),transparent_22%),rgba(255,255,255,.04)] overflow-hidden">
          {resources.slice(0, 8).map((item, index) => <div key={index} className="absolute flex items-center gap-2 text-xs font-black text-[var(--text)]" style={{ left: `${15 + (index * 17) % 68}%`, top: `${18 + (index * 23) % 62}%` }}><MapPin className="w-5 h-5 text-[var(--gold)] drop-shadow" />{item.name}</div>)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {resources.map((item, index) => (
            <div key={index} className="card-soft p-4">
              <Building2 className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-bold text-[var(--text)] mt-3">{item.name}</h3>
              <p className="text-xs uppercase tracking-[.12em] text-[var(--gold)] font-black mt-1">{item.type} · {item.distance || "nearby"}</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">{item.next_step}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}