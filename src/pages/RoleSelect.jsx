import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "./utils";
import { Loader2 } from "lucide-react";

const CLIENT_OPTION = {
  id: "client",
  label: "I'm here for myself",
  sub: "Check in daily, find help near you, message your support team, and track your progress.",
  emoji: "🙋",
  color: "#4A90E2",
  bg: "#EFF6FF",
  page: "Home",
};

const PROFESSIONAL_OPTIONS = [
  { id: "counselor",        label: "Counselor",          sub: "Monitor clients, send messages, track progress." },
  { id: "probation_officer",label: "Probation Officer",  sub: "Supervision check-ins, compliance, case notes." },
  { id: "sponsor",          label: "Sponsor",            sub: "Support your sponsee, stay connected." },
  { id: "recovery_coach",   label: "Recovery Coach",     sub: "Coach clients through goals and stability." },
  { id: "case_manager",     label: "Case Manager",       sub: "Track plans, resources, and client needs." },
  { id: "facility_admin",   label: "Facility Admin",     sub: "Manage staff accounts and program overview." },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [showProfessionalExpanded, setShowProfessionalExpanded] = useState(false);

  // Auto-detect role from existing profiles
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { setChecking(false); return; }

        const [counselorProfiles, memberProfiles] = await Promise.all([
          base44.entities.CounselorProfile.filter({ counselor_email: user.email }),
          base44.entities.MemberProfile.filter({ created_by: user.email }),
        ]);

        if (counselorProfiles.length > 0) {
          navigate(createPageUrl("ProfessionalPortal"), { replace: true });
          return;
        }
        if (memberProfiles.length > 0 && memberProfiles[0]?.onboarding_complete) {
          navigate(createPageUrl("Home"), { replace: true });
          return;
        }
      } catch {
        // not logged in, show role select
      }
      setChecking(false);
    })();
  }, [navigate]);

  const handleClient = () => {
    sessionStorage.setItem("unbound_role", "client");
    navigate(createPageUrl("Home"));
  };

  const handleProfessional = (roleId) => {
    sessionStorage.setItem("unbound_role", roleId);
    navigate(createPageUrl("ProfessionalPortal"));
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7F8" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4A90E2" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 16px" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 44, height: 44, borderRadius: "50%", border: "2.5px solid rgba(74,144,226,0.7)" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 44, height: 44, borderRadius: "50%", border: "2.5px solid rgba(212,165,116,0.7)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: "#4A90E2" }} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8E8E93", marginBottom: 8 }}>UNBOUND</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E1E1E", marginBottom: 6 }}>Who's logging in?</h1>
          <p style={{ fontSize: 14, color: "#5A5A5A" }}>Pick the option that fits you.</p>
        </div>

        {/* Client option */}
        <button onClick={handleClient}
          style={{
            width: "100%", textAlign: "left", padding: "20px", borderRadius: 16,
            background: CLIENT_OPTION.bg, border: `2px solid ${CLIENT_OPTION.color}`,
            cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12,
          }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: CLIENT_OPTION.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>{CLIENT_OPTION.emoji}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#1E1E1E", marginBottom: 4 }}>{CLIENT_OPTION.label}</p>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{CLIENT_OPTION.sub}</p>
          </div>
          <span style={{ fontSize: 20, color: CLIENT_OPTION.color, alignSelf: "center" }}>›</span>
        </button>

        {/* Professional section */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
          <button
            onClick={() => setShowProfessionalExpanded(!showProfessionalExpanded)}
            style={{
              width: "100%", textAlign: "left", padding: "20px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
            }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>💼</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1E1E1E", marginBottom: 2 }}>I'm a support professional</p>
              <p style={{ fontSize: 13, color: "#64748B" }}>Counselor, officer, sponsor, coach, or admin</p>
            </div>
            <span style={{ fontSize: 18, color: "#94A3B8", transform: showProfessionalExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
          </button>

          {showProfessionalExpanded && (
            <div style={{ borderTop: "1px solid #F1F5F9" }}>
              {PROFESSIONAL_OPTIONS.map((opt, i) => (
                <button key={opt.id} onClick={() => handleProfessional(opt.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 20px",
                    background: "none", border: "none", cursor: "pointer",
                    borderTop: i > 0 ? "1px solid #F8FAFC" : "none",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#1E293B", marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{opt.sub}</p>
                  </div>
                  <span style={{ color: "#CBD5E1", fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 24 }}>
          Unbound — built for people rebuilding their lives
        </p>
      </div>
    </div>
  );
}