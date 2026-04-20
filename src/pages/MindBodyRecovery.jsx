import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Dumbbell, Apple, Timer, TrendingUp, Loader2, Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import DailyFlowTab from "@/components/mindbody/DailyFlowTab";
import FitnessTab from "@/components/mindbody/FitnessTab";
import NutritionTab from "@/components/mindbody/NutritionTab";
import FastingTab from "@/components/mindbody/FastingTab";
import ProgressTab from "@/components/mindbody/ProgressTab";
import MoodPrompt from "@/components/mindbody/MoodPrompt";

const TABS = [
  { key: "flow",      label: "Daily",     icon: Home },
  { key: "fitness",   label: "Fitness",   icon: Dumbbell },
  { key: "nutrition", label: "Nutrition", icon: Apple },
  { key: "fasting",   label: "Fasting",   icon: Timer },
  { key: "progress",  label: "Progress",  icon: TrendingUp },
];

const today = () => new Date().toISOString().split("T")[0];

function computeStreak(logs) {
  const sorted = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
  let n = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const l of sorted) {
    const hasAction = l.moved_body || l.ate_clean || l.hydrated || l.fasting_goal_met || l.mental_checkin;
    if (!hasAction) continue;
    const d = new Date(l.log_date); d.setHours(0, 0, 0, 0);
    const diff = Math.round((cur - d) / 86400000);
    if (diff <= 1) { n++; cur = d; } else break;
  }
  return n;
}

export default function MindBodyRecovery() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("flow");
  const [moodOpen, setMoodOpen] = useState(false);

  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: logs = [], isLoading: lL } = useQuery({
    queryKey: ["mindbody-logs", user?.email],
    queryFn: () => base44.entities.MindBodyLog.filter({ user_email: user.email }, "-log_date", 60),
    enabled: !!user?.email,
  });

  const { data: fastingActive } = useQuery({
    queryKey: ["fasting-active", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.FastingSession.filter({ user_email: user.email, status: "active" }, "-started_at", 1);
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const todayLog = useMemo(
    () => logs.find(l => l.log_date === today()) || null,
    [logs]
  );
  const streak = useMemo(() => computeStreak(logs), [logs]);

  // Helper: ensure today's log exists, then patch it
  const upsertTodayLog = async (patch) => {
    if (todayLog) {
      return base44.entities.MindBodyLog.update(todayLog.id, patch);
    }
    return base44.entities.MindBodyLog.create({
      user_email: user.email,
      log_date: today(),
      ...patch,
    });
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ key, value }) => upsertTodayLog({ [key]: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mindbody-logs"] }),
  });

  const workoutMutation = useMutation({
    mutationFn: async (workout) => {
      const existing = todayLog?.workouts_completed || [];
      return upsertTodayLog({
        workouts_completed: [...existing, workout],
        moved_body: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mindbody-logs"] }),
  });

  const mealMutation = useMutation({
    mutationFn: async (meal) => {
      const existing = todayLog?.meals_logged || [];
      return upsertTodayLog({
        meals_logged: [...existing, meal],
        ate_clean: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mindbody-logs"] }),
  });

  const startFastMutation = useMutation({
    mutationFn: async ({ plan, target_hours }) =>
      base44.entities.FastingSession.create({
        user_email: user.email,
        plan,
        target_hours,
        started_at: new Date().toISOString(),
        status: "active",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fasting-active"] }),
  });

  const stopFastMutation = useMutation({
    mutationFn: async ({ completedHours, goalMet }) => {
      await base44.entities.FastingSession.update(fastingActive.id, {
        ended_at: new Date().toISOString(),
        completed_hours: completedHours,
        status: "completed",
      });
      if (goalMet) {
        await upsertTodayLog({ fasting_goal_met: true });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fasting-active"] });
      qc.invalidateQueries({ queryKey: ["mindbody-logs"] });
    },
  });

  const moodMutation = useMutation({
    mutationFn: async (rating) => upsertTodayLog({ post_activity_mood: rating, mental_checkin: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mindbody-logs"] }),
  });

  if (uL || lL) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: "#B8823A" }} className="animate-spin" />
      </div>
    );
  }

  const saving = toggleMutation.isPending || workoutMutation.isPending || mealMutation.isPending
    || startFastMutation.isPending || stopFastMutation.isPending;

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "48px 20px 16px", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#4A3F35", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            Mind-Body Recovery
          </p>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 600, color: "#1C1410", lineHeight: 1.2 }}>
            Move. Fuel. Reset.
          </h1>

          {/* 90-Day Reset banner */}
          <Link to="/NinetyDayReset" style={{ textDecoration: "none", display: "block", marginTop: 16 }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(184,130,58,.10), rgba(155,138,184,.05))",
              border: "1px solid rgba(184,130,58,.3)",
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Target style={{ width: 18, height: 18, color: "#B8823A", flexShrink: 0 }} strokeWidth={1.8} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1C1410" }}>90-Day Mind-Body Reset</p>
                <p style={{ fontSize: 11, color: "#9B8E83" }}>Guided 3-phase program →</p>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: "#B8823A", flexShrink: 0 }} />
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{
          background: "#FDFAF6", borderBottom: "1px solid #E8E2D9",
          padding: "8px 12px", display: "flex", gap: 4,
          overflowX: "auto", position: "sticky", top: 0, zIndex: 10,
          scrollbarWidth: "none",
        }}>
          {TABS.map(t => {
            const sel = tab === t.key;
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                background: sel ? "#B8823A" : "transparent",
                color: sel ? "#fff" : "#4A3F35",
                fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <Icon style={{ width: 13, height: 13 }} strokeWidth={2} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {tab === "flow" && (
          <DailyFlowTab
            log={todayLog}
            streak={streak}
            onToggle={(key, value) => toggleMutation.mutate({ key, value })}
          />
        )}
        {tab === "fitness" && (
          <FitnessTab
            onLogWorkout={(w) => workoutMutation.mutateAsync(w)}
            askMood={() => setMoodOpen(true)}
            saving={saving}
          />
        )}
        {tab === "nutrition" && (
          <NutritionTab
            onLogMeal={(m) => mealMutation.mutateAsync(m)}
            askMood={() => setMoodOpen(true)}
            saving={saving}
          />
        )}
        {tab === "fasting" && (
          <FastingTab
            activeSession={fastingActive}
            onStart={(opts) => startFastMutation.mutate(opts)}
            onStop={(completedHours, goalMet) => stopFastMutation.mutate({ completedHours, goalMet })}
            saving={saving}
          />
        )}
        {tab === "progress" && <ProgressTab logs={logs} streak={streak} />}
      </div>

      {moodOpen && (
        <MoodPrompt
          onSelect={(rating) => {
            moodMutation.mutate(rating);
            setMoodOpen(false);
          }}
          onClose={() => setMoodOpen(false)}
        />
      )}
    </div>
  );
}