import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, LogOut, MessageSquare } from "lucide-react";
import CounselorMessagePanel from "@/components/messaging/CounselorMessagePanel";
import ClientView from "@/components/shared/ClientView";

export default function CounselorDashboard() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [clientViewPatient, setClientViewPatient] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", counselorProfile?.facility_id],
    queryFn: async () => {
      const facilities = await base44.entities.Facility.filter({ id: counselorProfile.facility_id });
      return facilities[0];
    },
    enabled: !!counselorProfile?.facility_id,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["facility-participants", facility?.id],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: facility.id }),
    enabled: !!facility?.id,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["facility-checkins-brief", facility?.id],
    queryFn: async () => {
      const emails = participants.map((p) => p.participant_email);
      const all = await base44.entities.DailyCheckIn.list("-check_in_date", 500);
      return all.filter((c) => emails.includes(c.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const getMetrics = (email) => {
    const pCheckins = allCheckIns.filter((c) => c.participant_email === email);
    const compliance = Math.round(
      (pCheckins.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo).length / 7) * 100
    );
    const sorted = [...pCheckins].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    const lastCheckIn = sorted[0]?.check_in_date || null;
    const daysSince = lastCheckIn
      ? Math.floor((new Date() - new Date(lastCheckIn)) / 86400000)
      : 999;
    const risk = compliance < 40 || daysSince >= 3 ? "high" : compliance < 70 ? "medium" : "low";
    return { compliance, lastCheckIn, daysSince, risk };
  };

  const TABS = [
    { id: "patients", label: "Patients", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8E8E93" }}>COUNSELOR PORTAL</p>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>
              {facility?.name || user?.full_name || "Counselor Dashboard"}
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

      {/* Tabs */}
      <div className="flex px-6" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
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

      <div className="px-6 py-6 max-w-3xl mx-auto">
        {activeTab === "patients" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
              {participants.length} Assigned Patient{participants.length !== 1 ? "s" : ""}
            </p>

            {participants.length === 0 && (
              <div className="text-center py-16" style={{ color: "#8E8E93", fontSize: "14px" }}>
                No patients assigned to this facility yet.
              </div>
            )}

            {participants.map((p) => {
              const m = getMetrics(p.participant_email);
              return (
                <div key={p.id} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{p.participant_email}</p>
                        {m.risk === "high" && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                            <AlertTriangle className="w-3 h-3" strokeWidth={2} /> HIGH RISK
                          </span>
                        )}
                        {m.risk === "medium" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#D97706" }}>
                            MEDIUM RISK
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Compliance</p>
                          <p className="font-semibold" style={{ color: m.compliance >= 70 ? "#22C55E" : m.compliance >= 40 ? "#F59E0B" : "#EF4444" }}>
                            {m.compliance}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Last Check-In</p>
                          <p className="font-medium text-sm" style={{ color: "#1E1E1E" }}>
                            {m.lastCheckIn
                              ? new Date(m.lastCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Days Since</p>
                          <p className="font-medium text-sm" style={{ color: m.daysSince >= 3 ? "#EF4444" : "#1E1E1E" }}>
                            {m.daysSince === 999 ? "—" : `${m.daysSince}d`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F0F0F3" }}>
                    <button
                      onClick={() => { setSelectedPatient(p); setActiveTab("messages"); }}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                      style={{ background: "#F0F4FA", color: "#4A90E2", border: "1px solid #C7D7F0" }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Send Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "messages" && (
          <CounselorMessagePanel
            counselorEmail={user?.email}
            facilityId={facility?.id}
            participants={participants}
            initialPatient={selectedPatient}
            channel="counselor_patient"
          />
        )}
      </div>
    </div>
  );
}