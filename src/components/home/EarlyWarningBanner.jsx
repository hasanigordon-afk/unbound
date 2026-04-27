import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { calcEarlyWarningScore } from "@/components/aftercare/engagementScore";

const INTERVENTIONS = {
  "High Risk": [
    { icon: "📅", label: "Check In Now",         sub: "Takes 30 seconds",                    href: "DailyCheckIn"          },
    { icon: "🤝", label: "Find a Meeting",        sub: "AA · NA · SMART near you",            href: "Meetings"              },
    { icon: "🫁", label: "Craving Control",       sub: "Grounding & breathing tools",         href: "CravingControlCenter"  },
    { icon: "💬", label: "Message a Mentor",      sub: "Reach out for support",               href: "ParticipantMessages"   },
    { icon: "🌿", label: "Post in Community",     sub: "You're not alone in this",            href: "VoicesOfRecovery"      },
  ],
  "Moderate Risk": [
    { icon: "📅", label: "Log Today's Check-In",  sub: "Stay on track",                       href: "DailyCheckIn"          },
    { icon: "🤝", label: "Attend a Meeting",       sub: "Find one near you",                   href: "Meetings"              },
    { icon: "💬", label: "Connect with Mentor",   sub: "A quick message can help",            href: "ParticipantMessages"   },
    { icon: "📓", label: "Write in Your Journal", sub: "Process what you're feeling",         href: "Journal"               },
  ],
};

const MESSAGES = {
  "High Risk": {
    headline: "Let's check in together.",
    body: "Your engagement has dropped. That's okay — we're here. Take one small step right now.",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
  },
  "Moderate Risk": {
    headline: "You've been quieter lately.",
    body: "Staying connected is one of the most powerful things you can do. Here's how to reconnect.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
  },
};

export default function EarlyWarningBanner({ checkIns = [], journalCount = 0, communityPostCount = 0, cravingPostCount = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const { score, level, color } = calcEarlyWarningScore({
    checkIns,
    journalCount,
    communityPostCount,
    cravingPostCount,
  });

  if (dismissed || level === "Low Risk") return null;

  const msg = MESSAGES[level];
  const actions = INTERVENTIONS[level] || INTERVENTIONS["Moderate Risk"];

  return (
    <div style={{
      background: msg.bg,
      border: `1px solid ${msg.border}`,
      borderRadius: 20,
      marginBottom: 20,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AlertTriangle style={{ width: 18, height: 18, color }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1F2933", lineHeight: 1.25 }}>{msg.headline}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <div style={{ height: 4, width: 60, borderRadius: 2, background: "rgba(31,41,51,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 11, color, fontWeight: 700 }}>{level} · {score}/100</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 2 }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
          {expanded
            ? <ChevronUp style={{ width: 14, height: 14, color: "#6B7280" }} />
            : <ChevronDown style={{ width: 14, height: 14, color: "#6B7280" }} />
          }
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ fontSize: 13, color: "#4A5763", lineHeight: 1.6, marginBottom: 14 }}>
            {msg.body}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map(a => (
              <Link key={a.label} to={createPageUrl(a.href)} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: "#FFFFFF", border: "1px solid #E5EEF1",
                  borderRadius: 16,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1F2933" }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{a.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}