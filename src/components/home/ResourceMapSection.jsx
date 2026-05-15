import React from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Bus, Home, MapPin, Shield, ShoppingBasket, Users } from "lucide-react";

const resources = [
  ["Food", ShoppingBasket, "var(--green)"],
  ["Housing", Home, "var(--gold)"],
  ["Transportation", Bus, "var(--accent)"],
  ["Jobs", BriefcaseBusiness, "var(--purple)"],
  ["Veterans", Shield, "var(--gold)"],
  ["Meetings", Users, "var(--green)"],
];

export default function ResourceMapSection() {
  return (
    <section className="card" style={{ padding: "clamp(32px, 5vw, 54px)", marginBottom: 74 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, .85fr) minmax(320px, 1.15fr)", gap: 24, alignItems: "center" }}>
        <div>
          <p className="section-label">Interactive Resource Map</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>Find help by need, not by confusion.</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginTop: 12 }}>Tap a category to open organized local support across essentials, recovery, work, and veteran services.</p>
          <Link to="/RebuildHub" style={{ textDecoration: "none" }}><button className="btn-primary" style={{ marginTop: 22 }}>Open Resource Map</button></Link>
        </div>
        <div style={{ minHeight: 330, borderRadius: 30, position: "relative", overflow: "hidden", background: "radial-gradient(circle at 30% 30%, rgba(91,141,239,0.24), transparent 28%), radial-gradient(circle at 70% 60%, rgba(240,183,83,0.16), transparent 28%), rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
          {resources.map(([label, Icon, color], index) => (
            <Link key={label} to={label === "Meetings" ? "/MeetingDirectory" : label === "Veterans" ? "/VeteranSupportHub" : "/RebuildHub"} style={{ textDecoration: "none" }}>
              <div className="resource-pin" style={{ position: "absolute", left: `${18 + (index % 3) * 30}%`, top: `${22 + Math.floor(index / 3) * 42}%`, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 999, background: "rgba(7,10,20,0.78)", border: "1px solid var(--border)", color: "var(--text)", boxShadow: "var(--shadow-sm)", backdropFilter: "blur(14px)" }}>
                <Icon size={15} style={{ color }} />
                <span style={{ fontSize: 12, fontWeight: 900 }}>{label}</span>
              </div>
            </Link>
          ))}
          <MapPin size={70} style={{ position: "absolute", right: 30, bottom: 24, color: "rgba(255,255,255,0.10)" }} />
        </div>
      </div>
      <style>{`.resource-pin { transition: transform .22s, border-color .22s; } .resource-pin:hover { transform: translateY(-4px) scale(1.04); border-color: var(--border-glow) !important; } @media (max-width: 860px) { section [style*="grid-template-columns: minmax(0, .85fr)"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}