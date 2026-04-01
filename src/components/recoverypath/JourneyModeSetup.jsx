import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

const C = { teal: "#2DD4BF", gold: "#C9A96E", emerald: "#10B981", amber: "#F59E0B", indigo: "#6366F1" };

const MODES = [
  {
    value: "recovery_focused", label: "Recovery-Focused Week", emoji: "🔵", color: C.teal,
    desc: "Structure built around meetings, sponsor contact, and daily check-ins.",
    tasks: [
      { title: "Morning meditation (10 min)", category: "recovery", days_of_week: [1,2,3,4,5,6,0], priority: "essential", estimated_minutes: 10 },
      { title: "Attend recovery meeting", category: "recovery", days_of_week: [1,3,5], priority: "essential", estimated_minutes: 60 },
      { title: "Contact sponsor or mentor", category: "recovery", days_of_week: [1,3,5], priority: "high", estimated_minutes: 15 },
      { title: "Daily check-in on Rebos", category: "recovery", days_of_week: [1,2,3,4,5,6,0], priority: "essential", estimated_minutes: 5 },
      { title: "Evening gratitude journal", category: "personal_growth", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 10 },
    ]
  },
  {
    value: "job_search", label: "Job Search Week", emoji: "💼", color: C.gold,
    desc: "Focused on building employment momentum — applications, networking, interviews.",
    tasks: [
      { title: "Apply to 2 jobs", category: "employment", days_of_week: [1,2,3,4,5], priority: "essential", estimated_minutes: 45 },
      { title: "Update resume / LinkedIn", category: "employment", days_of_week: [1], priority: "high", estimated_minutes: 60 },
      { title: "Follow up on applications", category: "employment", days_of_week: [3,5], priority: "high", estimated_minutes: 20 },
      { title: "Practice interview answers", category: "personal_growth", days_of_week: [2,4], priority: "normal", estimated_minutes: 20 },
      { title: "Morning walk (clear your head)", category: "wellness", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 20 },
    ]
  },
  {
    value: "mental_reset", label: "Mental Reset Week", emoji: "🧠", color: "#A78BFA",
    desc: "Slower pace. Breathe. Recover mentally. Prioritize peace and stability.",
    tasks: [
      { title: "Morning breathing exercise", category: "wellness", days_of_week: [1,2,3,4,5,6,0], priority: "essential", estimated_minutes: 10 },
      { title: "No screens first hour of day", category: "wellness", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 60 },
      { title: "10-min journaling", category: "personal_growth", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 10 },
      { title: "Take a walk outside", category: "health", days_of_week: [1,3,5,0], priority: "normal", estimated_minutes: 30 },
      { title: "One recovery meeting", category: "recovery", days_of_week: [3], priority: "essential", estimated_minutes: 60 },
    ]
  },
  {
    value: "wellness", label: "Wellness Week", emoji: "🟢", color: C.emerald,
    desc: "Body, mind, and habits. Build healthy routines that last.",
    tasks: [
      { title: "Exercise / gym (30 min)", category: "health", days_of_week: [1,3,5], priority: "essential", estimated_minutes: 30 },
      { title: "Cook a healthy meal", category: "health", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 30 },
      { title: "Sleep by 11pm", category: "wellness", days_of_week: [1,2,3,4,5], priority: "high", estimated_minutes: 5 },
      { title: "Drink 8 glasses of water", category: "health", days_of_week: [1,2,3,4,5,6,0], priority: "normal", estimated_minutes: 1 },
      { title: "Read or listen to something positive", category: "personal_growth", days_of_week: [1,2,3,4,5], priority: "optional", estimated_minutes: 20 },
    ]
  },
  {
    value: "accountability", label: "Accountability Week", emoji: "🔐", color: C.amber,
    desc: "Check every box. Meet every obligation. Build trust in yourself.",
    tasks: [
      { title: "Meet all legal / probation obligations", category: "legal_probation", days_of_week: [1,5], priority: "essential", estimated_minutes: 60 },
      { title: "Complete all responsibilities", category: "responsibilities", days_of_week: [1,2,3,4,5], priority: "essential", estimated_minutes: 60 },
      { title: "Check in with family", category: "family", days_of_week: [1,3,5], priority: "high", estimated_minutes: 15 },
      { title: "Review your goals for the week", category: "personal_growth", days_of_week: [1], priority: "high", estimated_minutes: 15 },
      { title: "End-of-day reflection", category: "personal_growth", days_of_week: [1,2,3,4,5], priority: "normal", estimated_minutes: 5 },
    ]
  },
  {
    value: "custom", label: "Custom Week", emoji: "✏️", color: C.indigo,
    desc: "Build your own week from scratch. You know what you need.",
    tasks: []
  },
];

export default function JourneyModeSetup({ user, onModeSet }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [lowEnergy, setLowEnergy] = useState(false);
  const [adding, setAdding] = useState(false);

  const { data: activeMode } = useQuery({
    queryKey: ["rp-journey-mode", user?.email],
    queryFn: () => base44.entities.RecoveryPathJourneyMode.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      setAdding(true);
      const weekStart = new Date().toISOString().split("T")[0];
      // Deactivate old modes
      if (activeMode?.id) {
        await base44.entities.RecoveryPathJourneyMode.update(activeMode.id, { is_active: false });
      }
      await base44.entities.RecoveryPathJourneyMode.create({
        user_email: user.email, mode_type: selected, week_start_date: weekStart,
        is_active: true, low_energy_mode: lowEnergy,
      });
      // Add suggested tasks
      const mode = MODES.find(m => m.value === selected);
      for (const t of mode?.tasks || []) {
        const task = { ...t, user_email: user.email, recurrence: "weekly", is_active: true };
        if (lowEnergy) { task.estimated_minutes = Math.round((task.estimated_minutes || 20) * 0.5); }
        await base44.entities.RecoveryPathTask.create(task);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rp-journey-mode"] });
      qc.invalidateQueries({ queryKey: ["rp-tasks"] });
      setAdding(false);
      if (onModeSet) onModeSet();
    },
  });

  const modeConfig = MODES.find(m => m.value === activeMode?.mode_type);

  return (
    <div>
      {activeMode && (
        <div style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 20,
          background: `${modeConfig?.color || C.teal}10`, border: `1px solid ${modeConfig?.color || C.teal}25` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: modeConfig?.color || C.teal,
            textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Active Mode</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
            {modeConfig?.emoji} {modeConfig?.label}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Started {activeMode.week_start_date}</p>
        </div>
      )}

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
        Choose the type of week you're building. We'll suggest tasks to match. You can edit anything.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {MODES.map(mode => {
          const sel = selected === mode.value;
          return (
            <div key={mode.value} onClick={() => setSelected(mode.value)}
              style={{ borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                background: sel ? `${mode.color}10` : "rgba(255,255,255,0.03)",
                border: `1px solid ${sel ? mode.color + "40" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{mode.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: sel ? mode.color : "#fff" }}>{mode.label}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.5 }}>{mode.desc}</p>
                  {mode.tasks.length > 0 && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
                    {mode.tasks.length} suggested tasks included
                  </p>}
                </div>
                {sel && <CheckCircle2 style={{ color: mode.color, width: 18, height: 18, flexShrink: 0 }} />}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
            <input type="checkbox" checked={lowEnergy} onChange={e => setLowEnergy(e.target.checked)}
              style={{ width: 16, height: 16 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Low-Energy Mode</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Shorter tasks, lighter pace. Still making progress.</p>
            </div>
          </label>
          <button onClick={() => activateMutation.mutate()} disabled={activateMutation.isPending}
            style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${C.teal},#22C5B0)`,
              color: "#07090F", fontWeight: 800, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 6px 24px rgba(45,212,191,0.2)" }}>
            {activateMutation.isPending
              ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
              : <Zap style={{ width: 15, height: 15 }} />}
            {activateMutation.isPending ? "Building your plan…" : "Start This Week's Plan →"}
          </button>
        </>
      )}
    </div>
  );
}