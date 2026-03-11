import React, { useState, useEffect, useRef } from "react";
import { Heart, Wind, Eye, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const GROUNDING_STEPS = [
  { num: 5, sense: "See", instruction: "Name 5 things you can see right now", icon: "👁️" },
  { num: 4, sense: "Touch", instruction: "Name 4 things you can physically feel", icon: "🤲" },
  { num: 3, sense: "Hear", instruction: "Name 3 things you can hear", icon: "👂" },
  { num: 2, sense: "Smell", instruction: "Name 2 things you can smell", icon: "👃" },
  { num: 1, sense: "Taste", instruction: "Name 1 thing you can taste", icon: "👅" },
];

function BreathingCircle({ phase }) {
  const scale = phase === "inhale" ? 1.6 : phase === "hold" ? 1.6 : 1;
  const label = phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, #A7F3D0, #6EE7B7)",
        boxShadow: "0 0 0 24px rgba(110,231,183,0.15), 0 0 0 48px rgba(110,231,183,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${scale})`,
        transition: "transform 4s ease-in-out",
      }}>
        <Wind className="w-8 h-8" style={{ color: "#065F46" }} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: "#065F46", marginTop: 32 }}>{label}</p>
    </div>
  );
}

export default function EmergencyCalmSection() {
  const [activated, setActivated] = useState(false);
  const [phase, setPhase] = useState("inhale");
  const [groundStep, setGroundStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const breathRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profile } = useQuery({
    queryKey: ["member-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
    select: d => d?.[0],
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones-emergency", user?.email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  useEffect(() => {
    if (!activated) return;
    const breathPhases = ["inhale", "hold", "exhale", "hold"];
    const durations = [4000, 2000, 4000, 2000];
    let i = 0;
    const cycle = () => {
      setPhase(breathPhases[i % 4]);
      breathRef.current = setTimeout(cycle, durations[i % 4]);
      i++;
    };
    cycle();
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { clearTimeout(breathRef.current); clearInterval(intervalRef.current); };
  }, [activated]);

  const goals = milestones.filter(m => !m.completed).slice(0, 2);

  if (!activated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 380 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🆘</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1A3C2E", marginBottom: 8 }}>Feeling overwhelmed?</h2>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
            This will start a calming sequence — breathing, grounding, and reminders that you're stronger than this moment.
          </p>
          <button
            onClick={() => setActivated(true)}
            style={{
              background: "linear-gradient(135deg, #DC2626, #B91C1C)",
              color: "#FFF", border: "none", borderRadius: 20, padding: "22px 48px",
              fontSize: 20, fontWeight: 800, cursor: "pointer", width: "100%",
              boxShadow: "0 8px 32px rgba(220,38,38,0.3)",
            }}
          >
            🔴 Activate Emergency Calm
          </button>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 14 }}>You got this. Press when you need it.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1A3C2E" }}>🧘 Emergency Calm Active</h2>
        <div style={{ background: "#D1FAE5", borderRadius: 12, padding: "6px 14px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</p>
        </div>
      </div>

      {/* Breathing */}
      <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 20, padding: "24px", marginBottom: 16, textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Step 1 — Breathe</p>
        <BreathingCircle phase={phase} />
        <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>4 counts in · 2 hold · 4 counts out</p>
      </div>

      {/* Grounding */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "20px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Step 2 — Ground Yourself (5-4-3-2-1)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GROUNDING_STEPS.map((step, i) => (
            <div
              key={i}
              onClick={() => setGroundStep(Math.max(groundStep, i + 1))}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 12, cursor: "pointer",
                background: groundStep > i ? "#DBEAFE" : "#F8FAFC",
                border: `1px solid ${groundStep > i ? "#93C5FD" : "#E5E7EB"}`,
                opacity: groundStep < i ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 22 }}>{step.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>{step.num} things to {step.sense}</p>
                <p style={{ fontSize: 12, color: "#6B7280" }}>{step.instruction}</p>
              </div>
              {groundStep > i && <span style={{ marginLeft: "auto", fontSize: 16 }}>✅</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Goals reminder */}
      <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 20, padding: "20px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Step 3 — Remember Your Why</p>
        <p style={{ fontSize: 15, color: "#92400E", lineHeight: 1.6, marginBottom: 12 }}>
          You are in recovery for a reason. This craving will pass in minutes. You have survived every difficult moment so far.
        </p>
        {goals.length > 0 && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#B45309", marginBottom: 8 }}>Your next goals:</p>
            {goals.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#D97706" }}>🎯</span>
                <p style={{ fontSize: 13, color: "#92400E" }}>{g.milestone_text?.replace(/^(3-Year|1-Year|90-Day):\s*/i, "")}</p>
              </div>
            ))}
          </>
        )}
        {!goals.length && (
          <p style={{ fontSize: 13, color: "#92400E" }}>Every day sober is a victory. You are building something real.</p>
        )}
      </div>

      <button
        onClick={() => { setActivated(false); setPhase("inhale"); setGroundStep(0); setElapsed(0); }}
        style={{ marginTop: 20, width: "100%", background: "none", border: "1px solid #D1D5DB", borderRadius: 12, padding: "12px", color: "#6B7280", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
      >
        End Session
      </button>
    </div>
  );
}