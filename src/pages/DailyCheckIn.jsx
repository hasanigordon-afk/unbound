import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Flame, CheckCircle2, Loader2, RotateCcw, Users, Phone, CalendarPlus, ChevronLeft, ArrowRight } from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  indigo:  "#6366F1",
  rose:    "#F472B6",
  navy:    "#07090F",
};

const MOODS = [
  { value: 1, emoji: "😢", label: "Really rough",  color: C.red     },
  { value: 2, emoji: "😕", label: "Struggling",    color: C.amber   },
  { value: 3, emoji: "😐", label: "Getting by",    color: C.gold    },
  { value: 4, emoji: "🙂", label: "Doing okay",    color: C.teal    },
  { value: 5, emoji: "😊", label: "Feeling good",  color: C.emerald },
];

function cravingColor(v) {
  if (v >= 8) return C.red;
  if (v >= 6) return C.amber;
  if (v >= 4) return C.gold;
  return C.emerald;
}

function SupportMessage({ mood, attended, craving }) {
  const lines = [];

  if (mood >= 4) lines.push("You showed up today — that's real.");
  else if (mood === 3) lines.push("Getting through the day is enough sometimes. You did it.");
  else lines.push("Hard days are part of the path. You still checked in. That matters.");

  if (craving >= 7) lines.push("Cravings that strong take real strength to sit with. You're not alone in this.");
  else if (craving >= 4) lines.push("Stay close to your support system today.");

  if (!attended) lines.push("Try to make it to a meeting soon — even one call or text counts.");
  else lines.push("Going to a meeting is one of the strongest things you can do. Keep that habit.");

  return lines.join(" ");
}

function SuggestionCard({ icon: Icon, label, sub, href, color, external }) {
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      borderRadius: 14, background: `${color}0A`, border: `1px solid ${color}25`,
      cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ color, width: 18, height: 18 }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sub}</p>
      </div>
      <ArrowRight style={{ color: "rgba(255,255,255,0.25)", width: 14, height: 14 }} />
    </div>
  );
  if (external) return <a href={href} style={{ textDecoration: "none" }}>{inner}</a>;
  return <Link to={createPageUrl(href)} style={{ textDecoration: "none" }}>{inner}</Link>;
}

export default function DailyCheckIn() {
  const qc = useQueryClient();
  const [step, setStep] = useState(0); // 0=form, 1=success
  const [form, setForm] = useState({
    mood_rating: null,
    craving_intensity: 0,
    craving_enabled: false,
    attended_meeting: null,
    connected_with_sponsor: null,
    notes: "",
  });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 60),
    enabled: !!user?.email,
  });

  const streak = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  }, [checkIns]);

  const today = new Date().toISOString().split("T")[0];
  const alreadyDone = checkIns.some(c => c.check_in_date === today);

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.DailyCheckIn.create({
      participant_email: user.email,
      check_in_date: today,
      mood_rating: form.mood_rating,
      craving_intensity: form.craving_enabled ? form.craving_intensity : null,
      attended_meeting: form.attended_meeting,
      connected_with_sponsor: form.connected_with_sponsor,
      notes: form.notes || null,
      relapse_risk_flag: false,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-checkins"] });
      qc.invalidateQueries({ queryKey: ["foundation-checkins"] });
      setStep(1);
    },
  });

  const canSubmit = form.mood_rating !== null && form.attended_meeting !== null && form.connected_with_sponsor !== null;

  const supportMsg = canSubmit
    ? SupportMessage({ mood: form.mood_rating, attended: form.attended_meeting, craving: form.craving_intensity })
    : "";

  // Build smart suggestions
  const suggestions = useMemo(() => {
    if (!canSubmit) return [];
    const list = [];
    if (form.mood_rating <= 2) {
      list.push({ icon: RotateCcw, label: "Reset Button",  sub: "Breathing, meditation & grounding tools", href: "MentalReset",  color: C.teal   });
      list.push({ icon: Users,     label: "Inner Circle",  sub: "Call or message someone who cares",       href: "InnerCircle", color: C.rose });
    }
    if (!form.attended_meeting) {
      list.push({ icon: CalendarPlus, label: "Find a Meeting", sub: "Search for AA, NA, and other meetings", href: "RecoveryMapFinder", color: C.gold });
    }
    if (form.craving_enabled && form.craving_intensity >= 7) {
      list.push({ icon: Phone, label: "988 Crisis Line", sub: "Free, confidential, 24/7 support", href: "tel:988", color: C.red, external: true });
    }
    if (!form.connected_with_sponsor) {
      list.push({ icon: Users, label: "Message Your Support", sub: "A quick text goes a long way", href: "ParticipantMessages", color: C.rose });
    }
    return list.slice(0, 3);
  }, [form, canSubmit]);

  const newStreak = streak + 1;
  const selectedMood = MOODS.find(m => m.value === form.mood_rating);

  // Already done today
  if (alreadyDone && step === 0) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 52, marginBottom: 14 }}>✅</p>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Already checked in today</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.6 }}>
        🔥 {streak} day streak. Come back tomorrow to keep it going.
      </p>
      <Link to={createPageUrl("MyFoundation")} style={{ textDecoration: "none", width: "100%", maxWidth: 340 }}>
        <div style={{ padding: "15px", borderRadius: 14, background: `linear-gradient(135deg,${C.teal},#22C5B0)`,
          color: "#07090F", fontWeight: 800, fontSize: 15 }}>Back to My Foundation</div>
      </Link>
    </div>
  );

  // Success screen
  if (step === 1) return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh",
      padding: "60px 20px 100px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 52, marginBottom: 12 }}>
            {selectedMood?.emoji || "✅"}
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
            {newStreak > 1 ? `${newStreak} days in a row.` : "You showed up today."}
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
            borderRadius: 20, background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)",
            marginBottom: 16 }}>
            <Flame style={{ color: C.gold, width: 14, height: 14 }} />
            <p style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{newStreak} day streak</p>
          </div>
        </div>

        {/* Supportive message */}
        <div style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.75,
            fontStyle: "italic", borderLeft: `3px solid ${C.teal}50`, paddingLeft: 14 }}>
            "{supportMsg}"
          </p>
        </div>

        {/* Smart suggestions */}
        {suggestions.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Suggested for you</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {suggestions.map((s, i) => <SuggestionCard key={i} {...s} />)}
            </div>
          </>
        )}

        <Link to={createPageUrl("MyFoundation")} style={{ textDecoration: "none" }}>
          <div style={{ width: "100%", padding: "15px", borderRadius: 14, textAlign: "center",
            background: `linear-gradient(135deg,${C.teal},#22C5B0)`,
            color: "#07090F", fontWeight: 800, fontSize: 15,
            boxShadow: "0 6px 24px rgba(45,212,191,0.2)" }}>
            Back to My Foundation →
          </div>
        </Link>
      </div>
    </div>
  );

  // Check-in form
  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh",
      paddingBottom: 110 }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", position: "relative", overflow: "hidden",
          background: "linear-gradient(155deg,#0D1428,#080E1C)" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase",
              letterSpacing: ".12em", marginBottom: 4 }}>Daily Check-In</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
              How are you today?
            </h1>
            {streak > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                padding: "5px 12px", borderRadius: 20,
                background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}>
                <Flame style={{ color: C.gold, width: 13, height: 13 }} />
                <p style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{streak} day streak — keep it going</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Mood ── */}
          <div style={{ borderRadius: 20, padding: "18px", marginBottom: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Mood today</p>
            <div style={{ display: "flex", gap: 8 }}>
              {MOODS.map(m => {
                const sel = form.mood_rating === m.value;
                return (
                  <button key={m.value} onClick={() => setForm(f => ({ ...f, mood_rating: m.value }))}
                    style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: sel ? `${m.color}18` : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${sel ? m.color + "50" : "rgba(255,255,255,0.07)"}`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      transition: "all 0.15s ease" }}>
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? m.color : "rgba(255,255,255,0.3)",
                      textAlign: "center", lineHeight: 1.2 }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Craving ── */}
          <div style={{ borderRadius: 20, padding: "18px", marginBottom: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Craving level</p>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={form.craving_enabled}
                  onChange={e => setForm(f => ({ ...f, craving_enabled: e.target.checked }))}
                  style={{ width: 14, height: 14, cursor: "pointer", accentColor: C.teal }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Track today</span>
              </label>
            </div>
            {form.craving_enabled ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Slide to set intensity</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: cravingColor(form.craving_intensity), lineHeight: 1 }}>
                    {form.craving_intensity}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/10</span>
                  </p>
                </div>
                <input type="range" min="0" max="10" step="1" value={form.craving_intensity}
                  onChange={e => setForm(f => ({ ...f, craving_intensity: parseInt(e.target.value) }))}
                  style={{ width: "100%", accentColor: cravingColor(form.craving_intensity), cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>None</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Overwhelming</span>
                </div>
                {form.craving_intensity >= 8 && (
                  <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p style={{ fontSize: 12, color: "#F87171", fontWeight: 600 }}>
                      That's a lot to carry. You're not alone — reach out to someone you trust.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Optional — tap "Track today" to log your craving level.</p>
            )}
          </div>

          {/* ── Meeting ── */}
          <div style={{ borderRadius: 20, padding: "18px", marginBottom: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Did you attend a meeting today?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ val: true, label: "Yes ✓" }, { val: false, label: "Not today" }].map(o => {
                const sel = form.attended_meeting === o.val;
                return (
                  <button key={String(o.val)} onClick={() => setForm(f => ({ ...f, attended_meeting: o.val }))}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: sel
                        ? (o.val ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.08)")
                        : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${sel ? (o.val ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.3)") : "rgba(255,255,255,0.07)"}`,
                      color: sel ? (o.val ? C.emerald : C.amber) : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: 14, transition: "all 0.15s ease" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Sponsor ── */}
          <div style={{ borderRadius: 20, padding: "18px", marginBottom: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Did you contact your sponsor?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ val: true, label: "Yes ✓" }, { val: false, label: "Not today" }].map(o => {
                const sel = form.connected_with_sponsor === o.val;
                return (
                  <button key={String(o.val)} onClick={() => setForm(f => ({ ...f, connected_with_sponsor: o.val }))}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: sel
                        ? (o.val ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.08)")
                        : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${sel ? (o.val ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.3)") : "rgba(255,255,255,0.07)"}`,
                      color: sel ? (o.val ? C.emerald : C.amber) : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: 14, transition: "all 0.15s ease" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Notes ── */}
          <div style={{ borderRadius: 20, padding: "18px", marginBottom: 20,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Anything on your mind? <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>(optional)</span></p>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Say whatever you need to say…"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: 14, resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit" }} />
          </div>

          {/* ── Submit ── */}
          <button onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
            style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.07)",
              color: canSubmit ? "#07090F" : "rgba(255,255,255,0.25)",
              fontWeight: 800, fontSize: 16, boxShadow: canSubmit ? "0 8px 28px rgba(45,212,191,0.2)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease" }}>
            {submitMutation.isPending
              ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
              : <CheckCircle2 style={{ width: 18, height: 18 }} />}
            {submitMutation.isPending ? "Saving…" : "Complete Check-In"}
          </button>

          {!canSubmit && (
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
              Select mood, meeting, and sponsor answers to continue.
            </p>
          )}

          {/* Crisis strip */}
          <a href="tel:988" style={{ textDecoration: "none", display: "block", marginTop: 20,
            padding: "12px 16px", borderRadius: 14,
            background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
            textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#F87171" }}>In crisis? Call 988 · Always available</p>
          </a>
        </div>
      </div>
    </div>
  );
}