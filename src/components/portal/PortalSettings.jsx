import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

const ROLE_LABELS = {
  counselor: "Counselor",
  sponsor: "Sponsor",
  case_manager: "Case Manager",
  administrator: "Administrator",
  probation_officer: "Probation Officer",
};

const INPUT_STYLE = {
  width: "100%", height: 40, border: "1px solid #E2E8F0", borderRadius: 8,
  padding: "0 12px", fontSize: 14, color: "#1E293B", outline: "none",
  background: "#FFF", boxSizing: "border-box", fontFamily: "inherit",
};

function Section({ title, children }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "22px 24px", marginBottom: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      {children}
    </div>
  );
}

export default function PortalSettings({ user, counselorProfile }) {
  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(counselorProfile?.phone || "");
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      if (name !== user?.full_name) await base44.auth.updateMe({ full_name: name });
      if (counselorProfile?.id && phone !== counselorProfile?.phone) {
        await base44.entities.CounselorProfile.update(counselorProfile.id, { phone });
      }
    },
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
  });

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>Manage your profile and preferences.</p>
      </div>

      <Section title="Your Profile">
        <Field label="Full Name">
          <input value={name} onChange={e => setName(e.target.value)} style={INPUT_STYLE} />
        </Field>
        <Field label="Email Address">
          <input value={user?.email || ""} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8", cursor: "not-allowed" }} />
        </Field>
        <Field label="Role">
          <input value={ROLE_LABELS[counselorProfile?.role_type] || counselorProfile?.role_type || "—"} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8", cursor: "not-allowed" }} />
        </Field>
        <Field label="Organization">
          <input value={counselorProfile?.facility_name || "—"} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8", cursor: "not-allowed" }} />
        </Field>
        <Field label="Phone Number">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" style={INPUT_STYLE} />
        </Field>
        <button onClick={() => save.mutate()} disabled={save.isPending}
          style={{ background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
          {save.isPending ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </Section>

      <Section title="About This Portal">
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>
          The Professional Portal lets you track your assigned clients, monitor check-ins, review progress, send messages, and manage case notes — all in one simple place.
        </p>
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>
          Clients are assigned by your facility administrator. If you need access changes, contact your admin.
        </p>
      </Section>

      <Section title="Account">
        <button onClick={() => base44.auth.logout()}
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
          Sign Out
        </button>
      </Section>
    </div>
  );
}