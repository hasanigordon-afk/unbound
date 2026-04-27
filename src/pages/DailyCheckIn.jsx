import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Flame, CheckCircle2, Loader2, RotateCcw, Users, Phone, CalendarPlus, ArrowRight } from "lucide-react";
import { markTrigger, TRIGGERS } from "@/lib/subscriptionEngine";

const C = {
  amber:   "#2E7D7A",
  green:   "#34A853",
  red:     "#E07A6C",
  muted:   "#6B7280",
  text:    "#1F2933",
  bg:      "#F7FAFC",
  surface: "#FFFFFF",
  border:  "#E5EEF1",
};

const MOODS = [
  { value: 1, emoji: "😢", label: "Really rough",  color: C.red    },
  { value: 2, emoji: "😕", label: "Struggling",    color: "#1E88E5" },
  { value: 3, emoji: "😐", label: "Getting by",    color: C.amber   },
  { value: 4, emoji: "🙂", label: "Doing okay",    color: "#5F9EA0" },
  { value: 5, emoji: "😊", label: "Feeling good",  color: C.green   },
];

function cravingColor(v) {
  if (v >= 8) return C.red;
  if (v >= 5) return C.amber;
  return C.green;
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
      borderRadius: 14, background: C.surface, border: `1px solid ${color}30`, cursor: "pointer" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ color, width: 17, height: 17 }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: C.muted }}>{sub}</p>
      </div>
      <ArrowRight style={{ color: C.muted, width: 14, height: 14 }} />
    </div>
  );
  if (external) return <a href={href} style={{ textDecoration: "none" }}>{inner}</a>;
  return <Link to={createPageUrl(href)} style={{ textDecoration: "none" }}>{inner}</Link>;
}

export default function DailyCheckIn() {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
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
      markTrigger(TRIGGERS.FIRST_CHECKIN);
      setStep(1);
    },
  });

  const canSubmit = form.mood_rating !== null && form.attended_meeting !== null && form.connected_with_sponsor !== null;

  const supportMsg = canSubmit
    ? SupportMessage({ mood: form.mood_rating, attended: form.attended_meeting, craving: form.craving_intensity })
    : "";

  const suggestions = useMemo(() => {
    if (!canSubmit) return [];
    const list = [];
    if (form.mood_rating <= 2) {
      list.push({ icon: RotateCcw, label: "Reset Button",  sub: "Breathing, meditation & grounding tools", href: "MentalReset",  color: C.green });
      list.push({ icon: Users,     label: "Inner Circle",  sub: "Call or message someone who cares",       href: "InnerCircle", color: C.amber });
    }
    if (!form.attended_meeting) {
      list.push({ icon: CalendarPlus, label: "Find a Meeting", sub: "Search for AA, NA, and other meetings", href: "RecoveryMapFinder", color: C.amber });
    }
    if (form.craving_enabled && form.craving_intensity >= 7) {
      list.push({ icon: Phone, label: "988 Crisis Line", sub: "Free, confidential, 24/7 support", href: "tel:988", color: C.red, external: true });
    }
    if (!form.connected_with_sponsor) {
      list.push({ icon: Users, label: "Message Your Support", sub: "A quick text goes a long way", href: "ParticipantMessages", color: C.amber });
    }
    return list.slice(0, 3);
  }, [form, canSubmit]);

  const newStreak = streak + 1;
  const selectedMood = MOODS.find(m => m.value === form.mood_rating);

  // Already done today
  if (alreadyDone && step === 0) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 52, marginBottom: 14 }}>✅</p>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 8 }}>
        Already checked in today
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
        🔥 {streak} day streak. Come back tomorrow to keep it going.
      </p>
      <Link to={createPageUrl("MyFoundation")} style={{ textDecoration: "none", width: "100%", maxWidth: 340 }}>
        <div style={{ padding: "15px", borderRadius: 50, background: C.amber,
          color: "#fff", fontWeight: 700, fontSize: 15 }}>Back to My Foundation</div>
      </Link>
    </div>
  );

  // Success screen
  if (step === 1) return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "60px 20px 100px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 52, marginBottom: 12 }}>{selectedMood?.emoji || "✅"}</p>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
            {newStreak > 1 ? `${newStreak} days in a row.` : "You showed up today."}
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
            borderRadius: 20, background: "rgba(46,125,122,0.12)", border: "1px solid rgba(46,125,122,0.25)", marginBottom: 16 }}>
            <Flame style={{ color: C.amber, width: 14, height: 14 }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{newStreak} day streak</p>
          </div>
        </div>

        <div style={{ borderRadius: 16, padding: "18px 20px", marginBottom: 20,
          background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, fontStyle: "italic",
            borderLeft: "3px solid rgba(46,125,122,0.4)", paddingLeft: 14 }}>
            "{supportMsg}"
          </p>
        </div>

        {suggestions.length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Suggested for you</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {suggestions.map((s, i) => <SuggestionCard key={i} {...s} />)}
            </div>
          </>
        )}

        <Link to={createPageUrl("MyFoundation")} style={{ textDecoration: "none" }}>
          <div style={{ width: "100%", padding: "15px", borderRadius: 50, textAlign: "center",
            background: C.amber, color: "#fff", fontWeight: 700, fontSize: 15 }}>
            Back to My Foundation →
          </div>
        </Link>
      </div>
    </div>
  );

  // Check-in form
  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase",
            letterSpacing: ".12em", marginBottom: 4 }}>Daily Check-In</p>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 4, lineHeight: 1.2 }}>
            How are you today?
          </h1>
          {streak > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(46,125,122,0.10)", border: "1px solid rgba(46,125,122,0.25)" }}>
              <Flame style={{ color: C.amber, width: 13, height: 13 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{streak} day streak — keep it going</p>
            </div>
          )}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Mood */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 12,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Mood today</p>
            <div style={{ display: "flex", gap: 8 }}>
              {MOODS.map(m => {
                const sel = form.mood_rating === m.value;
                return (
                  <button key={m.value} onClick={() => setForm(f => ({ ...f, mood_rating: m.value }))}
                    style={{ flex: 1, padding: "12px 4px", borderRadius: 12, cursor: "pointer",
                      background: sel ? `${m.color}15` : C.bg,
                      border: `1.5px solid ${sel ? m.color + "50" : C.border}`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      transition: "all 0.15s ease" }}>
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? m.color : C.muted,
                      textAlign: "center", lineHeight: 1.2 }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Craving */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 12,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Craving level</p>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={form.craving_enabled}
                  onChange={e => setForm(f => ({ ...f, craving_enabled: e.target.checked }))}
                  style={{ width: 14, height: 14, cursor: "pointer", accentColor: C.amber }} />
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Track today</span>
              </label>
            </div>
            {form.craving_enabled ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: C.muted }}>Slide to set intensity</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: cravingColor(form.craving_intensity), lineHeight: 1 }}>
                    {form.craving_intensity}<span style={{ fontSize: 12, color: C.muted }}>/10</span>
                  </p>
                </div>
                <input type="range" min="0" max="10" step="1" value={form.craving_intensity}
                  onChange={e => setForm(f => ({ ...f, craving_intensity: parseInt(e.target.value) }))}
                  style={{ width: "100%", accentColor: cravingColor(form.craving_intensity), cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: C.muted }}>None</span>
                  <span style={{ fontSize: 10, color: C.muted }}>Overwhelming</span>
                </div>
                {form.craving_intensity >= 8 && (
                  <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10,
                    background: "rgba(224,122,108,.07)", border: "1px solid rgba(224,122,108,.2)" }}>
                    <p style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>
                      That's a lot to carry. You're not alone — reach out to someone you trust.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>Optional — tap "Track today" to log your craving level.</p>
            )}
          </div>

          {/* Meeting */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 12,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Did you attend a meeting today?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ val: true, label: "Yes ✓" }, { val: false, label: "Not today" }].map(o => {
                const sel = form.attended_meeting === o.val;
                return (
                  <button key={String(o.val)} onClick={() => setForm(f => ({ ...f, attended_meeting: o.val }))}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: sel ? (o.val ? "rgba(52,168,83,.12)" : "rgba(46,125,122,.10)") : C.bg,
                      border: `1.5px solid ${sel ? (o.val ? "rgba(52,168,83,.4)" : "rgba(46,125,122,.3)") : C.border}`,
                      color: sel ? (o.val ? C.green : C.amber) : C.muted,
                      fontWeight: 700, fontSize: 14, transition: "all 0.15s ease" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sponsor */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 12,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Did you contact your sponsor?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ val: true, label: "Yes ✓" }, { val: false, label: "Not today" }].map(o => {
                const sel = form.connected_with_sponsor === o.val;
                return (
                  <button key={String(o.val)} onClick={() => setForm(f => ({ ...f, connected_with_sponsor: o.val }))}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: sel ? (o.val ? "rgba(52,168,83,.12)" : "rgba(46,125,122,.10)") : C.bg,
                      border: `1.5px solid ${sel ? (o.val ? "rgba(52,168,83,.4)" : "rgba(46,125,122,.3)") : C.border}`,
                      color: sel ? (o.val ? C.green : C.amber) : C.muted,
                      fontWeight: 700, fontSize: 14, transition: "all 0.15s ease" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 20,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Anything on your mind? <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
            </p>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Say whatever you need to say…"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
                border: `1px solid ${C.border}`, background: C.bg,
                color: C.text, fontSize: 14, resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit" }} />
          </div>

          {/* Submit */}
          <button onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
            style={{ width: "100%", padding: "16px", borderRadius: 50, border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? C.amber : C.border,
              color: canSubmit ? "#fff" : C.muted,
              fontWeight: 700, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease" }}>
            {submitMutation.isPending
              ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
              : <CheckCircle2 style={{ width: 18, height: 18 }} />}
            {submitMutation.isPending ? "Saving…" : "Complete Check-In"}
          </button>

          {!canSubmit && (
            <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 10 }}>
              Select mood, meeting, and sponsor answers to continue.
            </p>
          )}

          {/* Crisis strip */}
          <a href="tel:988" style={{ textDecoration: "none", display: "block", marginTop: 20,
            padding: "12px 16px", borderRadius: 14,
            background: "rgba(224,122,108,.06)", border: "1px solid rgba(224,122,108,.18)",
            textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.red }}>In crisis? Call 988 · Always available</p>
          </a>
        </div>
      </div>
    </div>
  );
}