import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronLeft, AlertTriangle, Lock, Eye, EyeOff, Info, CheckCircle2 } from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";

// ── Privacy toggle definitions ────────────────────────────────────────────────
const SHARING_CONFIG = [
  {
    section: "Care Team",
    icon: "🩺",
    items: [
      {
        key: "share_checkins_counselor",
        label: "Daily Check-In Data",
        description: "Share mood, craving, and meeting attendance with your assigned counselor.",
        default: true,
        critical: false,
      },
      {
        key: "share_goals_counselor",
        label: "Goals & Progress",
        description: "Allow your counselor to view and comment on your recovery goals.",
        default: true,
        critical: false,
      },
      {
        key: "share_journal_counselor",
        label: "Journal Entries",
        description: "Share selected journal entries with your counselor.",
        default: false,
        critical: false,
      },
    ],
  },
  {
    section: "Sponsor / Mentor",
    icon: "🫂",
    items: [
      {
        key: "share_checkins_sponsor",
        label: "Check-In Summaries",
        description: "Let your sponsor see weekly check-in summaries.",
        default: true,
        critical: false,
      },
      {
        key: "share_streak_sponsor",
        label: "Recovery Streak",
        description: "Show your sobriety streak and milestone progress to your sponsor.",
        default: true,
        critical: false,
      },
    ],
  },
  {
    section: "Probation / Legal",
    icon: "⚖️",
    items: [
      {
        key: "share_compliance_probation",
        label: "Compliance Reports",
        description: "Share attendance and program completion reports with your probation officer.",
        default: false,
        critical: true,
        warning: "This is often required by court order. Consult your legal team before disabling.",
      },
    ],
  },
  {
    section: "Crisis & Safety",
    icon: "🆘",
    items: [
      {
        key: "allow_crisis_escalation",
        label: "Crisis Escalation Alerts",
        description: "Allow the system to automatically notify your support contacts if a relapse risk is detected.",
        default: true,
        critical: true,
        locked: true,
        lockReason: "This setting cannot be disabled for your safety. It ensures your care team can reach you in a crisis.",
      },
    ],
  },
  {
    section: "Community",
    icon: "👥",
    items: [
      {
        key: "public_profile",
        label: "Public Creator Profile",
        description: "Allow other community members to find and follow your creator profile.",
        default: false,
        critical: false,
      },
      {
        key: "show_in_peer_directory",
        label: "Peer Directory",
        description: "Appear in the peer support directory so others in recovery can connect with you.",
        default: false,
        critical: false,
      },
    ],
  },
];

function Toggle({ enabled, onChange, locked }) {
  return (
    <button
      onClick={() => !locked && onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: enabled ? (locked ? "#94A3B8" : "#10B981") : "rgba(255,255,255,0.12)",
        border: "none", cursor: locked ? "not-allowed" : "pointer",
        position: "relative", transition: "background 0.2s ease",
        opacity: locked ? 0.7 : 1,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 3, left: enabled ? 23 : 3,
        transition: "left 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </button>
  );
}

function ToggleRow({ item, value, onChange }) {
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (newVal) => {
    if (!newVal && item.warning) {
      setShowWarning(true);
    } else {
      onChange(newVal);
    }
  };

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.label}</p>
            {item.locked && <Lock style={{ width: 12, height: 12, color: "#94A3B8" }} />}
            {item.critical && !item.locked && (
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20,
                background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 700 }}>Important</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{item.description}</p>
          {item.locked && (
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, fontStyle: "italic" }}>{item.lockReason}</p>
          )}
        </div>
        <Toggle enabled={value} onChange={handleChange} locked={item.locked} />
      </div>

      {/* Warning confirmation */}
      {showWarning && (
        <div style={{ marginTop: 10, padding: "12px", borderRadius: 10,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <AlertTriangle style={{ color: "#F59E0B", width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.warning}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { onChange(false); setShowWarning(false); }}
              style={{ flex: 1, padding: "8px", borderRadius: 8,
                background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)",
                color: "#F59E0B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              I Understand — Disable
            </button>
            <button onClick={() => setShowWarning(false)}
              style={{ flex: 1, padding: "8px", borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Keep Enabled
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrivacySettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  // Load existing consent record
  const { data: existingConsent, isLoading: consentLoading } = useQuery({
    queryKey: ["privacy-consent", user?.email],
    queryFn: () => base44.entities.Consent.filter({ created_by: user.email }),
    enabled: !!user,
    select: data => data[0] || null,
  });

  // Build default settings from config
  const buildDefaults = () => {
    const defaults = {};
    SHARING_CONFIG.forEach(section => {
      section.items.forEach(item => {
        defaults[item.key] = item.default;
        if (item.locked) defaults[item.key] = true;
      });
    });
    return defaults;
  };

  const [settings, setSettings] = useState(buildDefaults());
  const [saved, setSaved] = useState(false);

  // Populate from DB when loaded
  useEffect(() => {
    if (existingConsent?.privacy_settings) {
      setSettings(prev => ({
        ...prev,
        ...existingConsent.privacy_settings,
        allow_crisis_escalation: true, // Always locked on
      }));
    }
  }, [existingConsent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { privacy_settings: settings, last_updated: new Date().toISOString() };
      if (existingConsent?.id) {
        await base44.entities.Consent.update(existingConsent.id, payload);
      } else {
        await base44.entities.Consent.create({
          ...payload,
          user_email: user.email,
          consent_type: "privacy_settings",
          accepted: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-consent"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleToggle = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const isLoading = userLoading || consentLoading;

  if (isLoading) return (
    <div style={{ background: "#070D1C", minHeight: "100vh" }}>
      <PageLoader label="Loading privacy settings…" />
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C 0%,#0B1424 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(150deg,#0E1D3A 0%,#081426 100%)", padding: "60px 20px 24px" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer",
            fontSize: 13, marginBottom: 16, padding: 0 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14,
              background: "rgba(62,207,191,0.12)", border: "1px solid rgba(62,207,191,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ color: "#3ECFBF", width: 22, height: 22 }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 3 }}>Privacy & Sharing</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Control who can see your recovery data</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── HIPAA note ── */}
          <div style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 20,
            background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.15)" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Info style={{ color: "#3ECFBF", width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                Your health information is protected. Only people you explicitly authorize can see your data.
                Crisis escalation alerts are always enabled to keep you safe.
              </p>
            </div>
          </div>

          {/* ── Settings sections ── */}
          {SHARING_CONFIG.map(section => (
            <div key={section.section} style={{ marginBottom: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{section.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{section.section}</p>
              </div>
              <div>
                {section.items.map(item => (
                  <ToggleRow
                    key={item.key}
                    item={item}
                    value={settings[item.key] ?? item.default}
                    onChange={(val) => handleToggle(item.key, val)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ── Save button ── */}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{
              width: "100%", padding: "16px",
              borderRadius: 16, border: "none", cursor: "pointer",
              background: saved ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
              border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
              color: saved ? "#10B981" : "#fff",
              fontWeight: 800, fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 12,
            }}
          >
            {saveMutation.isPending ? (
              <span>Saving…</span>
            ) : saved ? (
              <><CheckCircle2 style={{ width: 18, height: 18 }} /> Settings Saved</>
            ) : (
              "Save Privacy Settings"
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
            You can update these settings at any time. Changes take effect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}