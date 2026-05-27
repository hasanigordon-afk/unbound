import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import AhHaLogo from "@/components/shared/AhHaLogo";
import { getDashboardPathForRole, normalizeRole, ROLES } from "@/lib/roles";

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

const PRIMARY_OPTIONS = [
  {
    id: ROLES.CLIENT,
    label: "Client",
    sub: "Check in daily, find help near you, message your support team, and track your progress.",
    emoji: "🙋",
    color: C.amber,
    bg: "rgba(184,130,58,0.08)",
  },
  {
    id: ROLES.VETERAN,
    label: "Veteran",
    sub: "Use veteran-specific goals, resource priorities, and service-aware support.",
    emoji: "🎖️",
    color: C.indigo,
    bg: "rgba(123,143,168,0.10)",
  },
];

const SUPPORT_OPTIONS = [
  { id: ROLES.SPONSOR, label: "Sponsor", sub: "Support sponsees through accepted client connections." },
  { id: ROLES.MENTOR, label: "Mentor", sub: "Manage mentee matches, conversations, and availability." },
  { id: ROLES.FAMILY_SUPPORT, label: "Family Support", sub: "View consent-approved family updates and encouragement tools." },
];

const PROFESSIONAL_OPTIONS = [
  { id: ROLES.COUNSELOR, label: "Counselor", sub: "Monitor assigned clients, notes, alerts, and progress." },
  { id: ROLES.PROBATION_OFFICER, label: "Probation Officer", sub: "Supervision check-ins, compliance, appointments, and case notes." },
  { id: ROLES.FACILITY_ADMIN, label: "Facility Admin", sub: "Manage staff accounts, facility reports, and program overview." },
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

        if (user.role && ![ROLES.PARTICIPANT, ROLES.PARTICIPANT_ALT].includes(user.role)) {
          navigate(getDashboardPathForRole(normalizeRole(user.role)), { replace: true });
          return;
        }

        const [counselorProfiles, memberProfiles, mentorProfiles, veteranProfiles, familyContacts] = await Promise.all([
          base44.entities.CounselorProfile.filter({ counselor_email: user.email }),
          base44.entities.MemberProfile.filter({ created_by: user.email }),
          base44.entities.MentorProfile.filter({ created_by: user.email }),
          base44.entities.VeteranProfile.filter({ user_email: user.email }),
          base44.entities.FamilyContact.filter({ contact_email: user.email, is_active: true }),
        ]);

        if (counselorProfiles.length > 0) {
          navigate(getDashboardPathForRole(ROLES.COUNSELOR), { replace: true });
          return;
        }
        if (mentorProfiles.length > 0) {
          navigate(getDashboardPathForRole(ROLES.MENTOR), { replace: true });
          return;
        }
        if (veteranProfiles.length > 0) {
          navigate(getDashboardPathForRole(ROLES.VETERAN), { replace: true });
          return;
        }
        if (familyContacts.length > 0) {
          navigate(getDashboardPathForRole(ROLES.FAMILY_SUPPORT), { replace: true });
          return;
        }
        if (memberProfiles.length > 0 && memberProfiles[0]?.onboarding_complete) {
          navigate(getDashboardPathForRole(ROLES.CLIENT), { replace: true });
          return;
        }
      } catch {
        // not logged in, show role select
      }
      setChecking(false);
    })();
  }, [navigate]);

  const handleRole = async (roleId) => {
    sessionStorage.setItem("unbound_role", roleId);
    try { await base44.auth.updateMe({ role: roleId }); } catch {}
    navigate(getDashboardPathForRole(roleId));
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
          <div style={{ marginBottom: 14 }}>
            <AhHaLogo size={72} layout="column" showWordmark={false} />
          </div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Who's logging in?</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Pick the option that fits you.</p>
        </div>

        {PRIMARY_OPTIONS.map((opt) => (
          <button key={opt.id} onClick={() => handleRole(opt.id)}
            style={{
              width: "100%", textAlign: "left", padding: "20px", borderRadius: 16,
              background: opt.bg, border: `1.5px solid ${opt.color}`,
              cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12,
            }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: opt.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>{opt.emoji}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>{opt.label}</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{opt.sub}</p>
            </div>
            <span style={{ fontSize: 20, color: opt.color, alignSelf: "center" }}>›</span>
          </button>
        ))}

        {/* Support section */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Support roles</p>
            <p style={{ fontSize: 12, color: C.muted }}>Consent-based dashboards for non-clinical supporters.</p>
          </div>
          {SUPPORT_OPTIONS.map((opt, i) => (
            <button key={opt.id} onClick={() => handleRole(opt.id)}
              style={{
                width: "100%", textAlign: "left", padding: "14px 20px",
                background: "none", border: "none", cursor: "pointer",
                borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                display: "flex", alignItems: "center", gap: 12,
              }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 2 }}>{opt.label}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{opt.sub}</p>
              </div>
              <span style={{ color: C.dim, fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>

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
                <button key={opt.id} onClick={() => handleRole(opt.id)}
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