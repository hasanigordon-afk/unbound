import React from "react";
import { Brain, HeartPulse, Home, Users } from "lucide-react";

const sections = [
  { key: "mission", title: "Mission + Purpose", icon: Brain, fields: ["life_to_create", "motivation", "refuse_to_lose", "one_year", "five_year"] },
  { key: "current", title: "Current Situation", icon: Home, fields: ["recovery_stage", "housing_status", "employment_status", "transportation", "education", "family_support", "legal_obligations", "stress_level", "biggest_obstacle"] },
  { key: "wellness", title: "Health + Wellness", icon: HeartPulse, fields: ["sleep_quality", "exercise_habits", "anxiety_level", "depression_level", "daily_energy", "nutrition_habits"] },
  { key: "support", title: "Support Systems", icon: Users, fields: ["sponsor", "mentor", "counselor", "family", "friends", "veterans_support", "faith_community"] },
];

const labels = {
  life_to_create: "What kind of life are you trying to create?", motivation: "What motivates you most?", refuse_to_lose: "What do you refuse to lose?", one_year: "Where do you want to be in 1 year?", five_year: "Where do you want to be in 5 years?",
  recovery_stage: "Recovery stage", housing_status: "Housing status", employment_status: "Employment status", transportation: "Transportation access", education: "Education level", family_support: "Family support", legal_obligations: "Legal / probation / parole requirements", stress_level: "Current stress level", biggest_obstacle: "Biggest obstacle today",
  sleep_quality: "Sleep quality", exercise_habits: "Exercise habits", anxiety_level: "Anxiety level", depression_level: "Depression level", daily_energy: "Daily energy", nutrition_habits: "Nutrition habits",
  sponsor: "Sponsor", mentor: "Mentor", counselor: "Counselor", family: "Family", friends: "Friends", veterans_support: "Veterans support", faith_community: "Faith / community support",
};

export default function DiscoveryEngineForm({ form, setForm, onGenerate, loading, hasPlan }) {
  const update = (key, value) => setForm({ ...form, [key]: value });
  const updateGoal = (index, value) => {
    const top_goals = [...form.top_goals];
    top_goals[index] = value;
    setForm({ ...form, top_goals });
  };

  return (
    <section id="discovery-engine" className="card p-5 md:p-7 space-y-7">
      <div>
        <p className="section-label">Phase 1 · AI Discovery Engine</p>
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[var(--text)]">Let the system understand your mission.</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">Answer what you can. The roadmap becomes more useful as your life changes.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-black text-[var(--text)]">Top 5 Non-Negotiable Goals</label>
        <div className="grid md:grid-cols-5 gap-3">{form.top_goals.map((goal, index) => <input key={index} value={goal} onChange={(e) => updateGoal(index, e.target.value)} placeholder={`Goal ${index + 1}`} />)}</div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        {sections.map(({ title, icon: Icon, fields }) => (
          <div key={title} className="card-soft p-5 space-y-4">
            <h3 className="flex items-center gap-2 text-xl font-serif font-semibold text-[var(--text)]"><Icon className="w-5 h-5 text-[var(--accent)]" />{title}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {fields.map(field => <textarea key={field} value={form[field] || ""} onChange={(e) => update(field, e.target.value)} placeholder={labels[field]} className="min-h-20" />)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input value={form.city_state} onChange={(e) => update("city_state", e.target.value)} placeholder="Current city/state" />
        <input value={form.current_strengths} onChange={(e) => update("current_strengths", e.target.value)} placeholder="Current strengths / wins" />
      </div>
      <button onClick={onGenerate} disabled={loading} className="btn-primary w-full md:w-auto">{loading ? "Activating your AI team..." : hasPlan ? "Update My Roadmap" : "Generate My Life Blueprint"}</button>
    </section>
  );
}