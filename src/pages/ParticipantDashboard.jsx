import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Calendar, TrendingUp, Users, MapPin, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FamilySettings from "@/components/family/FamilySettings";

export default function ParticipantDashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", profile?.facility_id],
    queryFn: async () => {
      if (!profile?.facility_id) return null;
      const facilities = await base44.entities.Facility.filter({ id: profile.facility_id });
      return facilities[0];
    },
    enabled: !!profile?.facility_id,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });

  const { data: phaseCompletions = [] } = useQuery({
    queryKey: ["phase-completions", user?.email],
    queryFn: () => base44.entities.PhaseCompletion.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.ReintegrationTask.list(),
  });

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = checkIns.some(c => c.check_in_date === today);

  // Calculate engagement streak
  const calculateStreak = () => {
    if (!checkIns.length) return 0;
    let streak = 0;
    const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    
    let currentDate = new Date();
    for (let checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.check_in_date);
      const daysDiff = Math.floor((currentDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak++;
        currentDate = checkInDate;
      } else {
        break;
      }
    }
    return streak;
  };

  // Calculate 7-day engagement compliance
  const calculateEngagementCompliance = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
    return Math.round((last7DaysCheckIns.length / 7) * 100);
  };

  // Calculate 90-day phase progress
  const calculatePhaseProgress = () => {
    const totalTasks = allTasks.length;
    const completedPhases = phaseCompletions.length;
    if (totalTasks === 0) return 0;
    const tasksPerPhase = Math.ceil(totalTasks / 3);
    const estimatedCompleted = completedPhases * tasksPerPhase;
    return Math.min(Math.round((estimatedCompleted / totalTasks) * 100), 100);
  };

  // This week's meeting count
  const getWeekMeetingCount = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= weekAgo);
    return thisWeekCheckIns.filter(c => c.attended_meeting).length;
  };

  // Calculate days since last check-in for status indicator
  const getDaysSinceLastCheckIn = () => {
    if (!checkIns.length) return 999;
    const mostRecent = checkIns.sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
    const daysDiff = Math.floor((new Date() - new Date(mostRecent.check_in_date)) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const streak = calculateStreak();
  const engagementCompliance = calculateEngagementCompliance();
  const phaseProgress = calculatePhaseProgress();
  const meetingCount = getWeekMeetingCount();
  const daysSinceLastCheckIn = getDaysSinceLastCheckIn();
  const accentColor = facility?.primary_color || '#fbbf24';

  // Status indicator
  const getStatusColor = () => {
    if (daysSinceLastCheckIn === 0) return '#22c55e'; // Green - Active
    if (daysSinceLastCheckIn === 1) return '#fbbf24'; // Yellow - Missed 1 day
    return '#ef4444'; // Red - Missed 3+ days
  };

  const getStatusText = () => {
    if (daysSinceLastCheckIn === 0) return 'Active';
    if (daysSinceLastCheckIn === 1) return 'Missed 1 Day';
    return `Missed ${daysSinceLastCheckIn} Days`;
  };

  const lastUpdated = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }}>Engagement Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Behavioral tracking and compliance</p>
          </div>
          {facility?.logo_url && (
            <img src={facility.logo_url} alt={facility.facility_name} className="h-10 w-auto" />
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-3 h-3 rounded-full" style={{ background: getStatusColor() }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Status: {getStatusText()}
          </span>
        </div>
      </div>

      <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        {/* Engagement Metrics */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Engagement Streak</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{streak}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Days Consecutive</p>
            </div>

            <div className="card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Compliance Rate</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{engagementCompliance}%</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Last 7 Days</p>
            </div>

            <div className="card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Phase Progress</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{phaseProgress}%</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>90-Day Map</p>
            </div>

            <div className="card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Meetings Attended</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{meetingCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This Week</p>
            </div>
          </div>
          <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Last Updated: {lastUpdated}</p>
        </div>

        {/* Daily Check-In CTA */}
        {!hasCheckedInToday ? (
          <Link to={createPageUrl("DailyCheckIn")}>
            <div className="card text-center" style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}>
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--primary)' }} strokeWidth={2} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Complete Daily Check-In</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Required for compliance tracking</p>
            </div>
          </Link>
        ) : (
          <div className="card text-center" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
            <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: '#22c55e' }} strokeWidth={2} />
            <h3 style={{ color: '#22c55e', marginBottom: '4px' }}>Check-In Completed</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Next check-in available tomorrow</p>
          </div>
        )}

        {/* Quick Access */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Access</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to={createPageUrl("ReintegrationMap")}>
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)', borderRadius: 'var(--radius)' }}>
                  <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>90-Day Reintegration Map</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View structured task progression</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("ForwardPlan")}>
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(74,144,226,0.15)', borderRadius: 'var(--radius)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Forward Plan</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>5-Year Stability Roadmap</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("ParticipantProgress")}>
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)', borderRadius: 'var(--radius)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#60a5fa' }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>View Progress Report</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Engagement trends and history</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("ResourceDirectory")}>
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)', borderRadius: 'var(--radius)' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#60a5fa' }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Resource Directory</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Employment, housing, benefits</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("ParticipantMessages")}>
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', borderRadius: 'var(--radius)' }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#22c55e' }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Counselor Messages</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View communications</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="p-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-5 h-5" strokeWidth={2} />
            Emergency Contacts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="tel:911" className="block p-3 font-medium text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}>
              911 — Emergency Services
            </a>
            <a href="tel:988" className="block p-3 font-medium text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}>
              988 — Crisis Lifeline
            </a>
            {facility?.crisis_phone && (
              <a href={`tel:${facility.crisis_phone}`} className="block p-3 font-medium text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}>
                {facility.crisis_phone} — {facility.facility_name}
              </a>
            )}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-4 text-xs" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>Important Notice</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            This platform tracks behavioral engagement only. It does not provide medical advice, treatment, or clinical services. For medical emergencies, call 911 immediately.
          </p>
        </div>

        {/* Footer */}
        {facility && (
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by Unbound
          </p>
        )}
      </div>
    </div>
  );
}