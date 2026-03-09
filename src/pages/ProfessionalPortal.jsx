import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PortalSidebar from "../components/portal/PortalSidebar";
import PortalDashboard from "../components/portal/PortalDashboard";
import PortalClients from "../components/portal/PortalClients";
import PortalClientProfile from "../components/portal/PortalClientProfile";
import PortalMessages from "../components/portal/PortalMessages";
import PortalAlerts from "../components/portal/PortalAlerts";
import PortalNotes from "../components/portal/PortalNotes";
import PortalProgress from "../components/portal/PortalProgress";
import PortalResources from "../components/portal/PortalResources";
import PortalSettings from "../components/portal/PortalSettings";
import CravingAlertPanel from "../components/portal/CravingAlertPanel";

function computeMetrics(participant, allCheckIns, activeAlerts) {
  const email = participant.participant_email;
  const mine = allCheckIns.filter(c => c.participant_email === email);
  const now = new Date();
  const ago7 = new Date(now); ago7.setDate(now.getDate() - 7);
  const last7 = mine.filter(c => new Date(c.check_in_date) >= ago7);
  const engagement = Math.round((last7.length / 7) * 100);
  const sorted = [...mine].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  const lastCheckIn = sorted[0] ? new Date(sorted[0].check_in_date) : null;
  const daysSince = lastCheckIn ? Math.floor((now - lastCheckIn) / 86400000) : 999;
  const avgMood = last7.length ? last7.reduce((s, c) => s + (c.mood_rating || 3), 0) / last7.length : 3;
  const avgCraving = last7.length ? last7.reduce((s, c) => s + (c.craving_level || 0), 0) / last7.length : 0;
  const hasAlert = activeAlerts.some(a => a.participant_email === email);
  let status = "stable";
  if (!mine.length) status = "new";
  else if (daysSince > 14) status = "inactive";
  else if (hasAlert || engagement < 30 || avgCraving >= 4 || avgMood <= 2) status = "at_risk";
  else if (engagement < 60 || daysSince > 3) status = "needs_attention";
  return { engagement, lastCheckIn, daysSince, avgMood, avgCraving, hasAlert, status, totalCheckIns: mine.length, last7CheckIns: last7 };
}

export default function ProfessionalPortal() {
  const [section, setSection] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: counselorProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const r = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return r[0] || null;
    },
    enabled: !!user,
  });

  const facilityId = counselorProfile?.facility_id;

  const { data: participants = [], isLoading: loadingP } = useQuery({
    queryKey: ["portal-participants", facilityId],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["portal-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!facilityId,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["portal-checkins", facilityId],
    queryFn: async () => {
      const checkins = await base44.entities.DailyCheckIn.list("-check_in_date", 500);
      const emails = new Set(participants.map(p => p.participant_email));
      return checkins.filter(c => emails.has(c.participant_email));
    },
    enabled: participants.length > 0,
    refetchInterval: 60000,
  });

  const { data: activeAlerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["portal-alerts", facilityId],
    queryFn: async () => {
      const all = await base44.entities.EngagementAlert.filter({ status: "active" });
      const emails = new Set(participants.map(p => p.participant_email));
      return all.filter(a => emails.has(a.participant_email));
    },
    enabled: participants.length > 0,
  });

  const userMap = useMemo(() =>
    Object.fromEntries(allUsers.map(u => [u.email, u])), [allUsers]);

  const participantsWithMetrics = useMemo(() =>
    participants.map(p => ({
      ...p,
      user: userMap[p.participant_email] || null,
      displayName: userMap[p.participant_email]?.full_name || p.participant_email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      ...computeMetrics(p, allCheckIns, activeAlerts),
    })),
    [participants, allCheckIns, activeAlerts, userMap]
  );

  const isLoading = loadingProfile || loadingP;

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSection("client_profile");
    setSidebarOpen(false);
  };

  const handleNavigate = (s) => {
    setSection(s);
    if (s !== "client_profile") setSelectedClient(null);
    setSidebarOpen(false);
  };

  if (!user || isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#3B82F6" }} />
      </div>
    );
  }

  if (!counselorProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#FFF", borderRadius: 16, padding: 40, maxWidth: 400, textAlign: "center", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Welcome to the Professional Portal</h2>
          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Your account isn't linked to a facility yet. Contact your administrator to get connected.
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8" }}>Signed in as {user?.email}</p>
        </div>
      </div>
    );
  }

  const sharedProps = {
    user, counselorProfile, facilityId,
    participants: participantsWithMetrics,
    allCheckIns, activeAlerts, userMap,
    onSelectClient: handleSelectClient,
    onNavigate: handleNavigate,
  };

  const renderSection = () => {
    if (section === "client_profile" && selectedClient) {
      return <PortalClientProfile client={selectedClient} {...sharedProps} onBack={() => handleNavigate("clients")} />;
    }
    switch (section) {
      case "dashboard":  return <PortalDashboard {...sharedProps} />;
      case "clients":    return <PortalClients {...sharedProps} />;
      case "messages":   return <PortalMessages {...sharedProps} />;
      case "alerts":     return <PortalAlerts {...sharedProps} onRefresh={refetchAlerts} />;
      case "notes":      return <PortalNotes {...sharedProps} />;
      case "progress":   return <PortalProgress {...sharedProps} />;
      case "resources":  return <PortalResources {...sharedProps} />;
      case "settings":   return <PortalSettings {...sharedProps} />;
      default:           return <PortalDashboard {...sharedProps} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      <PortalSidebar
        activeSection={section}
        onNavigate={handleNavigate}
        counselorProfile={counselorProfile}
        user={user}
        alertCount={activeAlerts.length}
        clientCount={participants.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Mobile top bar */}
        <div style={{ background: "#FFF", borderBottom: "1px solid #E2E8F0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}
          className="lg:hidden">
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>
            {counselorProfile?.facility_name || "Professional Portal"}
          </span>
          {activeAlerts.length > 0 && (
            <span style={{ marginLeft: "auto", background: "#EF4444", color: "#FFF", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
              {activeAlerts.length} alert{activeAlerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}