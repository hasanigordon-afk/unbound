import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download, AlertTriangle, CheckCircle2, Users, Loader2, RefreshCw, Shield } from "lucide-react";

const RISK_COLOR = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444", critical: "#DC2626" };

export default function ComplianceReports() {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [generating, setGenerating] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["all-participants-compliance"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 50),
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["compliance-reports", selectedEmail],
    queryFn: () => selectedEmail
      ? base44.entities.ComplianceReport.filter({ participant_email: selectedEmail })
      : base44.entities.ComplianceReport.list("-created_date", 30),
  });

  const generateMutation = useMutation({
    mutationFn: async (email) => {
      setGenerating(email);
      const res = await base44.functions.invoke("serviceBridge", {
        module: "compliance", action: "generate_weekly_report",
        payload: { participant_email: email, facility_id: profiles.find(p => p.participant_email === email)?.facility_id },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["compliance-reports"]);
      setGenerating(null);
    },
    onError: () => setGenerating(null),
  });

  const exportCSV = (report) => {
    const rows = [
      ["Field", "Value"],
      ["Participant", report.participant_email],
      ["Period", `${report.report_period_start} to ${report.report_period_end}`],
      ["Check-ins", report.checkin_count],
      ["Meetings", report.meeting_count],
      ["Sponsor Contacts", report.sponsor_contact_count],
      ["Compliance %", `${report.compliance_percentage}%`],
      ["Risk Score", report.risk_score],
      ["Avg Craving", report.avg_craving_level],
      ["Avg Mood", report.avg_mood_rating],
      ["Relapse Alerts", report.relapse_alert_count],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `compliance-${report.participant_email}-${report.report_period_end}.csv`;
    a.click();
  };

  const isDemo = !user;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "8px 16px", fontSize: 13 }}>
          👁 Demo mode — sign in as a counselor or probation officer to generate real reports.
        </div>
      )}
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Compliance Reports</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Weekly recovery compliance and risk monitoring</p>
          </div>
          <Shield className="w-6 h-6" style={{ color: "#4A90E2" }} />
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Participant list */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Select Participant</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedEmail(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: !selectedEmail ? "#1E1E1E" : "#FFF", color: !selectedEmail ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
              All Reports
            </button>
            {profiles.slice(0, 8).map(p => (
              <button key={p.id} onClick={() => setSelectedEmail(p.participant_email)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: selectedEmail === p.participant_email ? "#4A90E2" : "#FFF", color: selectedEmail === p.participant_email ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
                {p.participant_email.split("@")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Generate reports section */}
        {selectedEmail && (
          <div className="p-4 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>Generate Weekly Report</p>
                <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>Auto-calculates from last 7 days of check-in data</p>
              </div>
              <button
                onClick={() => generateMutation.mutate(selectedEmail)}
                disabled={generating === selectedEmail}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#4A90E2", color: "#FFF" }}>
                {generating === selectedEmail
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><RefreshCw className="w-3.5 h-3.5" /> Generate</>}
              </button>
            </div>
          </div>
        )}

        {/* Reports list */}
        {reportsLoading && <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>}

        {!reportsLoading && reports.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No reports generated yet.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Select a participant and click Generate.</p>
          </div>
        )}

        {reports.map(report => (
          <div key={report.id} className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${RISK_COLOR[report.risk_score > 70 ? "high" : report.risk_score > 40 ? "medium" : "low"]}10`, borderBottom: "1px solid #E5E7EB" }}>
              <div>
                <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>{report.participant_email}</p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>{report.report_period_start} → {report.report_period_end}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${RISK_COLOR[report.risk_score > 70 ? "high" : report.risk_score > 40 ? "medium" : "low"]}20`, color: RISK_COLOR[report.risk_score > 70 ? "high" : report.risk_score > 40 ? "medium" : "low"] }}>
                  RISK {Math.round(report.risk_score)}
                </span>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-0 px-4 py-4">
              {[
                { label: "Check-ins", value: `${report.checkin_count}/7`, ok: report.checkin_count >= 5 },
                { label: "Meetings", value: report.meeting_count, ok: report.meeting_count >= 3 },
                { label: "Sponsor", value: report.sponsor_contact_count, ok: report.sponsor_contact_count >= 2 },
                { label: "Compliance", value: `${report.compliance_percentage}%`, ok: report.compliance_percentage >= 70 },
                { label: "Avg Craving", value: report.avg_craving_level?.toFixed(1), ok: report.avg_craving_level < 5 },
                { label: "Relapse Flags", value: report.relapse_alert_count, ok: report.relapse_alert_count === 0 },
              ].map(m => (
                <div key={m.label} className="text-center py-2">
                  <p className="text-lg font-bold" style={{ color: m.ok ? "#22C55E" : "#EF4444" }}>{m.value}</p>
                  <p className="text-[10px]" style={{ color: "#8E8E93" }}>{m.label}</p>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <button onClick={() => exportCSV(report)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#F0F4FA", color: "#4A90E2", border: "1px solid #C7D7F0" }}>
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}