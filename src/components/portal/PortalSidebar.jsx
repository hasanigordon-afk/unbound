import React from "react";
import { LayoutDashboard, Users, MessageSquare, Bell, FileText, TrendingUp, BookOpen, Settings, X, Activity } from "lucide-react";

const NAV = [
  { id: "dashboard",      label: "Dashboard",     icon: LayoutDashboard },
  { id: "clients",        label: "My Clients",    icon: Users },
  { id: "craving_alerts", label: "Risk Monitor",  icon: Activity },
  { id: "messages",       label: "Messages",      icon: MessageSquare },
  { id: "alerts",         label: "Alerts",        icon: Bell },
  { id: "notes",          label: "Notes",         icon: FileText },
  { id: "progress",       label: "Progress",      icon: TrendingUp },
  { id: "resources",      label: "Resources",     icon: BookOpen },
  { id: "settings",       label: "Settings",      icon: Settings },
];

const ROLE_LABELS = {
  counselor: "Counselor",
  sponsor: "Sponsor",
  case_manager: "Case Manager",
  administrator: "Administrator",
  probation_officer: "Probation Officer",
};

export default function PortalSidebar({ activeSection, onNavigate, counselorProfile, user, alertCount, clientCount, isOpen, onClose }) {
  const roleLabel = ROLE_LABELS[counselorProfile?.role_type] || "Professional";
  const initials = (user?.full_name || user?.email || "U").slice(0, 2).toUpperCase();
  const facilityName = counselorProfile?.facility_name || "My Organization";

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0F172A" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#94A3B8", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
              Professional Portal
            </p>
            <p style={{ color: "#F1F5F9", fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{facilityName}</p>
          </div>
          <button onClick={onClose} className="lg:hidden"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id || (activeSection === "client_profile" && id === "clients");
          const badgeCount = id === "alerts" ? alertCount : id === "clients" ? clientCount : 0;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "11px 20px", border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "rgba(59,130,246,0.15)" : "none",
                borderLeft: isActive ? "3px solid #3B82F6" : "3px solid transparent",
                transition: "background 0.15s",
              }}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0"
                style={{ color: isActive ? "#60A5FA" : "#94A3B8" }} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#F1F5F9" : "#94A3B8" }}>
                {label}
              </span>
              {badgeCount > 0 && (
                <span style={{
                  background: id === "alerts" ? "#EF4444" : "#3B82F6",
                  color: "#FFF", borderRadius: 20, padding: "2px 7px",
                  fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: "center",
                }}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#FFF", fontWeight: 700, fontSize: 13 }}>{initials}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.full_name || user?.email?.split("@")[0]}
          </p>
          <p style={{ color: "#64748B", fontSize: 11, marginTop: 1 }}>{roleLabel}</p>
        </div>
      </div>
    </div>
  );

  return (
    <aside style={{ width: 240, flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <SidebarContent />
    </aside>
  );
}