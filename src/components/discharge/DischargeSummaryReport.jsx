import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, Calendar, Target, BookOpen, Loader2 } from "lucide-react";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  indigo:  "#6366F1",
  muted:   "rgba(255,255,255,0.35)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14 },
};

function StatBox({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ ...C.glass, padding: "14px 16px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon style={{ color, width: 13, height: 13 }} />
        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</p>
      </div>
      <p style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function CategoryBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 800, color }}>{pct}%</p>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}

export default function DischargeSummaryReport({ clientEmail, formData }) {
  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["discharge-summary-checkins", clientEmail],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: clientEmail }, "-check_in_date", 200),
    enabled: !!clientEmail,
  });

  const { data: focusLogs = [] } = useQuery({
    queryKey: ["discharge-focus-logs", clientEmail],
    queryFn: () => base44.entities.DailyFocusLog.filter({ user_email: clientEmail }, "-log_date", 200),
    enabled: !!clientEmail,
  });

  const { data: savedArticles = [] } = useQuery({
    queryKey: ["discharge-saved-articles", clientEmail],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: clientEmail }),
    enabled: !!clientEmail,
  });

  if (!clientEmail) return (
    <div style={{ ...C.glass, padding: "20px", textAlign: "center" }}>
      <p style={{ color: C.muted, fontSize: 13 }}>Add a patient email to generate the summary report.</p>
    </div>
  );

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Loader2 style={{ color: C.teal, width: 24, height: 24 }} className="animate-spin" />
    </div>
  );

  // ── Streak calculation ──────────────────────────────────────────
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let streak = 0, longestStreak = 0, tempStreak = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { streak++; cur = d; } else break;
  }
  let prevDate = null;
  for (const c of [...sorted].reverse()) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    tempStreak = prevDate && Math.round((d - prevDate) / 86400000) === 1 ? tempStreak + 1 : 1;
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = d;
  }

  // ── Weekly engagement trend ──────────────────────────────────
  const weekBuckets = [];
  for (let w = 0; w < 8; w++) {
    const from = new Date(); from.setDate(from.getDate() - (w + 1) * 7);
    const to   = new Date(); to.setDate(to.getDate() - w * 7);
    const count = checkIns.filter(c => {
      const d = new Date(c.check_in_date);
      return d >= from && d < to;
    }).length;
    weekBuckets.unshift(Math.round((count / 7) * 100));
  }

  // ── Category completion ───────────────────────────────────────
  const CATS = [
    { key: "recovery",        label: "Recovery",        color: C.teal   },
    { key: "productivity",    label: "Productivity",    color: C.indigo },
    { key: "physical_health", label: "Physical Health", color: C.emerald},
    { key: "relationships",   label: "Relationships",   color: C.amber  },
    { key: "mental_growth",   label: "Growth",          color: "#A78BFA"},
  ];
  const catStats = CATS.map(cat => {
    const total = focusLogs.filter(l => l.category_key === cat.key).length;
    const done  = focusLogs.filter(l => l.category_key === cat.key && l.completed).length;
    return { ...cat, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  // ── Meeting attendance ────────────────────────────────────────
  const meetingsAttended = checkIns.filter(c => c.attended_meeting).length;
  const sponsorContacts  = checkIns.filter(c => c.connected_with_sponsor).length;
  const avgCraving = checkIns.length
    ? (checkIns.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / checkIns.length).toFixed(1)
    : "—";

  const overallEngagement = checkIns.length && formData?.discharge_date
    ? Math.round((checkIns.length / Math.max(1, Math.floor((new Date() - new Date(formData.sobriety_start_date || formData.start_date || Date.now())) / 86400000))) * 100)
    : Math.round((weekBuckets.reduce((s, n) => s + n, 0) / weekBuckets.length));

  return (
    <div>
      <div style={{ background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.15)", borderRadius: 12,
        padding: "12px 16px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          Auto-generated from <strong style={{ color: C.teal }}>{checkIns.length} check-ins</strong> and focus log data.
          This summary will be included in the final discharge report.
        </p>
      </div>

      {/* ── Key stats ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <StatBox icon={Flame}     label="Current Streak"  value={`${streak}d`}         color={C.teal}    />
        <StatBox icon={TrendingUp}label="Longest Streak"  value={`${longestStreak}d`}  color={C.gold}    />
        <StatBox icon={Calendar}  label="Total Check-Ins" value={checkIns.length}       color={C.indigo}  />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <StatBox icon={Target}    label="Avg Engagement"  value={`${overallEngagement}%`} color={C.emerald} sub="overall" />
        <StatBox icon={Calendar}  label="Meetings"        value={meetingsAttended}      color={C.amber}   sub="attended" />
        <StatBox icon={BookOpen}  label="Sponsor Contacts" value={sponsorContacts}       color="#A78BFA"   />
      </div>

      {/* ── Average craving trend ── */}
      <div style={{ ...C.glass, padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Average Craving Score</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: parseFloat(avgCraving) < 5 ? C.emerald : C.amber }}>{avgCraving}/10</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
          {weekBuckets.map((pct, i) => (
            <div key={i} style={{ flex: 1, borderRadius: "3px 3px 0 0", minHeight: 4,
              height: `${Math.max(4, pct * 0.4)}px`,
              background: i === weekBuckets.length - 1 ? C.teal : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>8-week engagement trend (most recent on right)</p>
      </div>

      {/* ── Category completion ── */}
      {focusLogs.length > 0 && (
        <div style={{ ...C.glass, padding: "16px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Focus Category Performance</p>
          {catStats.map(cat => <CategoryBar key={cat.key} label={cat.label} pct={cat.pct} color={cat.color} />)}
        </div>
      )}

      {/* ── Resource usage ── */}
      <div style={{ ...C.glass, padding: "16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Resource Engagement</p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: C.teal }}>{savedArticles.length}</p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Saved Resources</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{meetingsAttended}</p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Meetings Logged</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#A78BFA" }}>{sponsorContacts}</p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Sponsor Contacts</p>
          </div>
        </div>
      </div>

      {/* ── Transition goals from form ── */}
      {(formData?.goals_30_day || formData?.goals_60_day || formData?.goals_90_day) && (
        <div style={{ ...C.glass, padding: "16px" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Transition Goals Summary</p>
          {[
            { label: "30 Days", value: formData.goals_30_day, color: C.teal },
            { label: "60 Days", value: formData.goals_60_day, color: C.gold },
            { label: "90 Days", value: formData.goals_90_day, color: C.emerald },
          ].filter(g => g.value).map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: g.color, textTransform: "uppercase",
                letterSpacing: ".07em", marginBottom: 4 }}>{g.label}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{g.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}