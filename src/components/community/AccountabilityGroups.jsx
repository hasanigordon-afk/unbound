import React from "react";

const GROUPS = [
  { id: "7day_checkin",    name: "7-Day Check-In",         emoji: "🔥", color: "#FB923C", members: "Active daily", desc: "Stay accountable with daily check-ins" },
  { id: "early_recovery",  name: "Early Recovery",          emoji: "🌱", color: "#10B981", members: "First 90 days", desc: "Support for those just starting out" },
  { id: "mens_recovery",   name: "Men's Recovery",          emoji: "💪", color: "#60A5FA", members: "Men only", desc: "A safe space for men in recovery" },
  { id: "womens_recovery", name: "Women's Recovery",        emoji: "🌸", color: "#F472B6", members: "Women only", desc: "A safe space for women in recovery" },
  { id: "reentry",         name: "Reentry Support",         emoji: "🗺️", color: "#818CF8", members: "Reentry focus", desc: "Housing, jobs, and rebuilding life" },
  { id: "employment",      name: "Employment & Stability",  emoji: "💼", color: "#C9A96E", members: "Career focused", desc: "Jobs, finances, and stability" },
  { id: "parents",         name: "Parents in Recovery",     emoji: "👨‍👧", color: "#34D399", members: "Parents", desc: "Parenting and recovery together" },
];

export default function AccountabilityGroups({ onSelectGroup, activeGroup }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
        Accountability Groups
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(activeGroup === group.id ? null : group.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 14, textAlign: "left",
              background: activeGroup === group.id ? `${group.color}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeGroup === group.id ? `${group.color}45` : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer", width: "100%",
              boxShadow: activeGroup === group.id ? `0 0 18px ${group.color}15` : "none",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: `${group.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              {group.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: activeGroup === group.id ? group.color : "#fff", marginBottom: 2 }}>
                {group.name}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {group.desc}
              </p>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: activeGroup === group.id ? group.color : "rgba(255,255,255,0.15)",
              flexShrink: 0,
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}