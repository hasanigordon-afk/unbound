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
  { id: "emergency",     label: "Emergency Calm",   icon: AlertCircle },
  { id: "breathing",     label: "Breathing Reset",  icon: Zap },
  { id: "meditation",    label: "Meditation",       icon: Wind },
  { id: "journal",       label: "Journal",          icon: BookOpen },
  { id: "motivation",    label: "Motivation Boost", icon: Sparkles },
  { id: "music",         label: "Music",            icon: Music },
  { id: "binaural",      label: "Binaural Beats",   icon: Waves },
  { id: "videos",        label: "Videos",           icon: Video },
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

  const SidebarContent = () => (
    <>
      <div style={{ padding: "24px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          Craving
        </p>
        <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>Control Center</p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>Your calm toolkit</p>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
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
                padding: "11px 12px",
                marginBottom: isEmergency ? 6 : 2,
                borderRadius: 10,
                border: isEmergency && !isActive ? "1px solid rgba(248,113,113,0.35)" : "none",
                background: isActive
                  ? "rgba(255,255,255,0.15)"
                  : isEmergency
                  ? "rgba(239,68,68,0.12)"
                  : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  color: isActive ? "#7DD3FC" : isEmergency ? "#FCA5A5" : "rgba(255,255,255,0.6)",
                }}
                strokeWidth={1.75}
              />
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#FFFFFF" : isEmergency ? "#FCA5A5" : "rgba(255,255,255,0.75)",
                lineHeight: 1.3,
              }}>
                {label}
              </span>
              {isActive && (
                <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#7DD3FC", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 18px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textAlign: "center", lineHeight: 1.6 }}>
          You are not alone.<br />One breath at a time.
        </p>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4F8", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }}
        />
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="ccc-desktop-sidebar" style={{
        width: 220,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1B3A5C 0%, #1E4A72 100%)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "hidden",
      }}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <aside className="ccc-mobile-sidebar" style={{
        width: 240,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        background: "linear-gradient(180deg, #1B3A5C 0%, #1E4A72 100%)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 14px 0" }}>
          <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "auto" }}>

        {/* Mobile header */}
        <div className="ccc-mobile-header" style={{
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "#1B3A5C",
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FFFFFF", padding: 4 }}>
            <Menu style={{ width: 20, height: 20 }} />
          </button>
          <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15, margin: 0, flex: 1 }}>
            {NAV_ITEMS.find(n => n.id === active)?.label}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>CCC</p>
        </div>

        <div style={{ flex: 1, padding: "28px 24px", maxWidth: 720, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <ActiveSection user={user} profile={profile} checkIns={checkIns} />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .ccc-mobile-header { display: none !important; }
          .ccc-mobile-sidebar { display: none !important; }
          .ccc-desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 767px) {
          .ccc-desktop-sidebar { display: none !important; }
          .ccc-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}