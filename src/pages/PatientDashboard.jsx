import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, Inbox, LogOut, CheckCircle, Shield } from "lucide-react";
import PatientInbox from "@/components/messaging/PatientInbox";
import CourtGuidelinesReminder from "@/components/compliance/CourtGuidelinesReminder";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });

  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns.some((c) => c.check_in_date === today);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const compliancePct = checkIns.length
    ? Math.round((checkIns.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo).length / 7) * 100)
    : 0;

  const TABS = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8E8E93" }}>PATIENT PORTAL</p>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>
              {user?.full_name || "Patient Dashboard"}
            </h1>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("unbound_role"); navigate(createPageUrl("RoleSelect")); }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded"
            style={{ background: "#F0F0F3", color: "#5A5A5A", border: "1px solid #D1D1D6" }}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            Switch Role
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex px-6" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
            style={{
              color: activeTab === t.id ? "#4A90E2" : "#8E8E93",
              borderBottom: activeTab === t.id ? "2px solid #4A90E2" : "2px solid transparent",
              background: "none",
            }}
          >
            <t.icon className="w-4 h-4" strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {activeTab === "overview" && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Compliance Rate</p>
                <p className="text-3xl font-bold" style={{ color: compliancePct >= 70 ? "#22C55E" : compliancePct >= 40 ? "#F59E0B" : "#EF4444" }}>
                  {compliancePct}%
                </p>
                <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Last 7 Days</p>
              </div>
              <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Today's Check-In</p>
                <p className="text-3xl font-bold" style={{ color: hasCheckedInToday ? "#22C55E" : "#EF4444" }}>
                  {hasCheckedInToday ? "Done" : "Pending"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{today}</p>
              </div>
            </div>

            {/* Daily Check-In CTA */}
            {!hasCheckedInToday && (
              <Link to={createPageUrl("DailyCheckIn")}>
                <div
                  className="p-5 rounded-lg flex items-center gap-4"
                  style={{ background: "#FFF", border: "2px solid #4A90E2", borderRadius: "8px", cursor: "pointer" }}
                >
                  <Calendar className="w-8 h-8 flex-shrink-0" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>Complete Daily Check-In</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Required for compliance tracking</p>
                  </div>
                </div>
              </Link>
            )}
            {hasCheckedInToday && (
              <div
                className="p-5 rounded-lg flex items-center gap-4"
                style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "8px" }}
              >
                <CheckCircle className="w-8 h-8 flex-shrink-0" style={{ color: "#22C55E" }} strokeWidth={1.5} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#15803D" }}>Check-In Complete</p>
                  <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Next check-in available tomorrow</p>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}>
              <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Quick Access</p>
              {[
                { label: "90-Day Reintegration Map", sub: "Structured task progression", page: "ReintegrationMap" },
                { label: "Forward Plan", sub: "5-Year stability roadmap", page: "ForwardPlan" },
                { label: "Resource Directory", sub: "Employment, housing, benefits", page: "ResourceDirectory" },
              ].map((item, i, arr) => (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderTop: i > 0 ? "1px solid #F0F0F3" : "none" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{item.sub}</p>
                    </div>
                    <span style={{ color: "#8E8E93" }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === "inbox" && user && (
          <PatientInbox userEmail={user.email} userRole="patient" />
        )}
      </div>
    </div>
  );
}