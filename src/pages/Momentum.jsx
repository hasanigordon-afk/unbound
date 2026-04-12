import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, Zap } from "lucide-react";
import { createPageUrl } from "./utils";
import ActivityLogger from "@/components/momentum/ActivityLogger";
import StreakDisplay from "@/components/momentum/StreakDisplay";
import ActivityFeed from "@/components/momentum/ActivityFeed";

const C = {
  amber:   "#B8823A",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const TABS = [
  { id: "today",    label: "Today"    },
  { id: "progress", label: "Progress" },
  { id: "history",  label: "History"  },
];

export default function Momentum() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("today");
  const today = new Date().toISOString().split("T")[0];

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: logs = [] } = useQuery({
    queryKey: ["momentum-logs", user?.email],
    queryFn: () => base44.entities.MomentumLog.filter({ user_email: user.email }, "-log_date", 500),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.MomentumLog.create({ user_email: user.email, log_date: today, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["momentum-logs"] }),
  });

  const { streak, longestStreak } = useMemo(() => {
    const activeDays = new Set(logs.map(l => l.log_date));
    let s = 0;
    const cur = new Date(); cur.setHours(0, 0, 0, 0);
    while (activeDays.has(cur.toISOString().split("T")[0])) {
      s++; cur.setDate(cur.getDate() - 1);
    }
    const sorted = [...activeDays].sort();
    let longest = 0, temp = 0, prev = null;
    for (const d of sorted) {
      if (!prev) { temp = 1; }
      else { const diff = (new Date(d) - new Date(prev)) / 86400000; temp = diff === 1 ? temp + 1 : 1; }
      if (temp > longest) longest = temp;
      prev = d;
    }
    return { streak: s, longestStreak: Math.max(s, longest) };
  }, [logs]);

  const totalSessions = logs.length;
  const totalMins = logs.reduce((s, l) => s + (l.duration_mins || 0), 0);
  const todayLogged = logs.filter(l => l.log_date === today);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Zap style={{ color: C.amber, width: 16, height: 16 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: ".1em" }}>Momentum</p>
              </div>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
                Move your body,<br />build your life.
              </h1>
              <p style={{ fontSize: 13, color: C.muted }}>
                {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {streak > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 14px", borderRadius: 14,
                background: "rgba(184,130,58,.10)", border: "1px solid rgba(184,130,58,.25)" }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: C.amber, lineHeight: 1 }}>{streak}</p>
                <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>day streak 🔥</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "12px 6px", borderRadius: 0, border: "none", cursor: "pointer",
                background: "transparent",
                borderBottom: tab === t.id ? `2px solid ${C.amber}` : "2px solid transparent",
                color: tab === t.id ? C.amber : C.muted,
                fontWeight: tab === t.id ? 700 : 500, fontSize: 13 }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 16px" }}>
          {tab === "today" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ActivityLogger onSave={(data) => saveMutation.mutateAsync(data)}
                isSaving={saveMutation.isPending} todayLogged={todayLogged} />
              <div style={{ borderRadius: 14, padding: "16px 18px",
                background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.18)" }}>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontStyle: "italic", textAlign: "center" }}>
                  {streak === 0
                    ? "\"Every champion was once a beginner who didn't quit.\""
                    : streak < 7
                    ? `"${streak} days in. Your body is already adapting. Keep moving."`
                    : `"${streak} days strong. This is who you're becoming."`}
                </p>
              </div>
            </div>
          )}
          {tab === "progress" && (
            <StreakDisplay streak={streak} totalSessions={totalSessions}
              totalMins={totalMins} longestStreak={longestStreak} />
          )}
          {tab === "history" && <ActivityFeed logs={logs} />}
        </div>
      </div>
    </div>
  );
}