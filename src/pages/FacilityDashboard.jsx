import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, AlertTriangle, Settings, UserPlus, FileText, MessageSquare, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import MessagingPanel from "../components/counselor/MessagingPanel";
import MeetingScheduler from "../components/counselor/MeetingScheduler";
import CustomTaskManager from "../components/counselor/CustomTaskManager";

export default function FacilityDashboard() {
  const queryClient = useQueryClient();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

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

  const { data: settings } = useQuery({
    queryKey: ["facility-settings", facility?.id],
    queryFn: async () => {
      const settingsList = await base44.entities.FacilitySettings.filter({ facility_id: facility.id });
      return settingsList[0];
    },
    enabled: !!facility?.id,
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

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings) => {
      await base44.entities.FacilitySettings.update(settings.id, updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["facility-settings"]);
      setShowSettingsDialog(false);
    },
  });

  const inviteParticipantMutation = useMutation({
    mutationFn: async () => {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await base44.entities.FacilityInvite.create({
        facility_id: facility.id,
        participant_email: inviteEmail,
        invited_by: user.email,
        invite_code: inviteCode,
        status: "pending",
      });
    },
    onSuccess: () => {
      setShowInviteDialog(false);
      setInviteEmail("");
    },
  });

  const { data: clientCheckIns = [] } = useQuery({
    queryKey: ["facility-client-checkins", facility?.id],
    queryFn: () => base44.entities.ClientCheckins.list("-date", 1000),
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: meetingAttendance = [] } = useQuery({
    queryKey: ["facility-meeting-attendance", facility?.id],
    queryFn: () => base44.entities.MeetingAttendance.list("-created_date", 500),
    enabled: !!facility?.id,
  });

  const getEngagementStats = () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const participantEmails = participants.map(p => p.participant_email);

    const recentCheckIns = allCheckIns.filter(c => new Date(c.created_date) >= last7Days);
    const activeParticipants = new Set(recentCheckIns.map(c => c.participant_email)).size;
    const engagementRate = participants.length > 0 ? Math.round((activeParticipants / participants.length) * 100) : 0;

    // Average engagement score from ClientCheckins
    const recentClientCheckIns = clientCheckIns.filter(c =>
      participantEmails.includes(c.client_id || c.participant_email) &&
      new Date(c.date) >= last7Days
    );
    const avgEngagement = recentClientCheckIns.length
      ? Math.round(recentClientCheckIns.reduce((s, c) => s + (c.engagement_score || 100), 0) / recentClientCheckIns.length)
      : null;

    // Check-in compliance: days with a check-in / (7 * total clients)
    const totalExpected = participants.length * 7;
    const checkinCompliance = totalExpected > 0
      ? Math.round((recentCheckIns.length / totalExpected) * 100)
      : 0;

    // High risk clients
    const highRiskCount = alerts.filter(a =>
      (a.risk_level === "high" || a.risk_level === "critical") && a.status === "active"
    ).length;

    // Meetings logged this week
    const meetingsThisWeek = meetingAttendance.filter(a =>
      new Date(a.created_date) >= last7Days &&
      (participantEmails.includes(a.participant_email) || participantEmails.includes(a.created_by))
    ).length;

    return {
      totalParticipants: participants.length,
      activeParticipants,
      engagementRate,
      atRiskCount: alerts.length,
      avgEngagement,
      checkinCompliance,
      highRiskCount,
      meetingsThisWeek,
    };
  };

  const exportReport = () => {
    const report = {
      facility: facility?.facility_name,
      report_date: new Date().toISOString(),
      participants: participants.length,
      engagement: getEngagementStats(),
      checkins_last_30_days: allCheckIns.filter(c => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(c.created_date) >= thirtyDaysAgo;
      }).length,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facility-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <div className="text-center">
          <p style={{ color: '#ffffff' }}>No facility assigned. Contact administrator.</p>
        </div>
      </div>
    );
  }

  const stats = getEngagementStats();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-4 mb-4">
          {facility.logo_url && (
            <img src={facility.logo_url} alt={facility.facility_name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>{facility.facility_name}</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Facility Dashboard</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: '#60a5fa' }} strokeWidth={1.5} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Active Clients</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#60a5fa' }}>{stats.activeParticipants}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>of {stats.totalParticipants} total</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} strokeWidth={1.5} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Avg Engagement</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>
              {stats.avgEngagement !== null ? stats.avgEngagement : '—'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>score out of 100</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" style={{ color: '#fbbf24' }} strokeWidth={1.5} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Check-in Compliance</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{stats.checkinCompliance}%</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>last 7 days</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} strokeWidth={1.5} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>High Risk Clients</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>{stats.highRiskCount}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{stats.atRiskCount} total alerts</p>
          </div>

          <div className="p-4 rounded-xl col-span-2 md:col-span-2" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: '#a78bfa' }} strokeWidth={1.5} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Meetings Logged This Week</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#a78bfa' }}>{stats.meetingsThisWeek}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>across all participants</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowInviteDialog(true)}
            style={{ background: '#fbbf24', color: '#0f1628' }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Participant
          </Button>
          <Button
            onClick={exportReport}
            variant="outline"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <Link to={createPageUrl("ComplianceReports")}>
          <Button
            className="w-full"
            variant="outline"
            style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Compliance Reports
          </Button>
        </Link>

        {/* Settings Link */}
        <button
          onClick={() => setShowSettingsDialog(true)}
          className="w-full p-5 rounded-xl text-left hover:opacity-90 transition-opacity"
          style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', borderRadius: 'var(--radius)' }}>
              <Settings className="w-6 h-6" style={{ color: 'var(--secondary)' }} strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Facility Settings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure features and preferences</p>
            </div>
          </div>
        </button>

        {/* At Risk Alerts */}
        {alerts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: '#ef4444' }}>
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
              At-Risk Participants
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map(alert => (
                <div key={alert.id} className="p-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{alert.participant_email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.alert_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication & Task Management Tabs */}
        <div>
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full grid-cols-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <TabsTrigger value="participants" style={{ color: 'var(--text-secondary)' }}>
                <Users className="w-4 h-4 mr-2" strokeWidth={2} />
                Participants
              </TabsTrigger>
              <TabsTrigger value="messages" style={{ color: 'var(--text-secondary)' }}>
                <MessageSquare className="w-4 h-4 mr-2" strokeWidth={2} />
                Messages
              </TabsTrigger>
              <TabsTrigger value="meetings" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-4 h-4 mr-2" strokeWidth={2} />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="tasks" style={{ color: 'var(--text-secondary)' }}>
                <Target className="w-4 h-4 mr-2" strokeWidth={2} />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" style={{ marginTop: '16px' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Recent Participants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {participants.slice(0, 10).map(participant => {
                  const lastCheckIn = allCheckIns.find(c => c.participant_email === participant.participant_email);
                  const daysSince = lastCheckIn ? Math.floor((Date.now() - new Date(lastCheckIn.created_date)) / (1000 * 60 * 60 * 24)) : null;
                  
                  return (
                    <div key={participant.id} className="card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{participant.participant_email}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {lastCheckIn ? `Last check-in: ${daysSince} ${daysSince === 1 ? 'day' : 'days'} ago` : 'No check-ins'}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full`} style={{ 
                          background: !daysSince || daysSince > 3 ? '#ef4444' : daysSince > 1 ? 'var(--accent)' : '#22c55e'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <MessagingPanel 
                counselorEmail={user?.email} 
                facilityId={facility?.id} 
                participants={participants} 
              />
            </TabsContent>

            <TabsContent value="meetings" className="mt-4">
              <MeetingScheduler 
                counselorEmail={user?.email} 
                facilityId={facility?.id} 
                participants={participants} 
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <CustomTaskManager 
                counselorEmail={user?.email} 
                facilityId={facility?.id} 
                participants={participants} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Settings Dialog */}
      {settings && (
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#ffffff' }}>Facility Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Welcome Message</Label>
                <Textarea
                  defaultValue={settings.welcome_message}
                  rows={3}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>

              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Alert Threshold (Missed Days)</Label>
                <Input
                  type="number"
                  defaultValue={settings.alert_threshold_days}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>

              <div className="space-y-3">
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Enabled Features</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#ffffff' }}>90-Day Reintegration Map</span>
                  <Switch defaultChecked={settings.enable_reintegration_map} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#ffffff' }}>Messaging</span>
                  <Switch defaultChecked={settings.enable_messaging} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#ffffff' }}>Resource Directory</span>
                  <Switch defaultChecked={settings.enable_resource_directory} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#ffffff' }}>Community Features</span>
                  <Switch defaultChecked={settings.enable_community} />
                </div>
              </div>

              <Button
                onClick={() => setShowSettingsDialog(false)}
                className="w-full"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>Invite Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Participant Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="participant@email.com"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => inviteParticipantMutation.mutate()}
                disabled={!inviteEmail || inviteParticipantMutation.isPending}
                className="flex-1"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}