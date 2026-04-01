import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle2, Loader2 } from "lucide-react";

const C = { teal: "#2DD4BF", indigo: "#6366F1", emerald: "#10B981" };

const MOOD_LABELS = ["Rough", "Low", "OK", "Good", "Great"];
const EFFORT_LABELS = ["Minimal", "Light", "Moderate", "Strong", "Full"];

export default function ReflectionModal({ user, today, existing, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    went_well:        existing?.went_well || "",
    challenged_you:   existing?.challenged_you || "",
    improve_tomorrow: existing?.improve_tomorrow || "",
    mood:             existing?.mood || 3,
    effort_level:     existing?.effort_level || 3,
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { user_email: user.email, reflection_date: today, ...form };
      if (existing?.id) {
        await base44.entities.RecoveryPathReflection.update(existing.id, payload);
      } else {
        await base44.entities.RecoveryPathReflection.create(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rp-reflection-today"] });
      setSaved(true);
      setTimeout(onClose, 1200);
    },
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "90vh", overflowY: "auto",
        borderRadius: "24px 24px 0 0", background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>End-of-Day Reflection</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Optional. Keep it honest and brief.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        {/* Mood + Effort */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Mood", key: "mood", labels: MOOD_LABELS, color: C.teal },
            { label: "Effort", key: "effort_level", labels: EFFORT_LABELS, color: C.indigo },
          ].map(({ label, key, labels, color }) => (
            <div key={key} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "12px 10px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                letterSpacing: ".07em", marginBottom: 10, textAlign: "center" }}>{label}</p>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set(key, n)}
                    style={{ flex: 1, aspectRatio: "1", borderRadius: 8, border: "none", cursor: "pointer",
                      background: form[key] >= n ? color : "rgba(255,255,255,0.07)",
                      transition: "background 0.15s ease" }} />
                ))}
              </div>
              <p style={{ fontSize: 10, color, textAlign: "center", marginTop: 6, fontWeight: 700 }}>
                {labels[(form[key] || 3) - 1]}
              </p>
            </div>
          ))}
        </div>

        {[
          { key: "went_well",        label: "What went well today?",           placeholder: "Even one small win counts…" },
          { key: "challenged_you",   label: "What challenged you?",            placeholder: "No judgment. Just honest reflection." },
          { key: "improve_tomorrow", label: "What do you want to improve tomorrow?", placeholder: "One thing you'll focus on…" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</p>
            <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={2}
              placeholder={placeholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: 13, resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: 1.6 }} />
          </div>
        ))}

        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
            background: saved ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg,${C.indigo},#5558EE)`,
            border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
            color: saved ? C.emerald : "#fff", fontWeight: 800, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saveMutation.isPending ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : null}
          {saved ? <><CheckCircle2 style={{ width: 16, height: 16 }} /> Saved</> : "Save Reflection"}
        </button>
      </div>
    </div>
  );
}