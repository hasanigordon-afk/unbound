import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, MessageCircle, Heart, Plus, X, ChevronLeft, Edit2, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

const C = {
  amber:   "#B8823A",
  green:   "#7A9E7E",
  red:     "#C9534F",
  indigo:  "#7B8FA8",
  muted:   "#9B8E83",
  text:    "#1C1410",
  textMuted: "#4A3F35",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const ROLES = [
  { value: "sponsor",         label: "Sponsor",         emoji: "🤝", color: C.amber  },
  { value: "counselor",       label: "Counselor",       emoji: "🧠", color: C.indigo },
  { value: "trusted_contact", label: "Trusted Contact", emoji: "💙", color: C.green  },
  { value: "family",          label: "Family",          emoji: "❤️", color: C.red    },
  { value: "other",           label: "Other",           emoji: "👤", color: C.muted  },
];

function roleInfo(role) {
  return ROLES.find(r => r.value === role) || ROLES[4];
}

function ContactSheet({ contact, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(contact || { name: "", role: "trusted_contact", phone: "", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(28,20,16,0.5)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0",
        background: C.surface, padding: "24px 20px 44px", border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: C.text }}>
            {contact ? "Edit Contact" : "Add to Inner Circle"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ color: C.muted, width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Role</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {ROLES.map(r => (
            <button key={r.value} onClick={() => set("role", r.value)}
              style={{ padding: "7px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: form.role === r.value ? r.color + "15" : C.bg,
                color: form.role === r.value ? r.color : C.muted,
                border: `1.5px solid ${form.role === r.value ? r.color + "50" : C.border}` }}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Name *</p>
        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Phone</p>
        <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 000-0000" type="tel"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Notes (optional)</p>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Best time to call, preferred method…"
          rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 13, outline: "none", resize: "none",
            boxSizing: "border-box", marginBottom: 20 }} />

        <button onClick={() => onSave(form)} disabled={!form.name.trim() || isSaving}
          style={{ width: "100%", padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
            background: form.name.trim() ? C.amber : C.border,
            color: form.name.trim() ? "#fff" : C.muted,
            fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {isSaving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
          Save Contact
        </button>
      </div>
    </div>
  );
}

function ContactCard({ contact, onEdit, onDelete }) {
  const ri = roleInfo(contact.role);
  const [checking, setChecking] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); setCheckedIn(true); setTimeout(() => setCheckedIn(false), 3000); }, 800);
  };

  return (
    <div style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: ri.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {ri.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>{contact.name}</p>
          <span style={{ fontSize: 11, fontWeight: 700, color: ri.color, background: ri.color + "12",
            padding: "2px 8px", borderRadius: 20, border: `1px solid ${ri.color}25` }}>{ri.label}</span>
          {contact.notes && <p style={{ fontSize: 11, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>{contact.notes}</p>}
        </div>
        <button onClick={() => onEdit(contact)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0 }}>
          <Edit2 style={{ color: C.muted, width: 14, height: 14 }} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {contact.phone ? (
          <>
            <a href={`tel:${contact.phone}`} style={{ textDecoration: "none", flex: 1 }}>
              <button style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "rgba(122,158,126,.10)", border: "1px solid rgba(122,158,126,.25)",
                color: C.green, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Phone style={{ width: 13, height: 13 }} /> Call
              </button>
            </a>
            <a href={`sms:${contact.phone}`} style={{ textDecoration: "none", flex: 1 }}>
              <button style={{ width: "100%", padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "rgba(123,143,168,.10)", border: "1px solid rgba(123,143,168,.25)",
                color: C.indigo, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <MessageCircle style={{ width: 13, height: 13 }} /> Message
              </button>
            </a>
          </>
        ) : (
          <div style={{ flex: 2 }} />
        )}
        <button onClick={handleCheckIn} disabled={checking || checkedIn}
          style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
            background: checkedIn ? "rgba(184,130,58,.12)" : C.bg,
            border: `1px solid ${checkedIn ? "rgba(184,130,58,.3)" : C.border}`,
            color: checkedIn ? C.amber : C.muted,
            fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {checking ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
            : checkedIn ? <CheckCircle2 style={{ width: 12, height: 12 }} />
            : <Heart style={{ width: 12, height: 12 }} />}
          {checkedIn ? "Sent!" : "Check In"}
        </button>
      </div>

      <button onClick={() => onDelete(contact.id)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "block", marginTop: 10,
          fontSize: 11, color: C.red, padding: 0, opacity: 0.6 }}>
        Remove from Inner Circle
      </button>
    </div>
  );
}

export default function InnerCircle() {
  const qc = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["inner-circle", user?.email],
    queryFn: () => base44.entities.InnerCircleContact.filter({ user_email: user.email }, "sort_order", 50),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (form) => {
      const payload = { ...form, user_email: user.email };
      if (editing?.id) return base44.entities.InnerCircleContact.update(editing.id, payload);
      return base44.entities.InnerCircleContact.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inner-circle"] }); setSheetOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InnerCircleContact.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inner-circle"] }),
  });

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (c) => { setEditing(c); setSheetOpen(true); };

  const grouped = ROLES.reduce((acc, r) => {
    const list = contacts.filter(c => c.role === r.value);
    if (list.length) acc.push({ ...r, contacts: list });
    return acc;
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(184,130,58,.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💙</div>
            <div>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.1 }}>Inner Circle</h1>
              <p style={{ fontSize: 12, color: C.muted }}>Your personal support network</p>
            </div>
          </div>
          {contacts.length > 0 && (
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12,
              background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.2)" }}>
              <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                💡 Recovery is stronger with people in your corner. Tap "Check In" anytime — even just to say you're okay.
              </p>
            </div>
          )}
        </div>

        <div style={{ padding: "20px 16px" }}>
          <button onClick={openAdd} style={{ width: "100%", padding: "14px 20px", borderRadius: 50, border: "none", cursor: "pointer",
            background: C.amber, color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Plus style={{ width: 17, height: 17 }} /> Add Someone
          </button>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 style={{ color: C.amber, width: 28, height: 28, margin: "0 auto" }} className="animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 18, padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>💙</p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>Your Inner Circle is empty</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Add your sponsor, counselor, or trusted people.<br />
                They'll be one tap away when you need them most.
              </p>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.value} style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                  letterSpacing: ".1em", marginBottom: 10 }}>{group.emoji} {group.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {group.contacts.map(c => (
                    <ContactCard key={c.id} contact={c} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} />
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 16, borderRadius: 14, padding: "12px 16px",
            background: "rgba(201,83,79,.06)", border: "1px solid rgba(201,83,79,.18)", textAlign: "center" }}>
            <a href="tel:988" style={{ textDecoration: "none" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.red }}>In crisis? Call 988 · Free, 24/7</p>
            </a>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <ContactSheet contact={editing} onClose={() => { setSheetOpen(false); setEditing(null); }}
          onSave={(form) => saveMutation.mutate(form)} isSaving={saveMutation.isPending} />
      )}
    </div>
  );
}