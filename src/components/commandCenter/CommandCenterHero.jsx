import React from "react";
import { ArrowRight, CheckCircle2, Flame, Map, Target } from "lucide-react";

export default function CommandCenterHero({ onStart }) {
  const cards = [
    { label: "Today", value: "4 moves", icon: CheckCircle2 },
    { label: "Streak", value: "Build", icon: Flame },
    { label: "Roadmap", value: "90 days", icon: Map },
    { label: "Mission", value: "Top 5", icon: Target },
  ];

  return (
    <section className="card-glow relative overflow-hidden p-6 md:p-10 min-h-[560px] flex items-center">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(91,141,239,.28),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(167,139,250,.2),transparent_30%),radial-gradient(circle_at_55%_90%,rgba(240,183,83,.12),transparent_34%)]" />
      <div className="relative z-10 grid lg:grid-cols-[1fr_.9fr] gap-10 items-center w-full">
        <div>
          <div className="pill pill-teal mb-5">ReZilient Command Center</div>
          <h1 className="text-5xl md:text-7xl font-serif font-semibold leading-[.95] text-[var(--text)]">Your comeback deserves a strategy.</h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] mt-6 max-w-2xl">You survived the hard part. Now let's build the future.</p>
          <button onClick={onStart} className="btn-primary mt-8 inline-flex items-center gap-3">Build My Roadmap <ArrowRight className="w-5 h-5" /></button>
        </div>

        <div className="relative h-[420px]">
          <div className="absolute inset-8 rounded-full border border-white/10 animate-pulse" />
          <div className="absolute inset-16 rounded-full border border-[var(--border-glow)]" />
          {cards.map(({ label, value, icon: Icon }, index) => (
            <div key={label} className="absolute card-soft p-4 w-40 mission-card-float" style={{
              left: index % 2 === 0 ? 8 : "auto",
              right: index % 2 === 1 ? 8 : "auto",
              top: [18, 82, 235, 285][index],
              animationDelay: `${index * .18}s`,
            }}>
              <Icon className="w-5 h-5 text-[var(--accent)]" />
              <p className="text-xs uppercase tracking-[.14em] text-[var(--text-dim)] mt-3 font-black">{label}</p>
              <strong className="text-xl text-[var(--text)]">{value}</strong>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-[rgba(91,141,239,.18)] flex items-center justify-center shadow-[0_0_60px_rgba(91,141,239,.28)]">
            <div className="w-28 h-28 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--purple))] flex items-center justify-center text-white font-black text-3xl shadow-[var(--glow)]">AI</div>
          </div>
        </div>
      </div>
      <style>{`.mission-card-float{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both, float 5s ease-in-out infinite;}`}</style>
    </section>
  );
}