import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, LogOut, MessageSquare, ShieldAlert, Hash, Loader2, Building2 } from "lucide-react";
import CounselorMessagePanel from "@/components/messaging/CounselorMessagePanel";
import ClientView from "@/components/shared/ClientView";
import RelapseRiskPanel from "@/components/risk/RelapseRiskPanel";
import ChannelModerationPanel from "@/components/channels/ChannelModerationPanel";

// Demo fallback data for shared/preview mode
const DEMO_FACILITY = { id: "69b4c0a624652291a34b228b", facility_name: "Integrity Recovery Center", city: "Newark", state: "NJ" };
const DEMO_COUNSELOR_EMAIL = "counselor.rivera@integrityrc.org";

export default function CounselorDashboard() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [clientViewPatient, setClientViewPatient] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Counselor profile — only when logged in
  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  // Facility: use linked facility OR demo fallback
  const facilityId = counselorProfile?.facility_id || (!user ? DEMO_FACILITY.id : null);

  const { data: facilityData } = useQuery({
    queryKey: ["facility-obj", facilityId],
    queryFn: async () => {
      const list = await base44.entities.Facility.list();
      return list.find(f => f.id === facilityId) || DEMO_FACILITY;
    },
    enabled: !!facilityId,
  });

  const facility = facilityData || (!user ? DEMO_FACILITY : null);

  // Participants — load by facility OR all for demo
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["facility-participants", facility?.id],
    queryFn: () =>
      facility?.id
        ? base44.entities.ParticipantProfile.filter({ facility_id: facility.id })
        : base44.entities.ParticipantProfile.list("-created_date", 20),
    enabled: !!facility,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["facility-checkins-brief", facility?.id],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: participants.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["facility-alerts", facility?.id],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    enabled: !!facility,
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const getMetrics = (email) => {
    const pCheckins = allCheckIns.filter((c) => c.participant_email === email);
    const recent = pCheckins.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo);
    const compliance = Math.round((recent.length / 7) * 100);
    const sorted = [...pCheckins].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    const lastCheckIn = sorted[0]?.check_in_date || null;
    const daysSince = lastCheckIn ? Math.floor((new Date() - new Date(lastCheckIn)) / 86400000) : 999;
    const hasAlert = alerts.some(a => a.participant_email === email);
    const risk = hasAlert || compliance < 40 || daysSince >= 3 ? "high" : compliance < 70 ? "medium" : "low";
    return { compliance, lastCheckIn, daysSince, risk };
  };

  const counselorEmail = user?.email || DEMO_COUNSELOR_EMAIL;
  const isDemo = !user;

  const TABS = [
    { id: "patients", label: "Patients", icon: Users },
    { id: "risk", label: "Risk Alerts", icon: ShieldAlert },
    { id: "channels", label: "Channels", icon: Hash },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  if (clientViewPatient) {
    return (
      <ClientView
        client={clientViewPatient}
        authorEmail={counselorEmail}
        authorRole="counselor"
        channel="counselor_patient"
        facilityId={facility?.id}
        onBack={() => setClientViewPatient(null)}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "8px 16px", fontSize: 13 }}>
          👁 Demo mode — showing sample counselor data.{" "}
          <button onClick={() => base44.auth.redirectToLogin()} style={{ fontWeight: 700, textDecoration: "underline", background: "none", border: "none", color: "#FFF", cursor: "pointer" }}>Sign in</button>{" "}
          to access your real caseload.
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8E8E93" }}>COUNSELOR PORTAL</p>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>
              {facility?.facility_name || user?.full_name || "Counselor Dashboard"}
            </h1>
            {facility?.city && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5" style={{ color: "#8E8E93" }} />
                <p className="text-xs" style={{ color: "#8E8E93" }}>{facility.city}, {facility.state}</p>
              </div>
            )}
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

        {/* Summary stats */}
        {participants.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Caseload", value: participants.length, color: "#4A90E2" },
              { label: "Active Alerts", value: alerts.filter(a => a.status === "active").length, color: "#EF4444" },
              { label: "High Risk", value: participants.filter(p => getMetrics(p.participant_email).risk === "high").length, color: "#F59E0B" },
            ].map(s => (
              <div key={s.label} style={{ background: "#F7F7F8", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-6 overflow-x-auto" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap"
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

            {participantsLoading && (
              <div className="text-center py-10" style={{ color: "#8E8E93" }}>
                <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2 opacity-40" />
                <p className="text-sm">Loading patients…</p>
              </div>
            )}

            {!participantsLoading && participants.length === 0 && (
              <div className="text-center py-16 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB", color: "#8E8E93" }}>
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No patients assigned yet.</p>
                <p className="text-xs mt-1">Participants will appear here once linked to your facility.</p>
              </div>
            )}

            {participants.map((p) => {
              const m = getMetrics(p.participant_email);
              const hasActiveAlert = alerts.some(a => a.participant_email === p.participant_email && a.status === "active");
              return (
                <div key={p.id} style={{ background: "#FFF", border: `1px solid ${m.risk === "high" ? "#FCA5A5" : "#D1D1D6"}`, borderLeft: `4px solid ${m.risk === "high" ? "#EF4444" : m.risk === "medium" ? "#F59E0B" : "#22C55E"}`, borderRadius: "8px", padding: "18px 20px" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{p.participant_email}</p>
                        {m.risk === "high" && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                            <AlertTriangle className="w-3 h-3" strokeWidth={2} /> HIGH RISK
                          </span>
                        )}
                        {m.risk === "medium" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#D97706" }}>AT RISK</span>
                        )}
                        {hasActiveAlert && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#DC2626" }}>⚡ ALERT</span>
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
                            {m.lastCheckIn ? new Date(m.lastCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}
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
                    <button onClick={() => setClientViewPatient(p)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium" style={{ background: "#4A90E2", color: "#FFF", border: "none" }}>
                      View Client
                    </button>
                    <button onClick={() => { setSelectedPatient(p); setActiveTab("messages"); }} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium" style={{ background: "#F0F4FA", color: "#4A90E2", border: "1px solid #C7D7F0" }}>
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "risk" && <RelapseRiskPanel facilityId={facility?.id} />}
        {activeTab === "channels" && <ChannelModerationPanel />}

        {activeTab === "messages" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>Client Communications</p>
              <Link to={createPageUrl("CounselorMessaging")} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium" style={{ background: "#4A90E2", color: "#FFF", textDecoration: "none" }}>
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                Open Messaging Center
              </Link>
            </div>
            <CounselorMessagePanel
              counselorEmail={counselorEmail}
              facilityId={facility?.id}
              participants={participants}
              initialPatient={selectedPatient}
              channel="counselor_patient"
            />
          </div>
        )}
      </div>
    </div>
  );
}