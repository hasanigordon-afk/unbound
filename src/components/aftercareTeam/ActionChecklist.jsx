import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ActionChecklist({ title, actions = [], completed = [], onToggle }) {
  return (
    <div className="card-soft p-5">
      <h3 className="text-lg font-serif font-semibold text-[var(--text)] mb-4">{title}</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const id = `${title}-${index}-${action}`;
          const checked = completed.includes(id);
          return (
            <label key={id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 cursor-pointer">
              <Checkbox checked={checked} onCheckedChange={() => onToggle(id)} className="mt-0.5" />
              <span className={`text-sm ${checked ? "line-through text-[var(--text-dim)]" : "text-[var(--text-muted)]"}`}>{action}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}