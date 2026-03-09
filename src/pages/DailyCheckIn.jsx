import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, Phone } from "lucide-react";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Really rough" },
  { value: 2, emoji: "😕", label: "Struggling" },
  { value: 3, emoji: "😐", label: "Getting by" },
  { value: 4, emoji: "🙂", label: "Doing okay" },
  { value: 5, emoji: "😊", label: "Feeling good" },
];

const MEETING_TYPES = ["AA", "NA", "SMART Recovery", "Virtual", "Other"];

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood_rating: null,
    craving_intensity: 0,
    stress_level: 0,
    attended_meeting: null,
    meeting_type: null,
    connected_with_sponsor: null,
    needs_help: null,
    relapse_risk_flag: false,
    notes: "",
  });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const streak = (() => {
    if (!checkIns.length) return 0;
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((current - d) / 86400000);
      if (diff <= 1) { count++; current = d; }
      else break;
    }
    return count;
  })();

  const submitCheckInMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      await base44.entities.DailyCheckIn.create({
        participant_email: user.email,
        check_in_date: today,
        mood_rating: formData.mood_rating,
        craving_intensity: formData.craving_intensity,
        stress_level: formData.stress_level,
        attended_meeting: formData.attended_meeting,
        meeting_type: formData.attended_meeting ? formData.meeting_type : null,
        connected_with_sponsor: formData.connected_with_sponsor,
        needs_help: formData.needs_help || false,
        relapse_risk_flag: formData.relapse_risk_flag || false,
        notes: formData.notes || null,
      });
      // Run risk detection in background
      base44.functions.invoke("cravingAlertDetection", { participantEmail: user.email }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["daily-checkins"]);
      setStep(7);
      if (formData.needs_help) {
        setTimeout(() => navigate(createPageUrl("UrgentHelp")), 2200);
      }
    },
  });

  const TOTAL_STEPS = 6;

  const canProceed = () => {
    if (step === 1) return formData.mood_rating !== null;
    if (step === 2) return true; // craving + stress sliders always have a value
    if (step === 3) return formData.attended_meeting !== null;
    if (step === 4) return !formData.attended_meeting || formData.meeting_type !== null;
    if (step === 5) return formData.connected_with_sponsor !== null;
    if (step === 6) return formData.needs_help !== null;
    return false;
  };

  const handleNext = () => {
    if (step === 3 && !formData.attended_meeting) { setStep(5); return; }
    if (step === 6) { submitCheckInMutation.mutate(); return; }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 5 && !formData.attended_meeting) { setStep(3); return; }
    setStep(step - 1);
  };

  const BG = "#FAFAFA";
  const CARD_BG = "#FFFFFF";
  const SELECTED_BG = "#EBF5FF";
  const SELECTED_BORDER = "#4A90E2";
  const TEXT = "#1E1E1E";
  const TEXT_MUTED = "#8E8E93";
  const BTN_BG = "#4A90E2";

  // Need-help crisis screen
  if (step === 8) {
    return (
      <div style={{ minHeight: "100vh", background: "#FEF2F2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤝</div>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "8px" }}>You are not alone right now.</h2>
        <p style={{ fontSize: "15px", color: "#5A5A5A", marginBottom: "28px", lineHeight: "1.6", maxWidth: "320px" }}>
          Reaching out is the right move. Let's get you to the right support.
        </p>
        <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <a href="tel:988" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#DC2626", borderRadius: "14px", padding: "18px 20px", textDecoration: "none" }}>
            <Phone className="w-6 h-6" style={{ color: "#FFF", flexShrink: 0 }} strokeWidth={2} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#FFF", fontWeight: "700", fontSize: "16px" }}>Call 988 — Crisis Line</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Free, confidential, 24/7</p>
            </div>
          </a>
          <a href="sms:741741" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#2563EB", borderRadius: "14px", padding: "18px 20px", textDecoration: "none" }}>
            <Phone className="w-6 h-6" style={{ color: "#FFF", flexShrink: 0 }} strokeWidth={2} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#FFF", fontWeight: "700", fontSize: "16px" }}>Text HOME to 741741</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Crisis Text Line — free & anonymous</p>
            </div>
          </a>
          <a href="tel:18006624357" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#EA580C", borderRadius: "14px", padding: "18px 20px", textDecoration: "none" }}>
            <Phone className="w-6 h-6" style={{ color: "#FFF", flexShrink: 0 }} strokeWidth={2} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#FFF", fontWeight: "700", fontSize: "16px" }}>SAMHSA Helpline</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>1-800-662-4357 — Treatment referrals</p>
            </div>
          </a>
          <button
            onClick={() => navigate(createPageUrl("PatientDashboard"))}
            style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "14px", padding: "16px", fontSize: "15px", fontWeight: "600", color: "#1E1E1E", cursor: "pointer", marginTop: "8px" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (step === 7) {
    const newStreak = streak + 1;
    return (
      <div style={{ minHeight: "100vh", background: "#F0FDF4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#15803D", marginBottom: "8px" }}>You showed up today.</h2>
        <p style={{ fontSize: "15px", color: "#16A34A", marginBottom: "8px" }}>
          {newStreak > 1 ? `${newStreak} days in a row. Keep moving forward.` : "That's a real first step. Come back tomorrow."}
        </p>
        <p style={{ fontSize: "14px", color: "#5A5A5A", marginBottom: "32px" }}>
          Progress still counts, even on hard days.
        </p>
        {formData.mood_rating <= 2 && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", maxWidth: "340px" }}>
            <p style={{ fontSize: "14px", color: "#92400E", lineHeight: "1.5" }}>
              Sounds like today was rough. You don't have to carry this alone — your support team is here.
            </p>
            <Link to={createPageUrl("ParticipantMessages")}>
              <button style={{ marginTop: "10px", background: "#EA580C", color: "#FFF", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Message support
              </button>
            </Link>
          </div>
        )}
        <button
          onClick={() => navigate(createPageUrl("Home"))}
          style={{ background: "#16A34A", color: "#FFF", border: "none", borderRadius: "14px", padding: "18px 48px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%", maxWidth: "340px" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: CARD_BG, padding: "20px 20px 16px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: "12px", fontWeight: "700", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
          Daily Check-In
        </p>
        <p style={{ fontSize: "15px", color: "#5A5A5A" }}>
          {streak > 0 ? `🔥 ${streak} days in a row — you're showing up` : "Quick check-in. No wrong answers."}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "16px 20px 0", background: CARD_BG }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i < step ? "#4A90E2" : "#E5E7EB" }} />
          ))}
        </div>
        <p style={{ fontSize: "12px", color: TEXT_MUTED, marginBottom: "16px" }}>
          Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Question area */}
      <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
        <div style={{ maxWidth: "440px", margin: "0 auto" }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                How are you feeling today?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "24px" }}>Wherever you are — that's a valid place to start.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, mood_rating: opt.value })}
                    style={{
                      background: formData.mood_rating === opt.value ? SELECTED_BG : CARD_BG,
                      border: `2px solid ${formData.mood_rating === opt.value ? SELECTED_BORDER : "#E5E7EB"}`,
                      borderRadius: "12px",
                      padding: "14px 6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "26px" }}>{opt.emoji}</span>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: formData.mood_rating === opt.value ? SELECTED_BORDER : TEXT_MUTED, textAlign: "center", lineHeight: "1.2" }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                How are your cravings and stress?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "28px" }}>Slide to where you're at. No judgment — just honest answers.</p>

              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: TEXT }}>Craving Intensity</p>
                  <span style={{
                    background: formData.craving_intensity >= 8 ? "#FEF2F2" : formData.craving_intensity >= 5 ? "#FFFBEB" : "#F0FDF4",
                    color: formData.craving_intensity >= 8 ? "#DC2626" : formData.craving_intensity >= 5 ? "#D97706" : "#16A34A",
                    fontWeight: "700", fontSize: "18px", padding: "4px 12px", borderRadius: "8px"
                  }}>
                    {formData.craving_intensity}/10
                  </span>
                </div>
                <input type="range" min="0" max="10" step="1"
                  value={formData.craving_intensity}
                  onChange={e => setFormData({ ...formData, craving_intensity: parseInt(e.target.value) })}
                  style={{ width: "100%", accentColor: formData.craving_intensity >= 8 ? "#EF4444" : formData.craving_intensity >= 5 ? "#F59E0B" : "#4A90E2", height: "6px", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: TEXT_MUTED }}>None</span>
                  <span style={{ fontSize: "11px", color: TEXT_MUTED }}>Severe</span>
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: TEXT }}>Stress Level</p>
                  <span style={{
                    background: formData.stress_level >= 8 ? "#FEF2F2" : formData.stress_level >= 5 ? "#FFFBEB" : "#F0FDF4",
                    color: formData.stress_level >= 8 ? "#DC2626" : formData.stress_level >= 5 ? "#D97706" : "#16A34A",
                    fontWeight: "700", fontSize: "18px", padding: "4px 12px", borderRadius: "8px"
                  }}>
                    {formData.stress_level}/10
                  </span>
                </div>
                <input type="range" min="0" max="10" step="1"
                  value={formData.stress_level}
                  onChange={e => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                  style={{ width: "100%", accentColor: formData.stress_level >= 8 ? "#EF4444" : formData.stress_level >= 5 ? "#F59E0B" : "#4A90E2", height: "6px", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: TEXT_MUTED }}>Calm</span>
                  <span style={{ fontSize: "11px", color: TEXT_MUTED }}>Extreme</span>
                </div>
              </div>

              {formData.craving_intensity >= 8 && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "12px", padding: "14px 16px" }}>
                  <p style={{ fontSize: "13px", color: "#DC2626", fontWeight: "600", marginBottom: "4px" }}>That's a high craving score.</p>
                  <p style={{ fontSize: "13px", color: "#5A5A5A", lineHeight: "1.5" }}>
                    Your support team will be notified. You don't have to handle this alone.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                Did you go to a meeting today?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "24px" }}>AA, NA, SMART Recovery, or anything similar.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { val: true, label: "Yes, I went", sub: "Good. Any support counts." },
                  { val: false, label: "Not today", sub: "That's okay. Tomorrow is another chance." },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setFormData({ ...formData, attended_meeting: opt.val, meeting_type: opt.val ? formData.meeting_type : null })}
                    style={{ background: formData.attended_meeting === opt.val ? SELECTED_BG : CARD_BG, border: `2px solid ${formData.attended_meeting === opt.val ? SELECTED_BORDER : "#E5E7EB"}`, borderRadius: "14px", padding: "18px 20px", textAlign: "left", cursor: "pointer" }}>
                    <p style={{ fontWeight: "700", fontSize: "16px", color: TEXT, marginBottom: "3px" }}>{opt.label}</p>
                    <p style={{ fontSize: "13px", color: TEXT_MUTED }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                What kind of meeting?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "24px" }}>Pick whichever fits best.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {MEETING_TYPES.map(type => (
                  <button key={type} onClick={() => setFormData({ ...formData, meeting_type: type })}
                    style={{ background: formData.meeting_type === type ? SELECTED_BG : CARD_BG, border: `2px solid ${formData.meeting_type === type ? SELECTED_BORDER : "#E5E7EB"}`, borderRadius: "12px", padding: "16px", fontWeight: "600", fontSize: "15px", color: formData.meeting_type === type ? SELECTED_BORDER : TEXT, cursor: "pointer" }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                Did you connect with someone today?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "24px" }}>A sponsor, mentor, counselor, or someone you trust.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { val: true, label: "Yes, I reached out", sub: "Connection matters. Good work." },
                  { val: false, label: "Not today", sub: "Try sending a quick message tomorrow." },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setFormData({ ...formData, connected_with_sponsor: opt.val })}
                    style={{ background: formData.connected_with_sponsor === opt.val ? SELECTED_BG : CARD_BG, border: `2px solid ${formData.connected_with_sponsor === opt.val ? SELECTED_BORDER : "#E5E7EB"}`, borderRadius: "14px", padding: "18px 20px", textAlign: "left", cursor: "pointer" }}>
                    <p style={{ fontWeight: "700", fontSize: "16px", color: TEXT, marginBottom: "3px" }}>{opt.label}</p>
                    <p style={{ fontSize: "13px", color: TEXT_MUTED }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: TEXT, marginBottom: "6px" }}>
                Do you need any support right now?
              </h2>
              <p style={{ fontSize: "14px", color: TEXT_MUTED, marginBottom: "24px" }}>It's okay either way. We just want to make sure you're alright.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {[
                  { val: false, label: "I'm okay right now", sub: "Good to hear." },
                  { val: true, label: "I could use some support", sub: "We'll connect you with the right help." },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setFormData({ ...formData, needs_help: opt.val })}
                    style={{
                      background: formData.needs_help === opt.val ? (opt.val ? "#FEF2F2" : SELECTED_BG) : CARD_BG,
                      border: `2px solid ${formData.needs_help === opt.val ? (opt.val ? "#FCA5A5" : SELECTED_BORDER) : "#E5E7EB"}`,
                      borderRadius: "14px", padding: "18px 20px", textAlign: "left", cursor: "pointer"
                    }}>
                    <p style={{ fontWeight: "700", fontSize: "16px", color: TEXT, marginBottom: "3px" }}>{opt.label}</p>
                    <p style={{ fontSize: "13px", color: TEXT_MUTED }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: TEXT_MUTED, marginBottom: "8px" }}>Anything on your mind? (optional)</p>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Say whatever you need to say..."
                  rows={3}
                  style={{ width: "100%", background: CARD_BG, border: "1px solid #E5E7EB", borderRadius: "12px", padding: "14px", fontSize: "14px", color: TEXT, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: CARD_BG, borderTop: "1px solid #E5E7EB", padding: "16px 20px", display: "flex", gap: "10px" }}>
        {step > 1 && (
          <button onClick={handleBack}
            style={{ background: "#F5F5F7", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "16px 20px", fontSize: "15px", fontWeight: "600", color: "#5A5A5A", cursor: "pointer" }}>
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed() || submitCheckInMutation.isPending}
          style={{
            flex: 1, background: canProceed() ? BTN_BG : "#E5E7EB", border: "none", borderRadius: "12px",
            padding: "16px", fontSize: "16px", fontWeight: "700",
            color: canProceed() ? "#FFF" : "#9CA3AF", cursor: canProceed() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {submitCheckInMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 5 ? "Done →" : "Keep Going →"}
        </button>
      </div>
    </div>
  );
}