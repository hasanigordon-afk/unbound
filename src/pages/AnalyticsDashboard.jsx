import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Building2, MapPin, Award, ShieldAlert } from "lucide-react";
import RelapseRiskPanel from "@/components/risk/RelapseRiskPanel";

export default function AnalyticsDashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => base44.entities.Facility.list(),
  });

  const { data: allParticipants = [] } = useQuery({
    queryKey: ["all-participants"],
    queryFn: () => base44.entities.ParticipantProfile.list(),
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["all-checkins"],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 2000),
  });

  const { data: allPhaseCompletions = [] } = useQuery({
    queryKey: ["all-phase-completions"],
    queryFn: () => base44.entities.PhaseCompletion.list(),
  });

  const getStateAnalytics = () => {
    const byState = {};
    allParticipants.forEach(p => {
      const state = p.location_state || "Unknown";
      if (!byState[state]) {
        byState[state] = { total: 0, active: 0, engaged: [] };
      }
      byState[state].total++;

      const recentCheckIns = allCheckIns.filter(c => {
        if (c.participant_email !== p.participant_email) return false;
        const daysSince = Math.floor((Date.now() - new Date(c.created_date)) / (1000 * 60 * 60 * 24));
        return daysSince <= 7;
      });

      if (recentCheckIns.length > 0) {
        byState[state].active++;
        byState[state].engaged.push(recentCheckIns.length);
      }
    });

    return Object.entries(byState).map(([state, data]) => ({
      state,
      total: data.total,
      active: data.active,
      engagementRate: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
    }));
  };

  const getFacilityAnalytics = () => {
    return facilities.map(facility => {
      const facilityParticipants = allParticipants.filter(p => p.facility_id === facility.id);
      const participantEmails = facilityParticipants.map(p => p.participant_email);
      
      const facilityCheckIns = allCheckIns.filter(c => participantEmails.includes(c.participant_email));
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentCheckIns = facilityCheckIns.filter(c => new Date(c.created_date) >= last7Days);
      const activeParticipants = new Set(recentCheckIns.map(c => c.participant_email)).size;

      const facilityPhaseCompletions = allPhaseCompletions.filter(pc => 
        participantEmails.includes(pc.participant_email)
      );
      const phase3Completions = facilityPhaseCompletions.filter(pc => pc.phase === 3).length;

      return {
        name: facility.facility_name,
        totalParticipants: facilityParticipants.length,
        activeParticipants,
        engagementRate: facilityParticipants.length > 0 ? 
          Math.round((activeParticipants / facilityParticipants.length) * 100) : 0,
        ninetyDayCompletions: phase3Completions,
      };
    });
  };

  const getOverallMetrics = () => {
    const totalParticipants = allParticipants.length;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCheckIns = allCheckIns.filter(c => new Date(c.created_date) >= last7Days);
    const activeParticipants = new Set(recentCheckIns.map(c => c.participant_email)).size;
    const avgEngagement = totalParticipants > 0 ? Math.round((activeParticipants / totalParticipants) * 100) : 0;

    const totalMeetings = allCheckIns.filter(c => c.attended_meeting).length;
    const avgMeetings = allCheckIns.length > 0 ? (totalMeetings / allCheckIns.length * 100).toFixed(1) : 0;

    const phase3Completions = allPhaseCompletions.filter(pc => pc.phase === 3).length;
    const successRate = totalParticipants > 0 ? Math.round((phase3Completions / totalParticipants) * 100) : 0;

    // Calculate avg disengagement window
    const participantLastCheckIn = {};
    allCheckIns.forEach(c => {
      if (!participantLastCheckIn[c.participant_email] || 
          new Date(c.created_date) > new Date(participantLastCheckIn[c.participant_email])) {
        participantLastCheckIn[c.participant_email] = c.created_date;
      }
    });
    const disengagements = Object.values(participantLastCheckIn).map(date => {
      return Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    }).filter(days => days > 7);
    const avgDisengagement = disengagements.length > 0 ? 
      Math.round(disengagements.reduce((a, b) => a + b, 0) / disengagements.length) : 0;

    return { totalParticipants, activeParticipants, avgEngagement, avgMeetings, successRate, avgDisengagement };
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <p style={{ color: '#ffffff' }}>Access denied. Super admin only.</p>
      </div>
    );
  }

  const stateAnalytics = getStateAnalytics();
  const facilityAnalytics = getFacilityAnalytics();
  const overallMetrics = getOverallMetrics();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Analytics Dashboard</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>System-wide engagement and compliance analytics</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Participants</p>
            <p className="text-3xl font-bold" style={{ color: '#60a5fa' }}>{overallMetrics.totalParticipants}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Avg Engagement Rate</p>
            <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>{overallMetrics.avgEngagement}%</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>90-Day Success Rate</p>
            <p className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{overallMetrics.successRate}%</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Meeting Attendance</p>
            <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.avgMeetings}%</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Avg Disengagement Window</p>
            <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>{overallMetrics.avgDisengagement}<span className="text-sm"> days</span></p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Facilities</p>
            <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{facilities.length}</p>
          </div>
        </div>

        {/* State Analytics */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#ffffff' }}>
            <MapPin className="w-5 h-5" />
            Engagement by State
          </h3>
          {stateAnalytics.map(state => (
            <div key={state.state} className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{state.state}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {state.active} of {state.total} active (last 7 days)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{state.engagementRate}%</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>engagement</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Facility Analytics */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Building2 className="w-5 h-5" />
            Completion by Facility
          </h3>
          {facilityAnalytics.map(facility => (
            <div key={facility.name} className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{facility.name}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {facility.activeParticipants} of {facility.totalParticipants} participants active
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{facility.engagementRate}%</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>engagement</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4" style={{ color: '#22c55e' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {facility.ninetyDayCompletions} completed 90-day program
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Relapse Risk Alerts */}
        <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: '#ffffff' }}>
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Relapse Risk Alerts
          </h3>
          <RelapseRiskPanel />
        </div>

        {/* Grant Readiness Note */}
        <div className="p-5 rounded-xl" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
          <p className="font-semibold mb-2" style={{ color: '#60a5fa' }}>Grant Positioning Ready</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            These aggregate analytics demonstrate measurable outcomes for grant applications and institutional partnerships.
          </p>
        </div>
      </div>
    </div>
  );
}