import React from "react";
import { Link } from "react-router-dom";
import { Flame, Target, MapPin, TrendingUp, LifeBuoy, Users, Settings, Check } from "lucide-react";
import { VM, getTodaysObjective, BRANCHES } from "./vmData";

const MOODS = [
  { value: 1, emoji: "😔" },
  { value: 2, emoji: "😐" },
  { value: 3, emoji: "🙂" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "💪" },
];

const QUICK_ACTIONS = [
  { key: "resources", label: "Find Nearby Resources", icon: MapPin,    to: "/VeteransDashboard" },
  { key: "progress",  label: "Log Progress",           icon: TrendingUp, to: "/DailyCheckIn" },
  { key: "support",   label: "Reach Support",          icon: LifeBuoy,  to: "/HelpHub" },
  { key: "community", label: "Veteran Community",       icon: Users,     to: "/VeteransDashboard" },
];

export default function VMDashboard({
  profile, todayMission, streak,
  todayCheckinMood, onSetMood, onToggleObjective, onEditSettings,
}) {
  const branch = BRANCHES.find(b => b.key === profile.branch);
  const objective = todayMission?.mission_text || getTodaysObjective(profile.current_focus);
  const completed = !!todayMission?.mission_completed;

  return (
    <div style={{
      minHeight: "100vh", background: VM.bg, color: VM.text,
      padding: "48px 20px 40px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: VM.gold, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 6 }}>
              Mission Dashboard
            </p>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 500, color: VM.text, lineHeight: 1.2 }}>
              {branch ? `${branch.label} Vet` : "Welcome, Veteran"}
            </h1>
          </div>
          <button onClick={onEditSettings} style={{
            background: VM.surface, border: `1px solid ${VM.border}`,
            width: 36, height: 36, borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: VM.muted,
          }}>
            <Settings style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Streak */}
        <div style={{
          background: VM.surface, border: `1px solid ${VM.border}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: VM.oliveSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Flame style={{ width: 18, height: 18, color: VM.gold }} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".1em" }}>
              Streak
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: VM.text, lineHeight: 1.2 }}>
              {streak} {streak === 1 ? "day" : "days"} strong
            </p>
          </div>
        </div>

        {/* Daily Check-in — Mood */}
        <div style={{
          background: VM.surface, border: `1px solid ${VM.border}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 12,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Daily Check-In
          </p>
          <p style={{ fontSize: 13, color: VM.muted, marginBottom: 12 }}>How are you operating today?</p>
          <div style={{ display: "flex", gap: 6 }}>
            {MOODS.map(m => {
              const sel = todayCheckinMood === m.value;
              return (
                <button key={m.value} onClick={() => onSetMood(m.value)} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, cursor: "pointer",
                  background: sel ? VM.oliveSoft : "transparent",
                  border: `1px solid ${sel ? VM.olive : VM.border}`,
                  fontSize: 22, fontFamily: "inherit",
                }}>
                  {m.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Objective */}
        <div style={{
          background: completed ? VM.oliveSoft : VM.surface,
          border: `1px solid ${completed ? VM.olive : VM.border}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Target style={{ width: 14, height: 14, color: VM.gold }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".1em" }}>
              Today's Objective
            </p>
          </div>
          <p style={{ fontSize: 15, color: VM.text, lineHeight: 1.5, marginBottom: 12, fontWeight: 500 }}>
            {objective}
          </p>
          <button onClick={() => onToggleObjective(objective)} style={{
            width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer",
            background: completed ? VM.olive : "transparent",
            border: `1px solid ${completed ? VM.olive : VM.border}`,
            color: completed ? "#12140F" : VM.muted,
            fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {completed && <Check style={{ width: 14, height: 14 }} strokeWidth={3} />}
            {completed ? "Objective Complete" : "Mark Complete"}
          </button>
        </div>

        {/* Quick Access */}
        <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Quick Access
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.key} to={a.to} style={{ textDecoration: "none" }}>
                <div style={{
                  background: VM.surface, border: `1px solid ${VM.border}`, borderRadius: 12,
                  padding: "14px 14px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 10, minHeight: 82,
                }}>
                  <Icon style={{ width: 18, height: 18, color: VM.olive }} strokeWidth={1.8} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: VM.text, lineHeight: 1.3 }}>{a.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: VM.dim, lineHeight: 1.6, fontStyle: "italic" }}>
          Your data stays private. This app does not provide medical or clinical advice.
        </p>
      </div>
    </div>
  );
}