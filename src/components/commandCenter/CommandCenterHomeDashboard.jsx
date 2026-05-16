import React from "react";
import { Calendar, HeartPulse, Lightbulb, MessageCircle, Siren, Trophy } from "lucide-react";

export default function CommandCenterHomeDashboard({ suggestions = [], nextMilestone }) {
  const tiles = [
    ["Weekly Wins", "Log one win today", Trophy],
    ["Mood Tracker", "Check in with yourself", HeartPulse],
    ["Next Milestone", nextMilestone || "Complete today's focus", Lightbulb],
    ["Upcoming Meetings", "Review support options", Calendar],
    ["Community Activity", "Connect with one safe person", MessageCircle],
    ["Emergency Calm", "Reset available anytime", Siren],
  ];

  return (
    <section className="card p-6">
      <p className="section-label">Home Dashboard</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tiles.map(([title, body, Icon]) => <div key={title} className="card-soft p-5"><Icon className="w-5 h-5 text-[var(--accent)]" /><h3 className="font-serif text-xl text-[var(--text)] mt-3">{title}</h3><p className="text-sm text-[var(--text-muted)] mt-2">{body}</p></div>)}
      </div>
      {!!suggestions.length && <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5"><h3 className="text-xl font-serif text-[var(--text)]">AI Suggestions</h3><ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">{suggestions.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>}
    </section>
  );
}