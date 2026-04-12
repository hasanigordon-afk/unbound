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
  amber:   "#B8823A",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const TABS = [
  { id: "today",    label: "Today",    icon: Map          },
  { id: "weekly",   label: "My Plan",  icon: CalendarDays },
  { id: "progress", label: "Progress", icon: TrendingUp   },
  { id: "journey",  label: "Journey",  icon: Compass      },
  { id: "coach",    label: "Coach",    icon: Sparkles     },
];

export default function RecoveryPath() {
  const [tab, setTab] = useState("today");

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.amber, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
            borderRadius: 20, background: "rgba(184,130,58,.10)", border: "1px solid rgba(184,130,58,.25)",
            marginBottom: 10 }}>
            <Map style={{ color: C.amber, width: 11, height: 11 }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: ".08em", textTransform: "uppercase" }}>Recovery Path</p>
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, color: C.text, lineHeight: 1.1, marginBottom: 4 }}>
            {dayName}, <span style={{ color: C.amber }}>{dateStr}</span>
          </h1>
          <p style={{ fontSize: 13, color: C.muted }}>Your week. Your plan. Your progress.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface,
          position: "sticky", top: 0, zIndex: 20 }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: "12px 4px", border: "none", cursor: "pointer",
                  background: "transparent",
                  borderBottom: active ? `2px solid ${C.amber}` : "2px solid transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Icon style={{ color: active ? C.amber : C.muted, width: 17, height: 17 }}
                  strokeWidth={active ? 2.2 : 1.5} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? C.amber : C.muted, letterSpacing: ".03em" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
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