import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin, MessageCircle, CalendarCheck, BookOpen,
  Shield, Briefcase, AlertTriangle, Users,
} from "lucide-react";

const ACTIONS = [
  { icon: MapPin,         label: "Resources",  to: "/RecoveryHub",        accent: "var(--accent)" },
  { icon: MessageCircle,  label: "AI Mentor",  to: "/SuperAgent",         accent: "var(--purple)" },
  { icon: CalendarCheck,  label: "Check-In",   to: "/DailyCheckIn",       accent: "var(--green)" },
  { icon: BookOpen,       label: "Journal",    to: "/Journal",            accent: "var(--gold)" },
  { icon: Shield,         label: "Veterans",   to: "/VeteranSupportHub",  accent: "var(--accent)" },
  { icon: Briefcase,      label: "Re-entry",   to: "/RecoveryPath",       accent: "var(--purple)" },
  { icon: AlertTriangle,  label: "Emergency",  to: "/Lifeline",           accent: "var(--red)" },
  { icon: Users,          label: "Community",  to: "/AhHaCommunity",      accent: "var(--green)" },
];

export default function DashQuickActions() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {ACTIONS.map((a, i) => (
        <Link key={a.label} to={a.to} style={{ textDecoration: "none" }}>
          <div className="dash-quick" style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "16px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            backdropFilter: "blur(16px) saturate(160%)",
            WebkitBackdropFilter: "blur(16px) saturate(160%)",
            boxShadow: "var(--shadow-card)",
            transition: "transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s, border-color .2s",
            cursor: "pointer",
            animation: `dashCardFloat 7s ease-in-out infinite ${i * 0.15}s`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.borderColor = "var(--border-glow)";
            e.currentTarget.style.boxShadow = `0 0 22px ${a.accent}, var(--shadow-card)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "var(--shadow-card)";
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: a.accent,
              boxShadow: `0 0 14px ${a.accent}`,
            }}>
              <a.icon style={{ width: 17, height: 17 }} strokeWidth={1.8} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, color: "var(--text)",
              textAlign: "center", lineHeight: 1.2,
              fontFamily: "'DM Sans', sans-serif",
            }}>{a.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}