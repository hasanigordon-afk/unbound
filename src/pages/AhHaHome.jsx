import React from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Sparkles, LifeBuoy, ArrowRight } from "lucide-react";

const C = {
  bg:        "#0E0D0C",
  surface:   "#1A1817",
  border:    "#2E2A28",
  text:      "#F5EFE6",
  muted:     "#B5A99A",
  dim:       "#7A7066",
  amber:     "#D4975A",
  amberSoft: "rgba(212,151,90,0.12)",
  green:     "#8FB391",
  blue:      "#8FA5B3",
};

const ACTIONS = [
  { icon: CalendarCheck, label: "Daily Check-In", sub: "Take a moment for yourself",       to: "/DailyCheckIn", color: C.amber },
  { icon: Sparkles,      label: "Ah Ha Stories",  sub: "Read moments that changed lives",  to: "/AhHaCommunity", color: C.green },
  { icon: LifeBuoy,      label: "Find Support",    sub: "Connect with people and resources", to: "/HelpHub", color: C.blue },
];

export default function AhHaHome() {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      padding: "64px 24px 40px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 12 }}>
          Ah Ha App
        </p>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 30, fontWeight: 500, lineHeight: 1.2, color: C.text, marginBottom: 8 }}>
          Welcome home.
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 36 }}>
          One moment at a time. Where would you like to start?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.to} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "18px 18px", borderRadius: 16,
                  background: C.surface, border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer", transition: "transform .15s ease",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${a.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon style={{ width: 20, height: 20, color: a.color }} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{a.label}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{a.sub}</p>
                  </div>
                  <ArrowRight style={{ width: 16, height: 16, color: C.dim }} />
                </div>
              </Link>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 40, lineHeight: 1.6 }}>
          In crisis? Call <a href="tel:988" style={{ color: C.amber, textDecoration: "none", fontWeight: 700 }}>988</a> — always available.
        </p>
      </div>
    </div>
  );
}