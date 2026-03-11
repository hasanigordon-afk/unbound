import React, { useState } from "react";
import { Sparkles, BookOpen, Play, Music, Headphones, Wind, Heart, Sun, Menu, X, Brain } from "lucide-react";
import MeditationSection from "../components/cravingcontrol/MeditationSection.jsx";
import JournalSection from "../components/cravingcontrol/JournalSection.jsx";
import VideosSection from "../components/cravingcontrol/VideosSection.jsx";
import MusicSection from "../components/cravingcontrol/MusicSection.jsx";
import BinauralBeatsSection from "../components/cravingcontrol/BinauralBeatsSection.jsx";
import BreathingResetSection from "../components/cravingcontrol/BreathingResetSection.jsx";
import EmergencyCalmSection from "../components/cravingcontrol/EmergencyCalmSection.jsx";
import MotivationBoostSection from "../components/cravingcontrol/MotivationBoostSection.jsx";

const NAV_ITEMS = [
  { id: "emergency", label: "Emergency Calm", icon: Heart, color: "#DC2626", activeBg: "#FEF2F2", badge: "SOS" },
  { id: "breathing", label: "Breathing Reset", icon: Wind, color: "#2E7D5E", activeBg: "#E8F5E9" },
  { id: "meditation", label: "Meditation", icon: Sparkles, color: "#4F46E5", activeBg: "#EEF2FF" },
  { id: "journal", label: "Journal", icon: BookOpen, color: "#92400E", activeBg: "#FEF3C7" },
  { id: "videos", label: "Videos", icon: Play, color: "#1D4ED8", activeBg: "#EFF6FF" },
  { id: "music", label: "Music", icon: Music, color: "#7C3AED", activeBg: "#F5F3FF" },
  { id: "binaural", label: "Binaural Beats", icon: Headphones, color: "#0F766E", activeBg: "#F0FDFA" },
  { id: "motivation", label: "Motivation Boost", icon: Sun, color: "#B45309", activeBg: "#FFFBEB" },
];

const SECTION_MAP = {
  emergency: EmergencyCalmSection,
  breathing: BreathingResetSection,
  meditation: MeditationSection,
  journal: JournalSection,
  videos: VideosSection,
  music: MusicSection,
  binaural: BinauralBeatsSection,
  motivation: MotivationBoostSection,
};

function SidebarContent({ active, onSelect }) {
  return (
    <div style={{ padding: "20px 12px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 4px 18px", borderBottom: "1px solid #D4EAE1" }}>
        <div style={{ background: "#E8F5E9", borderRadius: 10, padding: 8 }}>
          <Brain className="w-5 h-5" style={{ color: "#2E7D5E" }} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 13, color: "#1A3C2E", lineHeight: 1.3 }}>Craving Control</p>
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Center</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                background: isActive ? item.activeBg : "transparent",
                width: "100%", textAlign: "left",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: isActive ? item.color : "#EDF5F0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon className="w-4 h-4" style={{ color: isActive ? "#FFF" : "#5A7A6A" }} strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? item.color : "#3D5449", lineHeight: 1.2, flex: 1 }}>
                {item.label}
              </span>
              {item.badge && !isActive && (
                <span style={{ background: "#DC2626", color: "#FFF", fontSize: 8, fontWeight: 800, borderRadius: 5, padding: "2px 5px" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: "16px 4px 0", borderTop: "1px solid #D4EAE1" }}>
        <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.5 }}>
          🔒 This space is private and secure. Everything here is just for you.
        </p>
      </div>
    </div>
  );
}

export default function CravingControlCenter() {
  const [active, setActive] = useState("emergency");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveSection = SECTION_MAP[active];

  const handleSelect = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F7F4" }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: 220, background: "#FFFFFF", borderRight: "1px solid #D4EAE1",
        flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        display: "none",
      }} className="md-sidebar">
        <SidebarContent active={active} onSelect={handleSelect} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <aside style={{
            position: "relative", width: 260, background: "#FFF", height: "100%",
            zIndex: 51, overflowY: "auto", boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          }}>
            <SidebarContent active={active} onSelect={handleSelect} />
          </aside>
          <button onClick={() => setSidebarOpen(false)} style={{
            position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.9)",
            border: "none", borderRadius: "50%", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <X className="w-4 h-4" style={{ color: "#1A3C2E" }} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile header */}
        <div style={{
          background: "#FFF", borderBottom: "1px solid #D4EAE1",
          padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
          position: "sticky", top: 0, zIndex: 30,
        }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Menu className="w-5 h-5" style={{ color: "#2E7D5E" }} />
          </button>
          <Brain className="w-5 h-5" style={{ color: "#2E7D5E" }} strokeWidth={1.8} />
          <p style={{ fontWeight: 800, fontSize: 15, color: "#1A3C2E" }}>Craving Control Center</p>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: NAV_ITEMS.find(n => n.id === active)?.color, background: NAV_ITEMS.find(n => n.id === active)?.activeBg, borderRadius: 8, padding: "3px 10px" }}>
              {NAV_ITEMS.find(n => n.id === active)?.label}
            </span>
          </div>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .md-sidebar { display: flex !important; flex-direction: column; }
            .mobile-header { display: none !important; }
          }
        `}</style>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}