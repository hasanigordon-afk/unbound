import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Map, CalendarDays, TrendingUp, Compass, Loader2, Sparkles } from "lucide-react";
import RecoveryCoach from "@/components/recoverypath/RecoveryCoach";
import DailyDashboard from "@/components/recoverypath/DailyDashboard";
import WeeklyBuilder from "@/components/recoverypath/WeeklyBuilder";
import PathProgress from "@/components/recoverypath/PathProgress";
import JourneyModeSetup from "@/components/recoverypath/JourneyModeSetup";

const C = {
  teal: "#2DD4BF", gold: "#C9A96E", indigo: "#6366F1",
  navy: "#07090F",
};

const TABS = [
  { id: "today",   label: "Today",    icon: Map          },
  { id: "weekly",  label: "My Plan",  icon: CalendarDays },
  { id: "progress",label: "Progress", icon: TrendingUp   },
  { id: "journey", label: "Journey",  icon: Compass      },
  { id: "coach",   label: "Coach",    icon: Sparkles     },
];

export default function RecoveryPath() {
  const [tab, setTab] = useState("today");

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.teal, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(155deg,#0E1528 0%,#080E1C 100%)",
          padding: "60px 24px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
              borderRadius: 20, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)",
              marginBottom: 10 }}>
              <Map style={{ color: C.teal, width: 11, height: 11 }} />
              <p style={{ fontSize: 10, fontWeight: 800, color: C.teal, letterSpacing: ".08em", textTransform: "uppercase" }}>Recovery Path</p>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 4 }}>
              {dayName}, <span style={{ color: C.teal }}>{dateStr}</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Your week. Your plan. Your progress.
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,9,15,0.95)" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: "12px 4px", border: "none", cursor: "pointer",
                  background: "transparent",
                  borderBottom: active ? `2px solid ${C.teal}` : "2px solid transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Icon style={{ color: active ? C.teal : "rgba(255,255,255,0.3)", width: 17, height: 17 }}
                  strokeWidth={active ? 2.2 : 1.5} />
                <span style={{ fontSize: 10, fontWeight: active ? 800 : 500,
                  color: active ? C.teal : "rgba(255,255,255,0.3)", letterSpacing: ".03em" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div style={{ padding: "16px 16px" }}>
          {tab === "today"    && <DailyDashboard user={user} />}
          {tab === "weekly"   && <WeeklyBuilder  user={user} />}
          {tab === "progress" && <PathProgress   user={user} />}
          {tab === "journey"  && <JourneyModeSetup user={user} onModeSet={() => setTab("today")} />}
          {tab === "coach"    && <RecoveryCoach user={user} />}
        </div>
      </div>
    </div>
  );
}