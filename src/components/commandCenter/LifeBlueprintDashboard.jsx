import React from "react";
import { CalendarDays, CheckCircle2, CircleDot, Quote, Trophy } from "lucide-react";

const timeline = [["today", "Today"], ["week", "This Week"], ["day30", "30 Days"], ["day60", "60 Days"], ["day90", "90 Days"], ["year1", "1 Year"], ["year5", "5 Years"]];

export default function LifeBlueprintDashboard({ blueprint, goals = [], completedCount = 0, streak = 0 }) {
  if (!blueprint) return null;
  const pct = Math.min(100, completedCount * 8);

  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-[1fr_.8fr] gap-4">
        <div className="card-glow p-6">
          <p className="section-label">Life Blueprint</p>
          <h2 className="text-3xl font-serif font-semibold text-[var(--text)]">Your evolving comeback roadmap.</h2>
          <div className="mt-6 space-y-4">
            {timeline.map(([key, label], index) => (
              <div key={key} className="grid md:grid-cols-[120px_1fr] gap-3 items-start">
                <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]"><CircleDot className="w-4 h-4 text-[var(--gold)]" />{label}</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--text-muted)]">{blueprint[key]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="card-soft p-6 text-center">
            <div className="mx-auto w-36 h-36 rounded-full border-[12px] flex items-center justify-center" style={{ borderColor: "rgba(91,141,239,.18)", boxShadow: "var(--glow)" }}>
              <strong className="text-4xl text-[var(--text)]">{pct}%</strong>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-4 font-bold">Progress Ring</p>
          </div>
          <div className="card-soft p-6">
            <div className="flex items-center gap-2 text-[var(--gold)] font-black"><Trophy className="w-5 h-5" />Current Streak</div>
            <strong className="text-5xl font-serif text-[var(--text)] mt-3 block">{streak}</strong>
          </div>
          <div className="card-soft p-6">
            <div className="flex items-center gap-2 text-[var(--accent)] font-black"><Quote className="w-5 h-5" />Daily Quote</div>
            <p className="text-[var(--text-muted)] mt-3 italic">“Small wins become proof. Proof becomes momentum.”</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <p className="section-label">My Top 5 Goals Whiteboard</p>
        <div className="grid md:grid-cols-5 gap-3">
          {goals.map((goal, index) => <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 min-h-28"><CheckCircle2 className="w-5 h-5 text-[var(--green)] mb-3" /><p className="text-sm font-bold text-[var(--text-muted)]">{goal || `Goal ${index + 1}`}</p></div>)}
        </div>
      </section>
    </div>
  );
}