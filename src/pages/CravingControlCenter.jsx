import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wind, BookOpen, Video, Music, Waves, Zap, AlertCircle, Sparkles, Menu, X
} from "lucide-react";
import CccMeditation from "../components/ccc/CccMeditation";
import CccJournal from "../components/ccc/CccJournal";
import CccVideos from "../components/ccc/CccVideos";
import CccMusic from "../components/ccc/CccMusic";
import CccBinaural from "../components/ccc/CccBinaural";
import CccBreathing from "../components/ccc/CccBreathing";
import CccEmergencyCalm from "../components/ccc/CccEmergencyCalm";
import CccMotivation from "../components/ccc/CccMotivation";

const NAV_ITEMS = [
  { id: "meditation",    label: "Meditation",      icon: Wind },
  { id: "journal",       label: "Journal",          icon: BookOpen },
  { id: "videos",        label: "Videos",           icon: Video },
  { id: "music",         label: "Music",            icon: Music },
  { id: "binaural",      label: "Binaural Beats",   icon: Waves },
  { id: "breathing",     label: "Breathing Reset",  icon: Zap },
  { id: "emergency",     label: "Emergency Calm",   icon: AlertCircle },
  { id: "motivation",    label: "Motivation Boost", icon: Sparkles },
];

const SECTION_MAP = {
  meditation: CccMeditation,
  journal: CccJournal,
  videos: CccVideos,
  music: CccMusic,
  binaural: CccBinaural,
  breathing: CccBreathing,
  emergency: CccEmergencyCalm,
  motivation: CccMotivation,
};

export default function CravingControlCenter() {
  const [active, setActive] = useState("emergency");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: profiles = [] } = useQuery({
    queryKey: ["member-profile-ccc", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });
  const { data: checkIns = [] } = useQuery({
    queryKey: ["checkins-ccc", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const profile = profiles[0];
  const ActiveSection = SECTION_MAP[active];

  const handleNav = (id) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4F8", fontFamily: "var(--font-sans, system-ui)" }}>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1B3A5C 0%, #1E4A72 100%)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        position: "fixed",
        top: 0,
        bottom: 0,
        left: mobileOpen ? 0 : undefined,
        transform: typeof window !== "undefined" && window.innerWidth < 768
          ? mobileOpen ? "translateX(0)" : "translateX(-100%)"
          : "none",
        transition: "transform 0.25s ease",
        overflowY: "auto",
      }}
      className="ccc-sidebar"
      >
        {/* Logo area */}
        <div style={{ padding: "24px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
            Craving
          </p>
          <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>Control Center</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>Your calm toolkit</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            const isEmergency = id === "emergency";
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  marginBottom: isEmergency ? 4 : 2,
                  borderRadius: 10,
                  border: isEmergency ? "1px solid rgba(248,113,113,0.4)" : "none",
                  background: isActive
                    ? "rgba(255,255,255,0.15)"
                    : isEmergency
                    ? "rgba(239,68,68,0.15)"
                    : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "#7DD3FC" : isEmergency ? "#FCA5A5" : "rgba(255,255,255,0.6)" }}
                  strokeWidth={1.75}
                />
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#FFFFFF" : isEmergency ? "#FCA5A5" : "rgba(255,255,255,0.7)",
                  lineHeight: 1.3,
                }}>
                  {label}
                </span>
                {isActive && (
                  <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#7DD3FC" }} />
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 18px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textAlign: "center", lineHeight: 1.5 }}>
            You are not alone.{"\n"}One breath at a time.
          </p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="ccc-main">

        {/* Mobile header */}
        <div className="ccc-mobile-header" style={{ display: "none", alignItems: "center", gap: 12, padding: "14px 16px", background: "#1B3A5C", position: "sticky", top: 0, zIndex: 30 }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FFFFFF", padding: 4 }}>
            <Menu className="w-5 h-5" />
          </button>
          <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15, margin: 0 }}>
            {NAV_ITEMS.find(n => n.id === active)?.label}
          </p>
        </div>

        <div style={{ flex: 1, padding: "28px 24px", maxWidth: 740, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <ActiveSection user={user} profile={profile} checkIns={checkIns} />
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .ccc-sidebar {
            position: fixed !important;
            width: 240px !important;
          }
          .ccc-main {
            margin-left: 0 !important;
          }
          .ccc-mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}