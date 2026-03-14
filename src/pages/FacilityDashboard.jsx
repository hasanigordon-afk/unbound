import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, AlertTriangle, Settings, UserPlus, FileText, MessageSquare, Calendar, Target, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessagingPanel from "../components/counselor/MessagingPanel";
import MeetingScheduler from "../components/counselor/MeetingScheduler";
import CustomTaskManager from "../components/counselor/CustomTaskManager";

const DEMO_FACILITY_ID = "69b4c0a624652291a34b228b";

export default function FacilityDashboard() {
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  // Resolve facility ID: from profile, or demo fallback
  const facilityId = counselorProfile?.facility_id || (!user ? DEMO_FACILITY_ID : null);

  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ["facility-obj", facilityId],
    queryFn: async () => {
      const list = await base44.entities.Facility.list();
      return list.find(f => f.id === facilityId) || null;
    },
    enabled: !!facilityId,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["facility-participants", facilityId],
    queryFn: () =>
      facilityId
        ? base44.entities.ParticipantProfile.filter({ facility_id: facilityId })
        : base44.entities.ParticipantProfile.list("-created_date", 20),
    enabled: !!facilityId,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["facility-checkins", facilityId],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: participants.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["facility-alerts-dash", facilityId],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    enabled: !!facilityId,
  });

  const { data: plannedMeetings = [] } = useQuery({
    queryKey: ["planned-meetings-facility", facilityId],
    queryFn: () => base44.entities.PlannedMeeting.list("-created_date", 50),
    enabled: !!facilityId,
  });

  const inviteParticipantMutation = useMutation({
    mutationFn: async () => {
      if (!facilityId || !inviteEmail) return;
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await base44.entities.FacilityInvite.create({
        facility_id: facilityId,
        participant_email: inviteEmail,
        invited_by: user?.email || "admin",
        invite_code: inviteCode,
        status: "pending",
      });
    },
    onSuccess: () => { setShowInviteDialog(false); setInviteEmail(""); },
  });

  const getEngagementStats = () => {
    const last7 = new Date(); last7.setDate(last7.getDate() - 7);
    const participantEmails = participants.map(p => p.participant_email);
    const recentCheckIns = allCheckIns.filter(c => new Date(c.check_in_date) >= last7 && participantEmails.includes(c.participant_email));
    const activeParticipants = new Set(recentCheckIns.map(c => c.participant_email)).size;
    const engagementRate = participants.length > 0 ? Math.round((activeParticipants / participants.length) * 100) : 0;
    const totalExpected = participants.length * 7;
    const checkinCompliance = totalExpected > 0 ? Math.round((recentCheckIns.length / totalExpected) * 100) : 0;
    const highRiskCount = alerts.filter(a => a.risk_level === "high" || a.risk_level === "critical").length;
    const meetingsThisWeek = plannedMeetings.filter(m => {
      const pEmails = participants.map(p => p.participant_email);
      return pEmails.includes(m.participant_email);
    }).length;
    return { totalParticipants: participants.length, activeParticipants, engagementRate, atRiskCount: alerts.length, checkinCompliance, highRiskCount, meetingsThisWeek };
  };

  const exportReport = () => {
    const stats = getEngagementStats();
    const report = { facility: facility?.facility_name, report_date: new Date().toISOString(), participants: stats.totalParticipants, engagement: stats };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `facility-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const isDemo = !user;

  // Show loading only briefly while facility resolves
  if (facilityLoading && facilityId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#4A90E2" }} />
      </div>
    );
  }

  // No facility found at all — show helpful state
  if (!facilityId && user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
        <div className="text-center p-8 max-w-sm">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#8E8E93" }} />
          <p className="font-semibold text-lg mb-2" style={{ color: "#1E1E1E" }}>No facility assigned</p>
          <p className="text-sm" style={{ color: "#8E8E93" }}>Contact your administrator to be linked to a facility.</p>
        </div>
      </div>
    );
  }

  const stats = getEngagementStats();
  const facilityName = facility?.facility_name || "Facility Dashboard";

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "8px 16px", fontSize: 13 }}>
          👁 Demo mode — showing sample facility data.{" "}
          <button onClick={() => base44.auth.redirectToLogin()} style={{ fontWeight: 700, textDecoration: "underline", background: "none", border: "none", color: "#FFF", cursor: "pointer" }}>Sign in</button>{" "}
          to manage your real facility.
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center gap-4 mb-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#EBF5FF" }}>
            <Building2 className="w-5 h-5" style={{ color: "#4A90E2" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>{facilityName}</h1>
            {facility && <p className="text-xs" style={{ color: "#8E8E93" }}>{facility.city}, {facility.state} · {facility.contact_phone}</p>}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-3xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Active Clients", value: stats.activeParticipants, sub: `of ${stats.totalParticipants} total`, color: "#4A90E2", icon: Users },
            { label: "Engagement Rate", value: `${stats.engagementRate}%`, sub: "last 7 days", color: "#22C55E", icon: TrendingUp },
            { label: "Check-in Compliance", value: `${stats.checkinCompliance}%`, sub: "last 7 days", color: "#F59E0B", icon: Calendar },
            { label: "High Risk Clients", value: stats.highRiskCount, sub: `${stats.atRiskCount} total alerts`, color: "#EF4444", icon: AlertTriangle },
            { label: "Meetings Scheduled", value: stats.meetingsThisWeek, sub: "active plans", color: "#8B5CF6", icon: Target },
            { label: "Total Enrolled", value: stats.totalParticipants, sub: "all participants", color: "#6B7280", icon: Users },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.5} />
                <p className="text-xs" style={{ color: "#8E8E93" }}>{s.label}</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#C7C7CC" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setShowInviteDialog(true)} style={{ background: "#4A90E2", color: "#FFF" }}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Participant
          </Button>
          <Button onClick={exportReport} variant="outline" style={{ borderColor: "#D1D1D6", color: "#1E1E1E" }}>
            <FileText className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Active Alerts */}
        {alerts.filter(a => a.status === "active").length > 0 && (
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: "#DC2626" }}>
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
              Active Alerts ({alerts.filter(a => a.status === "active").length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.filter(a => a.status === "active").map(alert => (
                <div key={alert.id} className="p-4 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{alert.participant_email}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#DC2626" }}>{alert.alert_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                      {alert.notes && <p className="text-xs mt-1" style={{ color: "#5A5A5A" }}>{alert.notes}</p>}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: alert.risk_level === "high" ? "#EF4444" : "#F59E0B", color: "#FFF" }}>
                      {alert.risk_level?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.filter(a => a.status === "active").length === 0 && (
          <div className="text-center py-6 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <p className="text-sm font-medium" style={{ color: "#16A34A" }}>✓ No high-risk participants currently flagged.</p>
          </div>
        )}

        {/* Tabs: Participants / Messages / Meetings / Tasks */}
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="participants"><Users className="w-3.5 h-3.5 mr-1" />Patients</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-3.5 h-3.5 mr-1" />Messages</TabsTrigger>
            <TabsTrigger value="meetings"><Calendar className="w-3.5 h-3.5 mr-1" />Meetings</TabsTrigger>
            <TabsTrigger value="tasks"><Target className="w-3.5 h-3.5 mr-1" />Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-4">
            {participants.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: "#8E8E93" }}>No participants assigned yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {participants.slice(0, 10).map(participant => {
                  const lastCI = allCheckIns.filter(c => c.participant_email === participant.participant_email).sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
                  const daysSince = lastCI ? Math.floor((Date.now() - new Date(lastCI.check_in_date)) / 86400000) : null;
                  const dot = daysSince === null || daysSince > 3 ? "#EF4444" : daysSince > 1 ? "#F59E0B" : "#22C55E";
                  return (
                    <div key={participant.id} className="p-4 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{participant.participant_email}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                            {lastCI ? `Last check-in: ${daysSince === 0 ? "today" : `${daysSince}d ago`}` : "No check-ins yet"}
                          </p>
                        </div>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: dot }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <MessagingPanel counselorEmail={user?.email || "counselor.rivera@integrityrc.org"} facilityId={facilityId} participants={participants} />
          </TabsContent>

          <TabsContent value="meetings" className="mt-4">
            <MeetingScheduler counselorEmail={user?.email || "counselor.rivera@integrityrc.org"} facilityId={facilityId} participants={participants} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <CustomTaskManager counselorEmail={user?.email || "counselor.rivera@integrityrc.org"} facilityId={facilityId} participants={participants} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Participant Email</Label>
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="participant@email.com" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => inviteParticipantMutation.mutate()} disabled={!inviteEmail || inviteParticipantMutation.isPending} className="flex-1" style={{ background: "#4A90E2", color: "#FFF" }}>
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}