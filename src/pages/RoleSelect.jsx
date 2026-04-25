import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "./utils";
import { Loader2 } from "lucide-react";

// Ah Ha brand palette
const C = {
  amber:  "#B8823A",
  green:  "#7A9E7E",
  indigo: "#7B8FA8",
  bg:     "#F7F3EE",
  card:   "#FDFAF6",
  border: "#E8E2D9",
  text:   "#1C1410",
  muted:  "#4A3F35",
  dim:    "#9B8E83",
};

const CLIENT_OPTION = {
  id: "client",
  label: "I'm here for myself",
  sub: "Check in daily, find help near you, message your support team, and track your progress.",
  emoji: "🙋",
  color: C.amber,
  bg: "rgba(184,130,58,0.08)",
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

  const handleClient = async () => {
    sessionStorage.setItem("unbound_role", "client");
    try { await base44.auth.updateMe({ role: "client" }); } catch {}
    navigate(createPageUrl("Home"));
  };

  const handleSupportUser = async () => {
    sessionStorage.setItem("unbound_role", "support_user");
    try { await base44.auth.updateMe({ role: "support_user" }); } catch {}
    navigate("/SupportUserDashboard");
  };

  const handleProfessional = (roleId) => {
    sessionStorage.setItem("unbound_role", roleId);
    navigate(createPageUrl("ProfessionalPortal"));
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.amber }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 700, color: C.amber, letterSpacing: "-0.02em", lineHeight: 1 }}>Ah Ha</span>
            <span style={{ fontSize: 12, color: C.dim, fontWeight: 500 }}>LLC</span>
          </div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Who's logging in?</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Pick the option that fits you.</p>
        </div>

        {/* Client option */}
        <button onClick={handleClient}
          style={{
            width: "100%", textAlign: "left", padding: "20px", borderRadius: 16,
            background: CLIENT_OPTION.bg, border: `1.5px solid ${CLIENT_OPTION.color}`,
            cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12,
          }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: CLIENT_OPTION.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>{CLIENT_OPTION.emoji}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>{CLIENT_OPTION.label}</p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{CLIENT_OPTION.sub}</p>
          </div>
          <span style={{ fontSize: 20, color: CLIENT_OPTION.color, alignSelf: "center" }}>›</span>
        </button>

        {/* Support User option */}
        <button onClick={handleSupportUser}
          style={{
            width: "100%", textAlign: "left", padding: "20px", borderRadius: 16,
            background: "rgba(122,158,126,0.08)", border: `1.5px solid ${C.green}`,
            cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12,
          }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>🤝</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>I'm a Support Person</p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Sponsor, coach, counselor, or family member. View client progress with their consent.</p>
          </div>
          <span style={{ fontSize: 20, color: C.green, alignSelf: "center" }}>›</span>
        </button>

        {/* Professional / Facility section */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <button
            onClick={() => setShowProfessionalExpanded(!showProfessionalExpanded)}
            style={{
              width: "100%", textAlign: "left", padding: "20px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
            }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(123,143,168,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>💼</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 2 }}>Facility / Clinical Staff</p>
              <p style={{ fontSize: 13, color: C.muted }}>Counselor portal, compliance, EHR, billing</p>
            </div>
            <span style={{ fontSize: 18, color: C.dim, transform: showProfessionalExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
          </button>

          {showProfessionalExpanded && (
            <div style={{ borderTop: `1px solid ${C.border}` }}>
              {PROFESSIONAL_OPTIONS.map((opt, i) => (
                <button key={opt.id} onClick={() => handleProfessional(opt.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 20px",
                    background: "none", border: "none", cursor: "pointer",
                    borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{opt.sub}</p>
                  </div>
                  <span style={{ color: C.dim, fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 24 }}>
          Ah Ha — built for people rebuilding their lives
        </p>
      </div>
    </div>
  );
}