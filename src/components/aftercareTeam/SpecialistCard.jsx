import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function SpecialistCard({ title, icon: Icon, accent, summary, steps = [] }) {
  return (
    <article className="card-soft p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text)]">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">{summary}</p>
        </div>
      </div>
      <div className="space-y-2">
        {steps.slice(0, 5).map((step, index) => (
          <div key={index} className="flex gap-2 text-sm text-[var(--text-muted)]">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </article>
  );
}