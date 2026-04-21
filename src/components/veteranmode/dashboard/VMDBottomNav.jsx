import React from "react";
import { Home, MapPin, CheckCircle2, Users, User } from "lucide-react";
import { VM } from "../vmData";

const TABS = [
  { key: "home",      label: "Home",      icon: Home },
  { key: "resources", label: "Resources", icon: MapPin },
  { key: "checkin",   label: "Check-In",  icon: CheckCircle2 },
  { key: "community", label: "Community", icon: Users },
  { key: "profile",   label: "Profile",   icon: User },
];

export default function VMDBottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(18,20,15,0.97)", borderTop: `1px solid ${VM.border}`,
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const sel = active === t.key;
          return (
            <button key={t.key} onClick={() => onChange(t.key)} style={{
              flex: 1, padding: "10px 4px", background: "none", border: "none",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              color: sel ? VM.olive : VM.dim, fontFamily: "inherit",
            }}>
              <div style={{
                padding: "5px 14px", borderRadius: 10,
                background: sel ? VM.oliveSoft : "transparent",
                transition: "all 0.15s ease",
              }}>
                <Icon style={{ width: 18, height: 18 }} strokeWidth={sel ? 2 : 1.5} />
              </div>
              <span style={{ fontSize: 10, fontWeight: sel ? 700 : 500, letterSpacing: ".03em" }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}