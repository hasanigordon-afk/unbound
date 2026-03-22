import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Shield, Eye, EyeOff, Lock, ChevronLeft, Loader2, Check, AlertTriangle } from "lucide-react";

const C = {
  teal:   "#3ECFBF",
  navy:   "#0B1220",
  blue:   "#3B82F6",
  green:  "#10B981",
  red:    "#EF4444",
  amber:  "#F59E0B",
  slate:  "rgba(255,255,255,0.55)",
  muted:  "rgba(255,255,255,0.28)",
  glass:  { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" },
};

const SHARING_OPTIONS = [
  {
    key: "share_checkins_counselor",
    label: "Share Check-In Data with Counselor",
    desc: "Your daily mood, cravings, and attendance data",
    defaultOn: true,
    icon: "📋",
    warningIfOff: null,
  },
  {
    key: "share_checkins_sponsor",
    label: "Share Check-In Summary with Sponsor",
    desc: "Weekly summary of your check-in streaks only",
    defaultOn: false,
    icon: "🤝",
    warningIfOff: null,
  },
  {
    key: "share_goals_counselor",
    label: "Share Goals with Counselor",
    desc: "Your forward plan, milestones, and goal progress",
    defaultOn: true,
    icon: "🎯",
    warningIfOff: null,
  },
  {
    key: "share_journal_counselor",
    label: "Share Journal with Counselor",
    desc: "Private journal entries — OFF by default for your safety",
    defaultOn: false,
    icon: "📓",
    warningIfOff: null,
  },
  {
    key: "share_location_counselor",
    label: "Share Location City with Counselor",
    desc: "General city-level location only, never exact address",
    defaultOn: true,
    icon: "📍",
    warningIfOff: null,
  },
  {
    key: "share_engagement_probation",
    label: "Share Engagement Summary with Probation",
    desc: "Check-in rate, meeting attendance, milestone completions — no personal notes",
    defaultOn: false,
    icon: "⚖️",
    warningIfOff: null,
  },
  {
    key: "allow_crisis_escalation",
    label: "Allow Crisis Alert Escalation",
    desc: "Enables your counselor to be automatically notified if a crisis flag is detected",
    defaultOn: true,
    icon: "🚨",
    warningIfOff: "Turning this off means your counselor won't be automatically alerted in a crisis. You can still manually reach out.",
  },
  {
    key: "anonymous_community",
    label: "Post Anonymously in Community",
    desc: "Your name will not appear on community posts unless you choose otherwise",
    defaultOn: true,
    icon: "🛡️",
    warningIfOff: null,
  },
];

function ToggleRow({ setting, value, onChange }) {
  const [showWarning, setShowWarning] = useState(false);

  const handleToggle = () => {
    if (value && setting.warningIfOff) {
      setShowWarning(true);
      return;
    }
    onChange(!value);
  };

  return (
    <div style={{ ...C.glass, borderRadius: 16, padding: "16px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, fontSize: 20,
          background: value ? "rgba(62,207,191,0.1)" : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {setting.icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{setting.label}</p>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>{setting.desc}</p>
        </div>
        <button
          onClick={handleToggle}
          style={{
            width: 48, height: 28, borderRadius: 14, flexShrink: 0, cursor: "pointer", border: "none",
            background: value ? C.teal : "rgba(255,255,255,0.15)",
            transition: "background .2s ease", position: "relative",
          }}>
          <div style={{
            position: "absolute", top: 4, left: value ? 24 : 4, width: 20, height: 20, borderRadius: "50%",
            background: "#fff", transition: "left .2s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </button>
      </div>

      {showWarning && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#FCD34D", lineHeight: 1.55, marginBottom: 10 }}>
            ⚠️ {setting.warningIfOff}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { onChange(false); setShowWarning(false); }}
              style={{ flex: 1, padding: "8px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#FCA5A5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Turn Off Anyway
            </button>
            <button onClick={() => setShowWarning(false)}
              style={{ flex: 1, padding: "8px", borderRadius: 8, background: "rgba(62,207,191,0.15)", border: "1px solid rgba(62,207,191,0.3)",
                color: C.teal, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Keep On
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrivacySettings() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles, isLoading: pL } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const profile = profiles?.[0] || {};

  const [settings, setSettings] = useState(() => {
    const defaults = {};
    SHARING_OPTIONS.forEach(s => { defaults[s.key] = s.defaultOn; });
    return defaults;
  });

  // Sync saved settings from profile when loaded
  React.useEffect(() => {
    if (profile?.privacy_settings) {
      setSettings(prev => ({ ...prev, ...profile.privacy_settings }));
    }
  }, [profile?.id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const p = profiles?.[0];
      if (p?.id) {
        await base44.entities.MemberProfile.update(p.id, { privacy_settings: settings });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-profile"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (uL) {
    return (
      <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 28, height: 28, color: C.teal }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)`, minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", padding: "52px 24px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to={createPageUrl("Profile")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 16, height: 16, color: C.muted }} />
            <span style={{ fontSize: 13, color: C.muted }}>Back to Profile</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(62,207,191,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ width: 22, height: 22, color: C.teal }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Privacy & Data Sharing</h1>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Control what your support team can see</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px" }}>

        {/* Info banner */}
        <div style={{ ...C.glass, borderRadius: 16, padding: "16px 18px", marginBottom: 24,
          background: "rgba(62,207,191,0.05)", border: "1px solid rgba(62,207,191,0.2)" }}>
          <p style={{ fontSize: 13, color: C.teal, fontWeight: 700, marginBottom: 6 }}>🔒 You are in control</p>
          <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>
            Your personal recovery data is private by default. Only you decide what your counselor, sponsor, or probation officer can see. Journal entries are always private unless you explicitly share them.
          </p>
        </div>

        {/* Settings groups */}
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12 }}>
          Data Sharing Preferences
        </p>

        {SHARING_OPTIONS.map(setting => (
          <ToggleRow
            key={setting.key}
            setting={setting}
            value={settings[setting.key] ?? setting.defaultOn}
            onChange={val => setSettings(prev => ({ ...prev, [setting.key]: val }))}
          />
        ))}

        {/* Save button */}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          style={{ width: "100%", padding: "15px", borderRadius: 14, marginTop: 16,
            background: saved ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg,${C.teal},#2CB8AE)`,
            border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
            color: saved ? C.green : "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saveMutation.isPending ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> :
           saved ? <><Check style={{ width: 18, height: 18 }} /> Saved</> : "Save Privacy Settings"}
        </button>

        {/* HIPAA-conscious disclaimer */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
            <strong style={{ color: "rgba(255,255,255,0.35)" }}>Privacy Note:</strong> Unbound is designed with your privacy in mind. 
            Your data is shared only with the support team members you authorize. 
            Crisis escalation features are in place for your safety.
            For full data deletion requests, contact your facility or program administrator.
          </p>
        </div>
      </div>
    </div>
  );
}