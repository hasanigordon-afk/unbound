import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, UtensilsCrossed, Home, Bus, Briefcase, Shield, ArrowRight } from "lucide-react";

const RES = [
  { icon: Users,           label: "Meetings",       to: "/MeetingDirectory",     accent: "var(--accent)" },
  { icon: UtensilsCrossed, label: "Food",           to: "/RecoveryHub?cat=food", accent: "var(--green)" },
  { icon: Home,            label: "Shelter",        to: "/NJHousingSearch",      accent: "var(--gold)" },
  { icon: Bus,             label: "Transport",      to: "/RecoveryHub",          accent: "var(--purple)" },
  { icon: Briefcase,       label: "Jobs",           to: "/EmploymentOpportunities", accent: "var(--accent)" },
  { icon: Shield,          label: "Veteran Support",to: "/VeteranSupportHub",    accent: "var(--accent)" },
];

export default function DashResourceSnapshot() {
  return (
    <div className="fade-up" style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      padding: "20px",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <MapPin style={{ width: 14, height: 14, color: "var(--accent)" }} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--accent)",
            letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>
            Resource Snapshot
          </span>
        </div>
        <Link to="/RecoveryHub" style={{
          fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
        }}>
          View all <ArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>

      {/* Animated mini map preview */}
      <Link to="/VeteranResourceMap" style={{ textDecoration: "none" }}>
        <div style={{
          position: "relative", height: 100, borderRadius: 16, overflow: "hidden",
          marginBottom: 14, cursor: "pointer",
          background: `
            radial-gradient(circle at 30% 40%, var(--ambient-1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, var(--ambient-2) 0%, transparent 50%),
            linear-gradient(135deg, var(--bg-2), var(--card-solid))
          `,
          border: "1px solid var(--border-glow)",
        }}>
          {/* Grid overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(91,141,239,0.10) 1px, transparent 1px),
              linear-gradient(90deg, rgba(91,141,239,0.10) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            opacity: 0.6,
          }} />
          {/* Animated pins */}
          {[
            { left: "20%", top: "30%", color: "var(--accent)", delay: "0s" },
            { left: "55%", top: "55%", color: "var(--green)",  delay: ".5s" },
            { left: "78%", top: "35%", color: "var(--gold)",   delay: "1s" },
            { left: "40%", top: "70%", color: "var(--purple)", delay: "1.5s" },
          ].map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.left, top: p.top }}>
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                background: p.color, opacity: 0.4, filter: "blur(4px)",
                animation: `pinPulse 2.4s ease-in-out infinite`,
                animationDelay: p.delay,
              }} />
              <div style={{
                position: "relative",
                width: 10, height: 10, borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }} />
            </div>
          ))}
          <div style={{
            position: "absolute", bottom: 8, left: 12,
            fontSize: 10.5, fontWeight: 700, color: "var(--text)",
            letterSpacing: ".15em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>
            Tap to open map →
          </div>
          <style>{`
            @keyframes pinPulse {
              0%,100% { transform: scale(.9); opacity: .35; }
              50%     { transform: scale(1.6); opacity: .75; }
            }
          `}</style>
        </div>
      </Link>

      {/* Category grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {RES.map(r => (
          <Link key={r.label} to={r.to} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "12px 10px", borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              transition: "all .18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-glow)"; e.currentTarget.style.boxShadow = `0 0 14px ${r.accent}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
              <r.icon style={{ width: 16, height: 16, color: r.accent }} strokeWidth={1.8} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", textAlign: "center" }}>{r.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}