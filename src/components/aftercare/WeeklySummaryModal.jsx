import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Mail, Download, X, CheckCircle, Loader2 } from "lucide-react";

export default function WeeklySummaryModal({ metrics, counselorEmail, counselorName, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState(metrics.email);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleGenerate = async (sendEmail) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await base44.functions.invoke("generateWeeklySummary", {
        clientEmail: metrics.email,
        recipientEmail: sendEmail ? recipientEmail : metrics.email,
        metrics: {
          engagementScore: metrics.engagementScore,
          engagementLevel: metrics.engagementLevel,
          avgMood: metrics.avgMood,
          avgCraving: metrics.avgCraving,
          weeklyMeetings: metrics.weeklyMeetings,
          sponsorContacts: metrics.sponsorContacts,
          sobrietyDays: metrics.sobrietyDays,
          missedCheckIns: metrics.missedCheckIns,
          highCravings: metrics.highCravings,
          noMeetings: metrics.noMeetings,
        },
        checkIns: metrics.checkIns || [],
        counselorName: counselorName || counselorEmail,
        sendEmail,
      });
      setDownloadUrl(res.data?.file_url || null);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#FFF" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#4A90E2" }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <span className="font-semibold text-white text-sm">Weekly Progress Summary</span>
          </div>
          <button onClick={onClose} className="text-white opacity-80 hover:opacity-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {status === "idle" && (
            <>
              <p className="text-sm mb-1" style={{ color: "#1E1E1E" }}>
                Generate a PDF report for <strong>{metrics.email}</strong> covering the last 7 days.
              </p>
              <p className="text-xs mb-5" style={{ color: "#8E8E93" }}>
                Includes mood trends, engagement score, meeting attendance, and check-in log.
              </p>

              {/* Recipient */}
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#5A5A5A" }}>
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg mb-5"
                style={{ border: "1px solid #D1D1D6", background: "#F7F7F8", color: "#1E1E1E", outline: "none" }}
                placeholder="client@email.com or family@email.com"
              />

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={!recipientEmail.trim()}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{
                    background: recipientEmail.trim() ? "#4A90E2" : "#E5E7EB",
                    color: recipientEmail.trim() ? "#FFF" : "#9CA3AF",
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Generate & Email Report
                </button>
                <button
                  onClick={() => handleGenerate(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: "#F0F0F3", color: "#1E1E1E" }}
                >
                  <Download className="w-4 h-4" />
                  Generate & Download Only
                </button>
              </div>
            </>
          )}

          {status === "loading" && (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: "#4A90E2" }} />
              <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>Generating report…</p>
              <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Building PDF and sending email…</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#F0FDF4" }}>
                <CheckCircle className="w-6 h-6" style={{ color: "#22C55E" }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#1E1E1E" }}>Report Ready</p>
              <p className="text-xs mb-5" style={{ color: "#8E8E93" }}>
                Email sent to <strong>{recipientEmail}</strong>
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold mb-3"
                  style={{ background: "#4A90E2", color: "#FFF", textDecoration: "none" }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#F0F0F3", color: "#5A5A5A" }}
              >
                Close
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6">
              <p className="text-sm font-semibold mb-1" style={{ color: "#EF4444" }}>Something went wrong</p>
              <p className="text-xs mb-5" style={{ color: "#8E8E93" }}>{errorMsg}</p>
              <button
                onClick={() => setStatus("idle")}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#F0F0F3", color: "#1E1E1E" }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}