import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, TrendingUp, Calendar, MessageSquare, Flag,
  CheckCircle, AlertTriangle, BookOpen, FileText
} from "lucide-react";
import WeeklySummaryModal from "./WeeklySummaryModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

const MOOD_LABELS = { 1: "Very Low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Great" };
const CRAVING_LABELS = { 1: "None", 2: "Mild", 3: "Moderate", 4: "Strong", 5: "Severe" };

function StatBox({ label, value, color = "#1E1E1E", bg = "#F7F7F8" }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: bg }}>
      <p className="text-2xl font-bold" style={{ color }}>{value ?? "—"}</p>
      <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{label}</p>
    </div>
  );
}

export default function AftercareClientDetail({ metrics, counselorEmail, onBack }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const queryClient = useQueryClient();

  const messageMutation = useMutation({
    mutationFn: (content) =>
      base44.entities.CounselorMessage.create({
        facility_id: "aftercare",
        counselor_email: counselorEmail,
        participant_email: metrics.email,
        message: content,
        message_type: "message",
      }),
    onSuccess: () => {
      setMessage("");
      setSending(false);
    },
  });

  const flagMutation = useMutation({
    mutationFn: () =>
      base44.entities.EngagementAlert.create({
        participant_email: metrics.email,
        alert_type: "composite_high_risk",
        alert_date: new Date().toISOString().split("T")[0],
        risk_score: 80,
        risk_level: "high",
        status: "active",
        contributing_factors: [
          metrics.missedCheckIns && "Missed check-ins",
          metrics.highCravings && "High cravings",
          metrics.noMeetings && "No meetings",
        ].filter(Boolean),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftercare-alerts"] }),
  });

  const { profile, checkIns } = metrics;
  const recent = checkIns.slice(0, 14);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-3" style={{ color: "#4A90E2" }}>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Clients
        </button>
        <h2 className="text-lg font-semibold" style={{ color: "#1E1E1E" }}>{metrics.email}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {profile.program_type && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EBF3FD", color: "#4A90E2" }}>
              {profile.program_type.replace(/_/g, " ")}
            </span>
          )}
          {profile.discharge_date && (
            <span className="text-xs" style={{ color: "#8E8E93" }}>
              Discharged: {profile.discharge_date}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Alert Banner */}
        {(metrics.missedCheckIns || metrics.highCravings || metrics.noMeetings) && (
          <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#EF4444" }}>Alerts Active</p>
              <ul className="text-xs space-y-0.5" style={{ color: "#5A5A5A" }}>
                {metrics.missedCheckIns && <li>• Missed 3 or more check-ins</li>}
                {metrics.highCravings && <li>• High craving intensity reported</li>}
                {metrics.noMeetings && <li>• No meeting attendance this week</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Engagement (Last 7 Days)</p>
          <div className="grid grid-cols-4 gap-2">
            <StatBox label="Eng. Score" value={metrics.engagementScore} color="#4A90E2" bg="#EBF3FD" />
            <StatBox label="Meetings" value={metrics.weeklyMeetings} color="#22C55E" bg="#F0FDF4" />
            <StatBox label="Avg Mood" value={metrics.avgMood} color="#F59E0B" bg="#FFFBEB" />
            <StatBox label="Avg Craving" value={metrics.avgCraving} color={parseFloat(metrics.avgCraving) >= 4 ? "#EF4444" : "#6366F1"} bg="#F5F3FF" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-xs" style={{ color: "#8E8E93" }}>Sobriety Streak</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#22C55E" }}>
              {metrics.sobrietyDays !== null ? `${metrics.sobrietyDays}d` : "—"}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-xs" style={{ color: "#8E8E93" }}>Last Check-In</p>
            <p className="text-sm font-semibold mt-1" style={{ color: "#1E1E1E" }}>
              {metrics.lastCheckIn || "Never"}
            </p>
            {metrics.lastCheckIn && (
              <p className="text-xs" style={{ color: "#8E8E93" }}>{metrics.daysSinceCheckIn} days ago</p>
            )}
          </div>
        </div>

        {/* Recent Check-In History */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>
            Recent Check-Ins
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "#8E8E93" }}>No check-ins recorded</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{ background: "#FFF", border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: c.mood_rating >= 4 ? "#DCFCE7" : c.mood_rating <= 2 ? "#FEE2E2" : "#FFF7ED", color: c.mood_rating >= 4 ? "#16A34A" : c.mood_rating <= 2 ? "#DC2626" : "#D97706" }}
                  >
                    {c.mood_rating}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#1E1E1E" }}>{c.check_in_date}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                      {c.attended_meeting && <span>✓ Meeting</span>}
                      {c.connected_with_sponsor && <span>✓ Sponsor</span>}
                      {c.craving_intensity && <span>Craving: {c.craving_intensity}/5</span>}
                    </div>
                    {c.notes && <p className="text-xs mt-1 truncate" style={{ color: "#5A5A5A" }}>{c.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counselor Actions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Counselor Actions</p>
          <div className="p-4 rounded-xl space-y-3" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message or recommendation for this client…"
              rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg resize-none"
              style={{ background: "#F7F7F8", border: "1px solid #E5E7EB", color: "#1E1E1E", outline: "none" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setSending(true); messageMutation.mutate(message); }}
                disabled={!message.trim() || sending}
                className="flex-1 text-sm font-medium py-2.5 rounded-lg"
                style={{ background: "#4A90E2", color: "#FFF", opacity: !message.trim() ? 0.5 : 1 }}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                Send Message
              </button>
              <button
                onClick={() => flagMutation.mutate()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
              >
                <Flag className="w-3.5 h-3.5" />
                Flag
              </button>
            </div>

            <Link
              to={createPageUrl("FindHelpNow")}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "#F0F0F3", color: "#1E1E1E" }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Recommend Resources
            </Link>

            <button
              onClick={() => setShowSummaryModal(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "#EBF3FD", color: "#4A90E2", border: "1px solid #C7D7F0" }}
            >
              <FileText className="w-3.5 h-3.5" />
              Weekly PDF Summary
            </button>
          </div>
        </div>
      </div>

      {showSummaryModal && (
        <WeeklySummaryModal
          metrics={metrics}
          counselorEmail={counselorEmail}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}