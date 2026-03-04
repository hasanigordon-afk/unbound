import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, AlertTriangle, LogOut, MessageSquare, FileText } from "lucide-react";
import CounselorMessagePanel from "@/components/messaging/CounselorMessagePanel";
import ClientView from "@/components/shared/ClientView";

export default function ProbationDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  // For demo/preview: load all participant profiles
  const { data: clients = [] } = useQuery({
    queryKey: ["all-participants-probation"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 50),
    enabled: !!user,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["all-checkins-probation"],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: clients.length > 0,
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const getCompliance = (email) => {
    const recent = allCheckIns.filter(
      (c) => c.participant_email === email && new Date(c.check_in_date) >= sevenDaysAgo
    );
    return Math.round((recent.length / 7) * 100);
  };

  const TABS = [
    { id: "clients", label: "Clients", icon: Shield },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8E8E93" }}>PROBATION OFFICER PORTAL</p>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>
              {user?.full_name || "Probation Dashboard"}
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
        {activeTab === "clients" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
              {clients.length} Assigned Client{clients.length !== 1 ? "s" : ""}
            </p>

            {clients.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "#8E8E93" }}>
                No clients found in the system.
              </div>
            )}

            {clients.map((client) => {
              const compliance = getCompliance(client.participant_email);
              const isViolation = compliance < 40;
              return (
                <div key={client.id} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{client.participant_email}</p>
                        {isViolation && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                            <AlertTriangle className="w-3 h-3" strokeWidth={2} /> VIOLATION RISK
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Compliance</p>
                          <p className="font-semibold" style={{ color: compliance >= 70 ? "#22C55E" : compliance >= 40 ? "#F59E0B" : "#EF4444" }}>
                            {compliance}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Discharge Date</p>
                          <p className="font-medium text-sm" style={{ color: "#1E1E1E" }}>
                            {client.discharge_date
                              ? new Date(client.discharge_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Facility ID</p>
                          <p className="font-medium text-sm truncate" style={{ color: "#1E1E1E" }}>{client.facility_id || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F0F0F3" }}>
                    <button
                      onClick={() => { setSelectedClient(client); setActiveTab("messages"); }}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                      style={{ background: "#F0F4FA", color: "#4A90E2", border: "1px solid #C7D7F0" }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Send Message
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                      style={{ background: "#F5F5F7", color: "#5A5A5A", border: "1px solid #D1D1D6" }}
                    >
                      <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Documentation
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
            facilityId={null}
            participants={clients}
            initialPatient={selectedClient}
            channel="probation_client"
            senderRole="probation_officer"
            receiverRole="patient"
          />
        )}
      </div>
    </div>
  );
}