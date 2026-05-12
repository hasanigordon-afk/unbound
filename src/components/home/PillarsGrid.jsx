import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Hammer, Users, Sprout, ArrowRight } from "lucide-react";

const PILLARS = [
  {
    key: "recovery-support",
    label: "Recovery & Support",
    icon: HeartPulse,
    accent: "var(--accent)",
    desc: "Daily recovery tools, crisis support, meetings, accountability, and AI guidance.",
    to: "/DailyHub",
  },
  {
    key: "reentry-stabilization",
    label: "Reentry & Stability",
    icon: Hammer,
    accent: "var(--gold)",
    desc: "Housing, food, work, legal help, veteran support, and stability resources.",
    to: "/RebuildHub",
  },
  {
    key: "community-mentorship",
    label: "Community & Mentorship",
    icon: Users,
    accent: "var(--purple)",
    desc: "Stories, testimonials, peer connection, mentorship, and comeback media.",
    to: "/StoriesHub",
  },
  {
    key: "growth-future",
    label: "Growth & Future Building",
    icon: Sprout,
    accent: "var(--green)",
    desc: "Wellness, learning, fitness, nutrition, planning, and future-self tools.",
    to: "/GrowthHub",
  },
];

export default function PillarsGrid() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
    }}>
      {PILLARS.map((p, i) => {
        const Icon = p.icon;
        return (
          <Link
            key={p.key}
            to={p.to}
            className="fade-up"
            style={{
              position: "relative",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "16px 14px",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              animationDelay: `${i * 0.06}s`,
              cursor: "pointer",
              overflow: "hidden",
              textDecoration: "none",
              transition: "all .2s",
              display: "block",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = p.accent;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 0 22px ${p.accent}33`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Arrow indicator */}
            <ArrowRight style={{
              position: "absolute", top: 12, right: 12,
              width: 14, height: 14, color: p.accent, opacity: 0.7,
            }} />

            {/* Glow accent */}
            <div aria-hidden style={{
              position: "absolute", top: -30, left: -30, width: 100, height: 100,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${p.accent} 0%, transparent 70%)`,
              opacity: 0.18, filter: "blur(20px)", pointerEvents: "none",
            }} />

            <div style={{
              position: "relative",
              width: 38, height: 38, borderRadius: 12,
              background: "var(--surface)",
              border: `1px solid ${p.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: p.accent, marginBottom: 10,
              boxShadow: `0 0 14px ${p.accent}33`,
            }}>
              <Icon style={{ width: 18, height: 18 }} strokeWidth={2.2} />
            </div>

            <p style={{
              position: "relative",
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 16, fontWeight: 600, color: "var(--text)",
              marginBottom: 4,
            }}>
              {p.label}
            </p>
            <p style={{
              position: "relative",
              fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.45,
            }}>
              {p.desc}
            </p>
          </Link>
        );
      })}
    </div>
  );
}