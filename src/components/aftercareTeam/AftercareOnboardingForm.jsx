import React from "react";
import { Target, MapPin } from "lucide-react";

const focusOptions = ["Recovery", "Reentry", "Employment", "Housing", "Family", "Health", "Education", "Legal obligations", "All of the above"];

export default function AftercareOnboardingForm({ form, setForm, onGenerate, loading, hasPlan }) {
  const updateGoal = (index, value) => {
    const top_goals = [...form.top_goals];
    top_goals[index] = value;
    setForm({ ...form, top_goals });
  };

  const toggleFocus = (area) => {
    const exists = form.focus_areas.includes(area);
    setForm({ ...form, focus_areas: exists ? form.focus_areas.filter(item => item !== area) : [...form.focus_areas, area] });
  };

  return (
    <section className="card p-5 md:p-7 space-y-6">
      <div>
        <p className="section-label">Build your comeback plan</p>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--text)]">Tell your AI Aftercare Team where you are right now.</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">Your answers shape a supportive, non-judgmental plan for recovery, reentry, stability, and growth.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-3">
          <label className="text-sm font-bold text-[var(--text)] flex items-center gap-2"><Target className="w-4 h-4 text-[var(--accent)]" />Top 5 non-negotiable goals</label>
          <div className="grid md:grid-cols-5 gap-3">
            {form.top_goals.map((goal, index) => (
              <input key={index} value={goal} onChange={(e) => updateGoal(index, e.target.value)} placeholder={`Goal ${index + 1}`} />
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-sm font-bold text-[var(--text)]">Focus areas</label>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map(area => (
              <button key={area} type="button" onClick={() => toggleFocus(area)} className={`px-3 py-2 rounded-full text-xs font-bold border transition ${form.focus_areas.includes(area) ? "bg-[var(--navy-dim)] border-[var(--border-glow)] text-[var(--text)]" : "bg-white/5 border-white/10 text-[var(--text-muted)]"}`}>
                {area}
              </button>
            ))}
          </div>
        </div>

        <textarea value={form.biggest_challenge} onChange={(e) => setForm({ ...form, biggest_challenge: e.target.value })} placeholder="What is your current biggest challenge?" className="min-h-28" />
        <textarea value={form.support_this_week} onChange={(e) => setForm({ ...form, support_this_week: e.target.value })} placeholder="What support do you need this week?" className="min-h-28" />
        <textarea value={form.support_30_days} onChange={(e) => setForm({ ...form, support_30_days: e.target.value })} placeholder="What support do you need over the next 30 days?" className="min-h-24" />
        <textarea value={form.support_60_days} onChange={(e) => setForm({ ...form, support_60_days: e.target.value })} placeholder="What support do you need over the next 60 days?" className="min-h-24" />
        <textarea value={form.support_90_days} onChange={(e) => setForm({ ...form, support_90_days: e.target.value })} placeholder="What support do you need over the next 90 days?" className="min-h-24" />
        <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Probation, parole, court, treatment, or program requirements?" className="min-h-24" />
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-[var(--text)] flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--gold)]" />Current city/state</label>
          <input value={form.city_state} onChange={(e) => setForm({ ...form, city_state: e.target.value })} placeholder="Example: Newark, NJ" />
        </div>
      </div>

      <button onClick={onGenerate} disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Building your support team plan..." : hasPlan ? "Update My Plan" : "Generate My Plan"}
      </button>
    </section>
  );
}