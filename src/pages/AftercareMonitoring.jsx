import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, AlertTriangle, CheckCircle, TrendingUp, Calendar,
  MessageSquare, Flag, ChevronRight, Loader2
} from "lucide-react";
import AftercareClientList from "@/components/aftercare/AftercareClientList";
import AftercareClientDetail from "@/components/aftercare/AftercareClientDetail";
import AftercareAlerts from "@/components/aftercare/AftercareAlerts";
import PredictiveRiskPanel from "@/components/aftercare/PredictiveRiskPanel";
import { calcEngagementScore } from "@/components/aftercare/engagementScore";
import { calcPredictiveRisk } from "@/components/aftercare/predictiveRisk";

const TABS = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "predictive", label: "Predictive", icon: TrendingUp },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
];

export default function AftercareMonitoring() {
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["aftercare-profiles", user?.email],
    queryFn: () => base44.entities.ParticipantProfile.filter({ assigned_counselor_email: user.email }),
    enabled: !!user,
  });

  const clientEmails = profiles.map((p) => p.participant_email);

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["aftercare-checkins", clientEmails.join(",")],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: clientEmails.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["aftercare-alerts", user?.email],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    enabled: !!user,
  });

  // Compute per-client metrics
  const clientMetrics = useMemo(() => {
    return profiles.map((profile) => {
      const email = profile.participant_email;
      const myCheckIns = allCheckIns
        .filter((c) => c.participant_email === email)
        .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

      const last7 = myCheckIns.filter((c) => {
        const d = new Date(c.check_in_date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return d >= cutoff;
      });

      const lastCheckIn = myCheckIns[0]?.check_in_date || null;
      const daysSinceCheckIn = lastCheckIn
        ? Math.floor((new Date() - new Date(lastCheckIn)) / 86400000)
        : 99;

      const weeklyMeetings = last7.filter((c) => c.attended_meeting).length;
      const sponsorContacts = last7.filter((c) => c.connected_with_sponsor).length;
      const avgMood = last7.length
        ? (last7.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / last7.length).toFixed(1)
        : null;
      const avgCraving = last7.length
        ? (last7.reduce((sum, c) => sum + (c.craving_intensity || 0), 0) / last7.length).toFixed(1)
        : null;

      // Sobriety streak from sobriety_start_date
      const sobrietyDays = profile.sobriety_start_date
        ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
        : null;

      // Engagement score (0-100) using standardized calculation
      const { score: engagementScore, level: engagementLevel } = calcEngagementScore(myCheckIns);

      // Alert flags
      const missedCheckIns = daysSinceCheckIn >= 3;
      const highCravings = avgCraving && parseFloat(avgCraving) >= 4;
      const noMeetings = weeklyMeetings === 0 && last7.length > 0;

      const flagged = alerts.some((a) => a.participant_email === email && a.status === "active");

      return {
        profile,
        email,
        lastCheckIn,
        daysSinceCheckIn,
        weeklyMeetings,
        sponsorContacts,
        avgMood,
        avgCraving,
        sobrietyDays,
        engagementScore,
        engagementLevel,
        missedCheckIns,
        highCravings,
        noMeetings,
        flagged,
        checkIns: myCheckIns,
      };
    });
  }, [profiles, allCheckIns, alerts]);

  const alertCount = clientMetrics.filter((c) => c.missedCheckIns || c.highCravings || c.noMeetings || c.flagged).length;

  const predictiveCount = clientMetrics
    .filter((m) => m.engagementLevel !== "High Risk")
    .filter((m) => {
      const { predictiveLevel } = calcPredictiveRisk(m.checkIns || []);
      return predictiveLevel === "Pre-Alert" || predictiveLevel === "Emerging Risk";
    }).length;

  if (selectedClient) {
    const metrics = clientMetrics.find((m) => m.email === selectedClient.email);
    return (
      <AftercareClientDetail
        metrics={metrics}
        counselorEmail={user?.email}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB" }}>
        <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>Aftercare Monitoring</h1>
        <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
          Post-discharge engagement tracking for {profiles.length} client{profiles.length !== 1 ? "s" : ""}
        </p>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4">
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium relative"
              style={{
                background: activeTab === id ? "#1E1E1E" : "#F0F0F3",
                color: activeTab === id ? "#FFF" : "#5A5A5A",
              }}
            >
              <TabIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {label}
              {id === "alerts" && alertCount > 0 && (
                <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EF4444", color: "#FFF" }}>
                  {alertCount}
                </span>
              )}
              {id === "predictive" && predictiveCount > 0 && (
                <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F59E0B", color: "#FFF" }}>
                  {predictiveCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {profilesLoading ? (
        <div className="text-center py-20" style={{ color: "#8E8E93" }}>
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
          <p className="text-sm">Loading clients…</p>
        </div>
      ) : (
        <div className="px-5 py-4">
          {activeTab === "clients" && (
            <AftercareClientList
              clientMetrics={clientMetrics}
              onSelectClient={(m) => setSelectedClient({ email: m.email })}
            />
          )}
          {activeTab === "predictive" && (
            <PredictiveRiskPanel
              clientMetrics={clientMetrics}
              onSelectClient={(m) => setSelectedClient({ email: m.email })}
            />
          )}
          {activeTab === "alerts" && (
            <AftercareAlerts
              clientMetrics={clientMetrics}
              counselorEmail={user?.email}
              onSelectClient={(m) => setSelectedClient({ email: m.email })}
            />
          )}
        </div>
      )}
    </div>
  );
}