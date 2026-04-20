import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X } from "lucide-react";

const OPTIONS = [
  { key: "motivation",    label: "Motivation",              emoji: "🔥", desc: "Quick lifts and encouragement" },
  { key: "stories",       label: "Real stories",            emoji: "✨", desc: "Ah Ha moments from others" },
  { key: "reminders",     label: "Reminders to stay on track", emoji: "📍", desc: "Check-ins, goals, streaks" },
  { key: "mental_health", label: "Mental health support",   emoji: "🌿", desc: "Breathing, reflection, calm" },
];

export default function PersonalizationSheet({ pref, onClose }) {
  const [selected, setSelected] = useState(new Set(pref?.focus_preference || []));
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.NotificationPreference.update(pref.id, {
      focus_preference: Array.from(selected),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(28,20,16,0.45)",
    }}>
      <style>{`@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#FDFAF6",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "24px 22px 28px",
        animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)",
        boxShadow: "0 -4px 24px rgba(28,20,16,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7A9E7E", textTransform: "uppercase", letterSpacing: ".08em" }}>
            You're in ✓
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8E83" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <h2 style={{
          fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 600,
          color: "#1C1410", marginBottom: 6, lineHeight: 1.25,
        }}>
          Let's keep moving forward.
        </h2>
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6, marginBottom: 18 }}>
          What do you want more of? Pick any that fit. You can change this anytime.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {OPTIONS.map(o => {
            const on = selected.has(o.key);
            return (
              <button
                key={o.key}
                onClick={() => toggle(o.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                  background: on ? "rgba(184,130,58,0.08)" : "#FDFAF6",
                  border: `1.5px solid ${on ? "#B8823A" : "#E8E2D9"}`,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 22 }}>{o.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>{o.label}</p>
                  <p style={{ fontSize: 11, color: "#9B8E83" }}>{o.desc}</p>
                </div>
                {on && (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#B8823A", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Check style={{ width: 13, height: 13, color: "#fff" }} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", padding: "14px", borderRadius: 50, border: "none",
            background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: "pointer", marginBottom: 8,
          }}
        >
          {saving ? "Saving…" : "Save & Continue"}
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "12px", borderRadius: 50,
            background: "transparent", color: "#9B8E83",
            border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}