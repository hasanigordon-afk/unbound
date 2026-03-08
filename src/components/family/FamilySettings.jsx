import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, Mail, Eye, EyeOff, Copy, CheckCircle, Loader2, Heart } from "lucide-react";

const RELATIONSHIPS = ["Parent", "Spouse / Partner", "Sibling", "Child", "Grandparent", "Friend", "Other"];

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getFamilyViewUrl(token) {
  return `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}#/FamilyView?token=${token}`;
}

export default function FamilySettings({ participantEmail }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contact_name: "", contact_email: "", relationship: "Parent" });
  const [copiedToken, setCopiedToken] = useState(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["family-contacts", participantEmail],
    queryFn: () => base44.entities.FamilyContact.filter({ participant_email: participantEmail }),
    enabled: !!participantEmail,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.FamilyContact.create({
        participant_email: participantEmail,
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        relationship: form.relationship,
        weekly_summary_enabled: true,
        can_view_dashboard: true,
        is_active: true,
        access_token: generateToken(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family-contacts", participantEmail] });
      setForm({ contact_name: "", contact_email: "", relationship: "Parent" });
      setShowForm(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyContact.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-contacts", participantEmail] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyContact.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-contacts", participantEmail] }),
  });

  const handleCopy = (token) => {
    navigator.clipboard.writeText(getFamilyViewUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const active = contacts.filter((c) => c.is_active);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb", background: "#fff" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: "#f5f3ff", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: "#8b5cf6" }} />
          <p className="font-semibold text-sm" style={{ color: "#1e1e1e" }}>Family Support Contacts</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: "#6366f1", color: "#fff" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Contact
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        <p className="text-xs" style={{ color: "#6b7280" }}>
          Family members you add can receive <strong>automated weekly summaries</strong> and view a limited dashboard
          showing only non-clinical engagement activity. You can revoke access at any time.
        </p>

        {/* Add form */}
        {showForm && (
          <div className="p-4 rounded-xl space-y-3" style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7c3aed" }}>New Contact</p>
            <input
              placeholder="Full name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg"
              style={{ border: "1px solid #d1d5db", background: "#fff", outline: "none" }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg"
              style={{ border: "1px solid #d1d5db", background: "#fff", outline: "none" }}
            />
            <select
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg"
              style={{ border: "1px solid #d1d5db", background: "#fff", outline: "none" }}
            >
              {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => addMutation.mutate()}
                disabled={!form.contact_name || !form.contact_email || addMutation.isPending}
                className="flex-1 text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                style={{ background: "#6366f1", color: "#fff", opacity: !form.contact_name || !form.contact_email ? 0.5 : 1 }}
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Contact"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 text-sm rounded-lg"
                style={{ background: "#e5e7eb", color: "#374151" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Contact list */}
        {isLoading ? (
          <div className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: "#8b5cf6" }} /></div>
        ) : active.length === 0 ? (
          <div className="text-center py-8" style={{ color: "#9ca3af" }}>
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No family contacts added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((c) => (
              <div key={c.id} className="p-4 rounded-xl" style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "#1e1e1e" }}>{c.contact_name}</p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>{c.contact_email} · {c.relationship}</p>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(c.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: "#fee2e2", color: "#ef4444" }}
                    title="Revoke access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Toggles */}
                <div className="flex gap-3 mt-3 flex-wrap">
                  <ToggleChip
                    icon={Mail}
                    label="Weekly Email"
                    active={c.weekly_summary_enabled}
                    onToggle={() => toggleMutation.mutate({ id: c.id, data: { weekly_summary_enabled: !c.weekly_summary_enabled } })}
                    activeColor="#6366f1"
                  />
                  <ToggleChip
                    icon={c.can_view_dashboard ? Eye : EyeOff}
                    label="Dashboard Link"
                    active={c.can_view_dashboard}
                    onToggle={() => toggleMutation.mutate({ id: c.id, data: { can_view_dashboard: !c.can_view_dashboard } })}
                    activeColor="#8b5cf6"
                  />
                </div>

                {/* Copy link */}
                {c.can_view_dashboard && c.access_token && (
                  <button
                    onClick={() => handleCopy(c.access_token)}
                    className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-full justify-center"
                    style={{ background: "#ede9fe", color: "#6d28d9" }}
                  >
                    {copiedToken === c.access_token ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Link Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Family View Link</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleChip({ icon: Icon, label, active, onToggle, activeColor }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        background: active ? `${activeColor}18` : "#f3f4f6",
        color: active ? activeColor : "#9ca3af",
        border: `1px solid ${active ? activeColor + "44" : "#e5e7eb"}`,
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}