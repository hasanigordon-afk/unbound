import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, TrendingUp, Shield, Loader2 } from "lucide-react";
import AftercareClientList from "@/components/aftercare/AftercareClientList";
import AftercareClientDetail from "@/components/aftercare/AftercareClientDetail";
import AftercareAlerts from "@/components/aftercare/AftercareAlerts";
import PredictiveRiskPanel from "@/components/aftercare/PredictiveRiskPanel";
import CravingAlertPanel from "@/components/aftercare/CravingAlertPanel";
import { calcEngagementScore } from "@/components/aftercare/engagementScore";
import { calcPredictiveRisk } from "@/components/aftercare/predictiveRisk";

const TABS = [
  { id: "clients",    label: "Clients",      icon: Users },
  { id: "risk",       label: "Risk Monitor", icon: Shield },
  { id: "predictive", label: "Predictive",   icon: TrendingUp },
  { id: "alerts",     label: "Alerts",       icon: AlertTriangle },
];

export default function AftercareMonitoring() {
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Assigned profiles when logged in
  const { data: assignedProfiles = [], isLoading: assignedLoading } = useQuery({
    queryKey: ["aftercare-profiles", user?.email],
    queryFn: () => base44.entities.ParticipantProfile.filter({ assigned_counselor_email: user.email }),
    enabled: !!user,
  });

  // Always load all profiles for demo / fallback (no auth required)
  const { data: allProfiles = [], isLoading: allLoading } = useQuery({
    queryKey: ["aftercare-all-profiles"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 50),
    enabled: !user || assignedProfiles.length === 0,
  });

  const profilesLoading = assignedLoading || allLoading;
  const profiles = assignedProfiles.length > 0 ? assignedProfiles : allProfiles;

  const clientEmails = profiles.map((p) => p.participant_email);

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["aftercare-checkins", clientEmails.join(",")],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: clientEmails.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["aftercare-alerts"],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    // always load alerts — no auth required
  });

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

      const weeklyMeetings   = last7.filter((c) => c.attended_meeting).length;
      const sponsorContacts  = last7.filter((c) => c.connected_with_sponsor).length;
      const avgMood = last7.length
        ? (last7.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / last7.length).toFixed(1)
        : null;
      const avgCraving = last7.length
        ? (last7.reduce((sum, c) => sum + (c.craving_intensity || 0), 0) / last7.length).toFixed(1)
        : null;

      const sobrietyDays = profile.sobriety_start_date
        ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
        : null;

      const { score: engagementScore, level: engagementLevel } = calcEngagementScore(myCheckIns);

      // ── Recovery Stability Score (80-100 Stable, 50-79 At Risk, 0-49 High Risk) ──
      const avgCravingFloat = last7.length
        ? last7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / last7.length
        : 5;
      const stabilityCheckinScore = Math.min(last7.length / 7, 1) * 25;
      const stabilityMeetingScore = last7.length
        ? (last7.filter(c => c.attended_meeting).length / last7.length) * 25 : 0;
      const stabilitySponsorScore = last7.length
        ? (last7.filter(c => c.connected_with_sponsor).length / last7.length) * 25 : 0;
      const stabilityCravingScore = Math.max(0, (10 - avgCravingFloat) / 10) * 25;
      const stabilityScore = Math.round(
        stabilityCheckinScore + stabilityMeetingScore + stabilitySponsorScore + stabilityCravingScore
      );
      const stabilityLabel = stabilityScore >= 80 ? "Stable" : stabilityScore >= 50 ? "At Risk" : "High Risk";
      const stabilityColor = stabilityScore >= 80 ? "#10B981" : stabilityScore >= 50 ? "#F59E0B" : "#EF4444";

      // Check-in streak
      const streak = (() => {
        let count = 0; let cur = new Date(); cur.setHours(0,0,0,0);
        for (const c of myCheckIns) {
          const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
          if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
        }
        return count;
      })();

      // Existing flags (backward compatible)
      const missedCheckIns = daysSinceCheckIn >= 3;
      const highCravings   = avgCraving && parseFloat(avgCraving) >= 4;
      const noMeetings     = weeklyMeetings === 0 && last7.length > 0;
      const flagged        = alerts.some((a) => a.participant_email === email && a.status === "active");

      // ── Craving Alert System: new risk signals (0-10 scale) ─────────────
      const last3 = myCheckIns.slice(0, 3);
      const last5 = myCheckIns.slice(0, 5);

      const latestCraving = myCheckIns[0]?.craving_intensity ?? null;
      const latestStress  = myCheckIns[0]?.stress_level ?? null;

      // Emergency: relapse flag raised in any of last 3 check-ins
      const relapseFlag = last3.some(c => c.relapse_risk_flag === true);

      // High risk: craving 8–10
      const highCravingImmediate = latestCraving !== null && latestCraving >= 8;

      // Moderate craving pattern: craving > 6 for 3 consecutive days
      const moderateCravingPattern =
        last3.length >= 3 && last3.every(c => (c.craving_intensity ?? 0) > 6);

      // Mood drop: mood rating 1–2 for 3 consecutive days
      const moodDropPattern =
        last3.length >= 3 && last3.every(c => c.mood_rating !== null && c.mood_rating <= 2);

      // Isolation: no meeting OR no sponsor contact for 5 consecutive days
      const noMeetings5Days = last5.length >= 5 && last5.every(c => !c.attended_meeting);
      const noSponsor5Days  = last5.length >= 5 && last5.every(c => !c.connected_with_sponsor);
      const isolationFlag   = noMeetings5Days || noSponsor5Days;

      // Color-coded risk status for Risk Monitor panel
      const riskColor =
        relapseFlag || highCravingImmediate ? "red" :
        moderateCravingPattern || moodDropPattern || isolationFlag || missedCheckIns || flagged
          ? "yellow"
          : "green";

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
        // Craving Alert System fields
        latestCraving,
        latestStress,
        relapseFlag,
        highCravingImmediate,
        moderateCravingPattern,
        moodDropPattern,
        isolationFlag,
        riskColor,
        stabilityScore,
        stabilityLabel,
        stabilityColor,
        streak,
      };
    });
  }, [profiles, allCheckIns, alerts]);

  const alertCount = clientMetrics.filter(
    (c) => c.missedCheckIns || c.highCravings || c.noMeetings || c.flagged ||
            c.relapseFlag || c.highCravingImmediate
  ).length;

  const riskCount = clientMetrics.filter(
    m => m.riskColor === "red" || m.riskColor === "yellow"
  ).length;

  const hasRedRisk = clientMetrics.some(m => m.riskColor === "red");

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

  const isDemo = !user;

  const stableCount  = clientMetrics.filter(m => m.stabilityScore >= 80).length;
  const atRiskCount  = clientMetrics.filter(m => m.stabilityScore >= 50 && m.stabilityScore < 80).length;
  const highRiskCount= clientMetrics.filter(m => m.stabilityScore < 50).length;

  return (
    <div style={{ minHeight:"100vh", paddingBottom:96, background:"#F0F2F5" }}>

      {/* ── Premium dark header ─────────────────────────────── */}
      <div style={{ background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:260, height:260, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {isDemo && (
          <div style={{ background:"rgba(74,144,226,0.2)", borderBottom:"1px solid rgba(74,144,226,0.3)",
            padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>👁 Demo mode — all participants shown</p>
            <button onClick={() => base44.auth.redirectToLogin()} style={{ fontSize:12, fontWeight:700,
              color:"#60A5FA", background:"none", border:"none", cursor:"pointer" }}>Sign in →</button>
          </div>
        )}

        <div style={{ padding:"24px 20px 0", position:"relative", zIndex:1 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(62,207,191,0.8)", textTransform:"uppercase",
            letterSpacing:".1em", marginBottom:4 }}>Recovery Accountability</p>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:4, lineHeight:1.2 }}>
            Caseload Overview
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20 }}>
            {profiles.length} client{profiles.length !== 1 ? "s" : ""} · Active monitoring
          </p>

          {/* Stat blocks */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[
              { value:profiles.length, label:"Total",     color:"#60A5FA", bg:"rgba(96,165,250,0.1)"  },
              { value:stableCount,     label:"Stable",    color:"#34D399", bg:"rgba(52,211,153,0.1)"  },
              { value:atRiskCount,     label:"At Risk",   color:"#FBBF24", bg:"rgba(251,191,36,0.1)"  },
              { value:highRiskCount,   label:"High Risk", color:"#F87171", bg:"rgba(248,113,113,0.1)" },
            ].map(s=>(
              <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:"12px 8px", textAlign:"center",
                border:`1px solid ${s.color}25` }}>
                <p style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</p>
                <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.45)", marginTop:4, textTransform:"uppercase", letterSpacing:".05em" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, overflowX:"auto", scrollbarWidth:"none", paddingBottom:0 }}>
            {TABS.map(({ id, label, icon: TabIcon }) => {
              const active = activeTab === id;
              const badge = id==="alerts" ? (alertCount||0) : id==="risk" ? (riskCount||0) : id==="predictive" ? (predictiveCount||0) : 0;
              const badgeColor = id==="alerts"||id==="risk" ? (hasRedRisk?"#EF4444":"#F59E0B") : "#F59E0B";
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display:"flex", alignItems:"center", gap:6, padding:"10px 14px",
                  borderRadius:"12px 12px 0 0", border:"none", cursor:"pointer", whiteSpace:"nowrap",
                  background: active ? "#F0F2F5" : "transparent",
                  color: active ? "#0E1D3A" : "rgba(255,255,255,0.5)",
                  fontWeight: active ? 800 : 600, fontSize:13,
                  transition:"all 0.15s ease",
                }}>
                  <TabIcon style={{ width:14, height:14 }} strokeWidth={active?2:1.5}/>
                  {label}
                  {badge > 0 && (
                    <span style={{ background:badgeColor, color:"#fff", fontSize:10, fontWeight:900,
                      padding:"2px 6px", borderRadius:20, lineHeight:1.4 }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      {profilesLoading ? (
        <div style={{ textAlign:"center", paddingTop:80 }}>
          <Loader2 style={{ width:32, height:32, color:"#3ECFBF", margin:"0 auto 12px", display:"block" }} className="animate-spin"/>
          <p style={{ fontSize:13, color:"#8E8E93" }}>Loading clients…</p>
        </div>
      ) : (
        <div style={{ padding:"16px 16px" }}>
          {activeTab === "clients"    && <AftercareClientList clientMetrics={clientMetrics} onSelectClient={(m) => setSelectedClient({ email: m.email })}/>}
          {activeTab === "risk"       && <CravingAlertPanel   clientMetrics={clientMetrics} counselorEmail={user?.email} onSelectClient={(m) => setSelectedClient({ email: m.email })}/>}
          {activeTab === "predictive" && <PredictiveRiskPanel clientMetrics={clientMetrics} onSelectClient={(m) => setSelectedClient({ email: m.email })}/>}
          {activeTab === "alerts"     && <AftercareAlerts     clientMetrics={clientMetrics} counselorEmail={user?.email} onSelectClient={(m) => setSelectedClient({ email: m.email })}/>}
        </div>
      )}
    </div>
  );
}