import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Home, LifeBuoy, Users, TrendingUp } from "lucide-react";
import { VM } from "../vmData";

const ACTIONS = [
  { key: "resources", icon: MapPin,     title: "Find Resources",  sub: "VA, food, housing", to: "/VeteransDashboard" },
  { key: "jobs",      icon: Briefcase,  title: "Jobs & Training", sub: "Veteran-friendly",  to: "/EmploymentOpportunities" },
  { key: "housing",   icon: Home,       title: "Housing Help",     sub: "Local programs",    to: "/HousingAssistance" },
  { key: "support",   icon: LifeBuoy,   title: "Talk to Support",  sub: "Peer & crisis",     to: "/HelpHub" },
  { key: "community", icon: Users,      title: "Community",         sub: "Brothers & sisters", to: "/VeteransDashboard" },
  { key: "progress",  icon: TrendingUp, title: "My Progress",       sub: "History & trends",  to: "/DailyCheckIn" },
];

export default function VMDQuickActions() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>
        Quick Access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.key} to={a.to} style={{ textDecoration: "none" }}>
              <div style={{
                background: VM.surface, border: `1px solid ${VM.border}`,
                borderRadius: 12, padding: "14px 14px", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 8, minHeight: 92,
              }}>
                <Icon style={{ width: 18, height: 18, color: VM.olive }} strokeWidth={1.8} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: VM.text, lineHeight: 1.3, marginBottom: 2 }}>
                    {a.title}
                  </p>
                  <p style={{ fontSize: 11, color: VM.dim, lineHeight: 1.3 }}>{a.sub}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}