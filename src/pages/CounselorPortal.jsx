import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, AlertTriangle, Download, Search, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MessagingPanel from "../components/counselor/MessagingPanel";
import LifelineEventsTab from "../components/counselor/LifelineEventsTab";

export default function CounselorPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [activeTab, setActiveTab] = useState("participants"); // "participants" | "lifeline"

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", counselorProfile?.facility_id],
    queryFn: async () => {
      if (!counselorProfile?.facility_id) return null;
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
    queryKey: ["facility-checkins", facility?.id],
    queryFn: async () => {
      const allCheckins = await base44.entities.DailyCheckIn.list("-check_in_date", 500);
      const participantEmails = participants.map(p => p.participant_email);
      return allCheckins.filter(c => participantEmails.includes(c.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["facility-alerts", facility?.id],
    queryFn: async () => {
      const allAlerts = await base44.entities.EngagementAlert.filter({ status: "active" });
      const participantEmails = participants.map(p => p.participant_email);
      return allAlerts.filter(a => participantEmails.includes(a.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: phaseCompletions = [] } = useQuery({
    queryKey: ["all-phase-completions", facility?.id],
    queryFn: async () => {
      const allCompletions = await base44.entities.PhaseCompletion.list();
      const participantEmails = participants.map(p => p.participant_email);
      return allCompletions.filter(c => participantEmails.includes(c.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: forwardPlans = [] } = useQuery({
    queryKey: ["all-forward-plans", facility?.id],
    queryFn: async () => {
      const allPlans = await base44.entities.ForwardPlan.list();
      const participantEmails = participants.map(p => p.participant_email);
      return allPlans.filter(p => participantEmails.includes(p.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const calculateEngagement = (participantEmail) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysCheckIns = allCheckIns.filter(
      c => c.participant_email === participantEmail && new Date(c.check_in_date) >= sevenDaysAgo
    );
    return Math.round((last7DaysCheckIns.length / 7) * 100);
  };

  const getLastCheckIn = (participantEmail) => {
    const participantCheckIns = allCheckIns.filter(c => c.participant_email === participantEmail);
    if (participantCheckIns.length === 0) return null;
    const latest = participantCheckIns.reduce((a, b) => new Date(a.check_in_date) > new Date(b.check_in_date) ? a : b);
    return new Date(latest.check_in_date);
  };

  const getPhaseStatus = (participantEmail) => {
    const completions = phaseCompletions.filter(c => c.participant_email === participantEmail);
    if (completions.length === 0) return "Phase 1";
    if (completions.length === 1) return "Phase 2";
    if (completions.length === 2) return "Phase 3";
    return "Complete";
  };

  const getRiskLevel = (participantEmail) => {
    const hasAlert = alerts.some(a => a.participant_email === participantEmail);
    const engagement = calculateEngagement(participantEmail);
    if (hasAlert || engagement < 40) return "high";
    if (engagement < 70) return "medium";
    return "low";
  };

  const getForwardPlanData = (participantEmail) => {
    const plan = forwardPlans.find(fp => fp.participant_email === participantEmail);
    return plan ? {
      completion: plan.overall_completion_percentage || 0,
      hasGoals: !!(plan.housing_goal || plan.employment_goal || plan.education_goal)
    } : { completion: 0, hasGoals: false };
  };

  const participantsWithMetrics = participants.map(p => ({
    ...p,
    engagement: calculateEngagement(p.participant_email),
    lastCheckIn: getLastCheckIn(p.participant_email),
    phase: getPhaseStatus(p.participant_email),
    risk: getRiskLevel(p.participant_email),
    forwardPlan: getForwardPlanData(p.participant_email),
  }));

  const filteredParticipants = participantsWithMetrics.filter(p => {
    const matchesSearch = p.participant_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || p.risk === riskFilter;
    const matchesPhase = phaseFilter === "all" || p.phase === phaseFilter;
    const matchesEngagement = 
      engagementFilter === "all" ||
      (engagementFilter === "high" && p.engagement >= 80) ||
      (engagementFilter === "medium" && p.engagement >= 50 && p.engagement < 80) ||
      (engagementFilter === "low" && p.engagement < 50);
    return matchesSearch && matchesRisk && matchesPhase && matchesEngagement;
  });

  const totalActive = participants.length;
  const avgEngagement = totalActive > 0 
    ? Math.round(participantsWithMetrics.reduce((sum, p) => sum + p.engagement, 0) / totalActive) 
    : 0;
  const atRiskCount = participantsWithMetrics.filter(p => p.risk === "high").length;
  const phaseCompletionRate = totalActive > 0
    ? Math.round((phaseCompletions.length / (totalActive * 3)) * 100)
    : 0;

  const exportReport = () => {
    const report = {
      facility: facility?.name || "Unknown",
      generated: new Date().toISOString(),
      total_participants: totalActive,
      average_engagement: avgEngagement,
      at_risk_count: atRiskCount,
      phase_completion_rate: phaseCompletionRate,
      participants: filteredParticipants.map(p => ({
        email: p.participant_email,
        engagement: p.engagement,
        last_check_in: p.lastCheckIn ? p.lastCheckIn.toISOString() : null,
        phase: p.phase,
        risk_level: p.risk,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counselor-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: '4px' }}>Counselor Portal</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {facility?.name || "Facility Dashboard"}
        </p>
      </div>

      {/* Tab Nav */}
      <div className="flex px-6 pt-4 gap-1" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        {[
          { id: "participants", label: "Participants", icon: Users },
          { id: "lifeline", label: "Lifeline Events", icon: Phone },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg"
            style={{
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none'
            }}
          >
            <tab.icon className="w-4 h-4" strokeWidth={1.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "lifeline" && (
        <div className="px-6 py-6">
          <LifelineEventsTab facilityId={facility?.id} participants={participants} />
        </div>
      )}

      {activeTab === "participants" && <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        {/* Top Level Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            </div>
            <div className="metric-value">{totalActive}</div>
            <div className="metric-label">Active Participants</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            </div>
            <div className="metric-value">{avgEngagement}%</div>
            <div className="metric-label">Avg Engagement</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#E85D4C' }} strokeWidth={1.5} />
            </div>
            <div className="metric-value" style={{ color: '#E85D4C' }}>{atRiskCount}</div>
            <div className="metric-label">At Risk</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            </div>
            <div className="metric-value">{phaseCompletionRate}%</div>
            <div className="metric-label">Phase Completion</div>
          </div>
        </div>

        {/* Export Report */}
        <Button onClick={exportReport} className="btn-primary self-start">
          <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Export Report
        </Button>

        {/* Filters */}
        <div className="card">
          <h3 className="mb-4">Filter Participants</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2"
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Phase</label>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="w-full px-3 py-2"
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Phases</option>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Engagement</label>
              <select
                value={engagementFilter}
                onChange={(e) => setEngagementFilter(e.target.value)}
                className="w-full px-3 py-2"
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Engagement Levels</option>
                <option value="high">High (80%+)</option>
                <option value="medium">Medium (50-79%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="card">
          <h3 className="mb-4">Participants ({filteredParticipants.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredParticipants.map(participant => (
              <div
                key={participant.id}
                className="p-4"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {participant.participant_email}
                      </p>
                      {participant.risk === "high" && (
                        <Badge 
                          variant="destructive" 
                          className="text-[10px] px-2 py-0.5"
                          style={{ background: '#E85D4C', color: '#FFFFFF' }}
                        >
                          HIGH RISK
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Engagement: </span>
                        <span 
                          className="font-medium"
                          style={{ 
                            color: participant.engagement >= 70 ? '#4CAF50' : participant.engagement >= 40 ? '#FF9800' : '#E85D4C' 
                          }}
                        >
                          {participant.engagement}%
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Last Check-In: </span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {participant.lastCheckIn 
                            ? new Date(participant.lastCheckIn).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })
                            : "Never"}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Phase: </span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {participant.phase}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Forward Plan: </span>
                        <span className="font-medium" style={{ color: participant.forwardPlan.hasGoals ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {participant.forwardPlan.hasGoals ? `${participant.forwardPlan.completion}%` : "Not started"}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Discharge: </span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {participant.discharge_date 
                            ? new Date(participant.discharge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <Button
                      onClick={() => setSelectedParticipant(participant)}
                      size="sm"
                      className="btn-secondary"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredParticipants.length === 0 && (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-muted)' }}>No participants match the selected filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedParticipant && (
        <MessagingPanel
          participant={selectedParticipant}
          counselorEmail={user?.email}
          facilityId={facility?.id}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
}