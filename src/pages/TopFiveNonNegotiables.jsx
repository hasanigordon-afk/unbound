import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, ChevronDown, ChevronUp, Flame, Flag, Image, Mic, Plus, Quote, Sparkles, Target, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const examples = [
  "Get custody of my daughter",
  "Stay sober for 1 year",
  "Get my own apartment",
  "Repair family relationships",
  "Build financial stability",
];

export default function TopFiveNonNegotiables() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [draft, setDraft] = useState({ title: "", why_it_matters: "", personal_quote: "" });

  const { data = { user: null, goals: [] } } = useQuery({
    queryKey: ["top-five-non-negotiables"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const goals = await base44.entities.TopFiveNonNegotiable.filter({ user_email: user.email, is_active: true }, "sort_order", 5);
      return { user, goals };
    },
    initialData: { user: null, goals: [] },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["top-five-non-negotiables"] });
  const createMutation = useMutation({ mutationFn: (payload) => base44.entities.TopFiveNonNegotiable.create(payload), onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => base44.entities.TopFiveNonNegotiable.update(id, payload), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: (goal) => base44.entities.TopFiveNonNegotiable.update(goal.id, { is_active: false }), onSuccess: refresh });

  const goals = data.goals || [];
  const canAdd = goals.length < 5;
  const focusOptions = [
    { value: "struggling", label: "Struggling" },
    { value: "focused", label: "Focused" },
    { value: "locked_in", label: "Locked In" },
  ];
  const priorityLabels = { low: "Low priority", medium: "Medium priority", high: "High priority" };
  const formatLastCheckIn = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not checked in";

  const createGoal = () => {
    if (!draft.title.trim() || !data.user || !canAdd) return;
    createMutation.mutate({ ...draft, user_email: data.user.email, sort_order: goals.length + 1, progress: 0, months_complete: 0, duration_months: 12, daily_focus_level: "focused", current_streak: 0, priority_level: "medium", is_active: true });
    setDraft({ title: "", why_it_matters: "", personal_quote: "" });
  };

  const moveGoal = (goal, direction) => {
    const nextOrder = goal.sort_order + direction;
    const swap = goals.find(g => g.sort_order === nextOrder);
    if (!swap) return;
    updateMutation.mutate({ id: goal.id, payload: { sort_order: nextOrder } });
    updateMutation.mutate({ id: swap.id, payload: { sort_order: goal.sort_order } });
  };

  const updateField = (goal, field, value) => updateMutation.mutate({ id: goal.id, payload: { [field]: value } });

  return (
    <main style={{ minHeight: "100vh", padding: "38px 0 150px", color: "var(--text)" }}>
      <div style={{ width: "min(1180px, calc(100vw - 40px))", margin: "0 auto" }}>
        <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22, fontWeight: 800 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Command Center
        </Link>

        <section className="card-glow" style={{ position: "relative", overflow: "hidden", padding: "clamp(30px, 5vw, 56px)", marginBottom: 28 }}>
          <div aria-hidden style={{ position: "absolute", right: -90, top: -100, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.28), transparent 68%)", filter: "blur(20px)" }} />
          <div style={{ position: "relative", maxWidth: 780 }}>
            <div className="pill pill-sand" style={{ marginBottom: 16 }}><Sparkles style={{ width: 13, height: 13, marginRight: 7 }} /> Mission Board</div>
            <h1 style={{ fontSize: "clamp(38px, 6vw, 72px)", lineHeight: .95, margin: 0 }}>Top 5 Non‑Negotiables</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.7, marginTop: 16 }}>
              These are not tasks. These are the five life missions you refuse to give up on — your comeback blueprint for the hard days.
            </p>
          </div>
        </section>

        {canAdd && (
          <section className="card" style={{ padding: "clamp(22px, 4vw, 34px)", marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 26, margin: 0 }}>Add a mission objective</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 7 }}>Write one life mission you refuse to give up on.</p>
              </div>
              <span className="pill pill-ghost">{goals.length}/5 saved</span>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <Textarea
                placeholder="Example: Stay sober for 1 year"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                autoComplete="off"
                spellCheck="false"
                style={{ minHeight: 92, fontSize: 18, lineHeight: 1.45, padding: 16 }}
              />
              <Textarea
                placeholder="Why this matters — who or what are you fighting for?"
                value={draft.why_it_matters}
                onChange={(e) => setDraft({ ...draft, why_it_matters: e.target.value })}
                autoComplete="off"
                spellCheck="false"
                style={{ minHeight: 86, fontSize: 15, lineHeight: 1.55, padding: 16 }}
              />
              <Input
                placeholder="Personal quote or reminder, optional"
                value={draft.personal_quote}
                onChange={(e) => setDraft({ ...draft, personal_quote: e.target.value })}
                autoComplete="off"
                spellCheck="false"
                style={{ minHeight: 52, fontSize: 15, padding: "0 16px" }}
              />
              <Button onClick={createGoal} className="btn-primary" style={{ width: "fit-content", minWidth: 190 }}>
                <Plus style={{ width: 16, height: 16, marginRight: 8 }} /> Add Mission
              </Button>
            </div>
          </section>
        )}

        {!goals.length && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 28 }}>
            {examples.map((example) => (
              <button key={example} onClick={() => setDraft({ ...draft, title: example })} className="card-soft" style={{ textAlign: "left", padding: 18, color: "var(--text)", cursor: "pointer" }}>
                <Target style={{ width: 18, height: 18, color: "var(--accent)", marginBottom: 12 }} />
                <b>{example}</b>
              </button>
            ))}
          </div>
        )}

        <div className="mission-goal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(220px, 1fr))", gap: 16, overflowX: "auto", paddingBottom: 10 }}>
          {goals.map((goal, index) => (
            <article key={goal.id} className="mission-goal-card" style={{ minWidth: 220, padding: 18, borderRadius: 26, background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.045))", border: expanded === goal.id ? "1px solid var(--border-glow)" : "1px solid var(--border)", boxShadow: expanded === goal.id ? "var(--glow)" : "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 900 }}>MISSION 0{index + 1}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => moveGoal(goal, -1)} className="btn-ghost" style={{ minHeight: 30, padding: "0 8px" }}><ChevronUp style={{ width: 14, height: 14 }} /></button>
                  <button onClick={() => moveGoal(goal, 1)} className="btn-ghost" style={{ minHeight: 30, padding: "0 8px" }}><ChevronDown style={{ width: 14, height: 14 }} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: 22, lineHeight: 1.1, minHeight: 72 }}>{goal.title}</h3>
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>Mission progress indicator</span>
                  <strong style={{ color: "var(--gold)", fontSize: 13 }}>{goal.progress || 0}%</strong>
                </div>
                <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <div style={{ width: `${goal.progress || 0}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--purple), var(--gold))" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>
                  <span>{goal.months_complete ?? Math.round(((goal.progress || 0) / 100) * (goal.duration_months || 12))}/{goal.duration_months || 12} months complete</span>
                  <span>Milestone progress</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>Daily Focus Level</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {focusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField(goal, "daily_focus_level", option.value)}
                      style={{
                        minHeight: 34,
                        borderRadius: 999,
                        border: (goal.daily_focus_level || "focused") === option.value ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                        background: (goal.daily_focus_level || "focused") === option.value ? "var(--gold-dim)" : "rgba(255,255,255,0.05)",
                        color: (goal.daily_focus_level || "focused") === option.value ? "var(--gold)" : "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: "pointer"
                      }}
                    >{option.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8, marginTop: 14, color: "var(--text-muted)", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flame size={14} color="var(--gold)" /> Current streak</span><b style={{ color: "var(--text)" }}>{goal.current_streak || 0} days</b></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flag size={14} color="var(--accent)" /> Priority level</span><b style={{ color: "var(--text)" }}>{priorityLabels[goal.priority_level || "medium"]}</b></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CalendarClock size={14} color="var(--muted-green)" /> Last check-in</span><b style={{ color: "var(--text)" }}>{formatLastCheckIn(goal.last_checkin_date)}</b></div>
              </div>

              <button onClick={() => setExpanded(expanded === goal.id ? null : goal.id)} className="btn-ghost" style={{ width: "100%", marginTop: 14 }}>Details</button>
              {expanded === goal.id && (
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <Textarea placeholder="Why this matters" value={goal.why_it_matters || ""} onChange={(e) => updateField(goal, "why_it_matters", e.target.value)} />
                  <Input placeholder="Personal quote" value={goal.personal_quote || ""} onChange={(e) => updateField(goal, "personal_quote", e.target.value)} />
                  <Input placeholder="Pinned image URL" value={goal.image_url || ""} onChange={(e) => updateField(goal, "image_url", e.target.value)} />
                  <Input placeholder="Voice reminder URL" value={goal.voice_reminder_url || ""} onChange={(e) => updateField(goal, "voice_reminder_url", e.target.value)} />
                  <div style={{ display: "flex", gap: 8, color: "var(--text-dim)", fontSize: 12 }}><Image size={14} /> <Mic size={14} /> <Quote size={14} /> Personal anchors saved here</div>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate(goal)}><Trash2 style={{ width: 15, height: 15, marginRight: 8 }} /> Remove</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
      <style>{`
        .mission-goal-card { scroll-snap-align: start; transition: transform .22s, box-shadow .22s, border-color .22s; }
        .mission-goal-card:hover { transform: translateY(-4px); border-color: var(--border-glow) !important; }
        @media (max-width: 980px) {
          section .grid, div[style*="grid-template-columns: 1.1fr .9fr .9fr auto"] { grid-template-columns: 1fr !important; }
          .mission-goal-grid { display: flex !important; scroll-snap-type: x mandatory; }
        }
      `}</style>
    </main>
  );
}