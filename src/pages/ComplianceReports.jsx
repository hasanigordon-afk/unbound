import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ComplianceReports() {
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [reportType, setReportType] = useState("30_day");

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

  const { data: participants = [] } = useQuery({
    queryKey: ["facility-participants", counselorProfile?.facility_id],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: counselorProfile.facility_id }),
    enabled: !!counselorProfile?.facility_id,
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const participant = participants.find(p => p.participant_email === selectedParticipant);
      if (!participant) return;

      const days = reportType === "30_day" ? 30 : reportType === "60_day" ? 60 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const checkIns = await base44.entities.DailyCheckIn.filter({ 
        participant_email: selectedParticipant 
      });
      const recentCheckIns = checkIns.filter(c => 
        new Date(c.check_in_date) >= startDate && new Date(c.check_in_date) <= endDate
      );

      const taskCompletions = await base44.entities.TaskCompletion.filter({ 
        participant_email: selectedParticipant 
      });
      const recentTasks = taskCompletions.filter(t => 
        new Date(t.completed_date) >= startDate && new Date(t.completed_date) <= endDate
      );

      const allTasks = await base44.entities.ReintegrationTask.filter({ is_active: true });

      const engagementPercentage = Math.round((recentCheckIns.length / days) * 100);
      const taskCompletionPercentage = allTasks.length > 0 ? 
        Math.round((taskCompletions.length / allTasks.length) * 100) : 0;
      const meetingCount = recentCheckIns.filter(c => c.attended_meeting).length;
      const sponsorCount = recentCheckIns.filter(c => c.connected_with_sponsor).length;

      // Calculate missed intervals
      const missedIntervals = [];
      let consecutiveMissed = 0;
      let missedStart = null;

      for (let i = 0; i < days; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasCheckIn = recentCheckIns.some(c => c.check_in_date === dateStr);

        if (!hasCheckIn) {
          if (consecutiveMissed === 0) missedStart = dateStr;
          consecutiveMissed++;
        } else {
          if (consecutiveMissed >= 3) {
            const missedEnd = new Date(checkDate);
            missedEnd.setDate(missedEnd.getDate() - 1);
            missedIntervals.push(`${missedStart} to ${missedEnd.toISOString().split('T')[0]}`);
          }
          consecutiveMissed = 0;
        }
      }

      const reportData = {
        participant_id: participant.id,
        participant_email: selectedParticipant,
        facility_id: participant.facility_id,
        report_type: reportType,
        report_period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        engagement_percentage: engagementPercentage,
        task_completion_percentage: taskCompletionPercentage,
        meeting_attendance: meetingCount,
        sponsor_engagement: sponsorCount,
        missed_intervals: missedIntervals,
        total_checkins: recentCheckIns.length,
        total_tasks_completed: recentTasks.length,
        generated_date: new Date().toISOString(),
      };

      await base44.entities.ComplianceReport.create({
        participant_email: selectedParticipant,
        facility_id: participant.facility_id,
        report_type: reportType,
        report_period_start: startDate.toISOString().split('T')[0],
        report_period_end: endDate.toISOString().split('T')[0],
        engagement_percentage: engagementPercentage,
        task_completion_percentage: taskCompletionPercentage,
        meeting_attendance_count: meetingCount,
        sponsor_engagement_count: sponsorCount,
        missed_checkin_intervals: missedIntervals,
        resource_access_count: 0,
        generated_by: user.email,
        report_data_json: reportData,
      });

      return reportData;
    },
    onSuccess: (data) => {
      downloadReportCSV(data);
    },
  });

  const downloadReportCSV = (data) => {
    const csv = [
      ["Unbound Compliance Report"],
      [""],
      ["Report Type", data.report_type.replace("_", " ").toUpperCase()],
      ["Participant ID", data.participant_id],
      ["Participant Email", data.participant_email],
      ["Report Period", data.report_period],
      ["Generated Date", new Date(data.generated_date).toLocaleDateString()],
      [""],
      ["ENGAGEMENT METRICS"],
      ["Overall Engagement Rate", `${data.engagement_percentage}%`],
      ["Total Check-Ins", data.total_checkins],
      ["Task Completion Rate", `${data.task_completion_percentage}%`],
      ["Tasks Completed", data.total_tasks_completed],
      ["Meeting Attendance", data.meeting_attendance],
      ["Sponsor Engagement Count", data.sponsor_engagement],
      [""],
      ["MISSED CHECK-IN INTERVALS"],
      ...data.missed_intervals.map(interval => [interval]),
      [""],
      ["DISCLAIMER"],
      ["This document reflects behavioral engagement tracking and resource utilization."],
      ["It does not constitute medical or clinical documentation."],
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${data.participant_email}-${data.report_type}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Compliance Reports</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Generate state-compliant engagement reports</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="p-6 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#ffffff' }}>Generate Report</h3>
          
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Select Participant</Label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <SelectValue placeholder="Choose participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(p => (
                    <SelectItem key={p.id} value={p.participant_email}>
                      {p.participant_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30_day">30-Day Report</SelectItem>
                  <SelectItem value="60_day">60-Day Report</SelectItem>
                  <SelectItem value="90_day">90-Day Report</SelectItem>
                  <SelectItem value="reentry_compliance">Reentry Compliance Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => generateReportMutation.mutate()}
              disabled={!selectedParticipant || generateReportMutation.isPending}
              className="w-full"
              style={{ background: '#fbbf24', color: '#0f1628' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate & Download CSV
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-lg text-xs" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: 'rgba(255,255,255,0.7)' }}>
          <p className="font-semibold mb-2" style={{ color: '#60a5fa' }}>Report Contents:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Participant identification</li>
            <li>Engagement percentage</li>
            <li>Task completion percentage</li>
            <li>Meeting attendance count</li>
            <li>Sponsor engagement frequency</li>
            <li>Missed check-in intervals (3+ consecutive days)</li>
            <li>Resource access logs</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg text-xs" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(255,255,255,0.7)' }}>
          <p className="font-semibold mb-2" style={{ color: '#fbbf24' }}>Compliance Disclaimer:</p>
          <p>This document reflects behavioral engagement tracking and resource utilization. It does not constitute medical or clinical documentation.</p>
        </div>
      </div>
    </div>
  );
}