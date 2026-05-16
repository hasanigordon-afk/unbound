import React from "react";
import { HeartPulse, Hammer, Briefcase, Dumbbell, MapPin, ClipboardCheck, Target, Flame } from "lucide-react";
import SpecialistCard from "./SpecialistCard";
import ActionChecklist from "./ActionChecklist";

const specialistConfig = [
  ["recovery", "Recovery AI", HeartPulse, "var(--accent)"],
  ["reentry", "Reentry AI", Hammer, "var(--gold)"],
  ["career", "Career AI", Briefcase, "var(--green)"],
  ["wellness", "Wellness AI", Dumbbell, "var(--purple)"],
  ["resources", "Resource AI", MapPin, "var(--sky)"],
  ["accountability", "Accountability AI", ClipboardCheck, "var(--muted-green)"],
  ["goals", "Goals AI", Target, "var(--amber)"],
];

export default function AftercarePlanDashboard({ plan, completedActions, onToggleAction, streak }) {
  if (!plan) return null;
  const today = plan.today_focus || [];
  const accountability = plan.accountability || {};

  return (
    <div className="space-y-6">
      <section className="card-glow p-5 md:p-7 grid lg:grid-cols-[1.25fr_.75fr] gap-5 items-stretch">
        <div>
          <p className="section-label">Today’s Focus</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--text)]">Your support team picked these next moves.</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {today.map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-[var(--text-muted)]">{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[var(--gold)]"><Flame className="w-6 h-6" /><span className="text-sm font-black uppercase tracking-[.18em]">Completion streak</span></div>
          <strong className="text-5xl font-serif text-[var(--text)] mt-4">{streak}</strong>
          <p className="text-sm text-[var(--text-muted)] mt-2">Keep checking off action steps to build momentum.</p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {specialistConfig.map(([key, title, Icon, accent]) => (
          <SpecialistCard key={key} title={title} icon={Icon} accent={accent} summary={plan[key]?.summary} steps={plan[key]?.steps} />
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <ActionChecklist title="Daily Action Steps" actions={accountability.daily} completed={completedActions} onToggle={onToggleAction} />
        <ActionChecklist title="Weekly Action Steps" actions={accountability.weekly} completed={completedActions} onToggle={onToggleAction} />
        <ActionChecklist title="30-Day Action Steps" actions={accountability.thirty_day} completed={completedActions} onToggle={onToggleAction} />
        <ActionChecklist title="60-Day Action Steps" actions={accountability.sixty_day} completed={completedActions} onToggle={onToggleAction} />
        <div className="lg:col-span-2">
          <ActionChecklist title="90-Day Action Steps" actions={accountability.ninety_day} completed={completedActions} onToggle={onToggleAction} />
        </div>
      </section>
    </div>
  );
}