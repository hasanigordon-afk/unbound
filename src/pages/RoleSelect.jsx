import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { User, Stethoscope, Shield } from "lucide-react";

const ROLES = [
  {
    id: "patient",
    label: "Patient",
    description: "View your dashboard, check-ins, compliance status, and messages from your care team.",
    icon: User,
    page: "PatientDashboard",
  },
  {
    id: "counselor",
    label: "Counselor",
    description: "Manage assigned patients, review engagement data, and send structured communications.",
    icon: Stethoscope,
    page: "CounselorDashboard",
  },
  {
    id: "probation_officer",
    label: "Probation Officer",
    description: "Monitor client compliance, court dates, violations, and required documentation.",
    icon: Shield,
    page: "ProbationDashboard",
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    sessionStorage.setItem("unbound_role", role.id);
    navigate(createPageUrl(role.page));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "#F7F7F8" }}>
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8E8E93" }}>UNBOUND</p>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "#1E1E1E" }}>Select Your Role</h1>
          <p className="text-sm" style={{ color: "#5A5A5A" }}>Choose how you are accessing the system.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role)}
                className="w-full text-left p-5 rounded-lg flex items-start gap-4"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D1D1D6",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#4A90E2"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#D1D1D6"}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded"
                  style={{ background: "#F0F4FA" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1" style={{ color: "#1E1E1E" }}>{role.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>{role.description}</p>
                </div>
                <div className="flex-shrink-0 self-center" style={{ color: "#8E8E93" }}>›</div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "#8E8E93" }}>
          Recovery Accountability System — Unbound v1.0
        </p>
      </div>
    </div>
  );
}