import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { RECOVERY_CATEGORIES } from "@/lib/recoveryCategories";

// Ah Ha tokens
const C = {
  amber:   "#B8823A",
  red:     "#A32D2D",
  bg:      "#F7F3EE",
  card:    "#FDFAF6",
  border:  "#E8E2D9",
  text:    "#1C1410",
  muted:   "#4A3F35",
  dim:     "#9B8E83",
};

/**
 * Grid of recovery-focus options. User picks ONE primary focus.
 * Crisis categories (self_harm, suicide_prevention) render with a red accent
 * and surface a safety-routing notice when selected.
 */
export default function RecoveryFocusPicker({ value, onChange }) {
  const selectedCategory = RECOVERY_CATEGORIES.find(c => c.value === value);
  const showCrisisNotice = !!selectedCategory?.isCrisis;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {RECOVERY_CATEGORIES.map(cat => {
          const selected = value === cat.value;
          const accent = cat.isCrisis ? C.red : C.amber;
          return (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              style={{
                padding: "14px 12px", borderRadius: 14, cursor: "pointer",
                background: selected
                  ? (cat.isCrisis ? "rgba(163,45,45,0.07)" : "rgba(184,130,58,0.10)")
                  : C.card,
                border: `2px solid ${selected ? accent : C.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                textAlign: "center", transition: "all 0.15s",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.emoji}</span>
              <p style={{ color: C.text, fontWeight: 600, fontSize: 12, lineHeight: 1.3 }}>
                {cat.label}
              </p>
              {selected && (
                <Check
                  className="w-3.5 h-3.5"
                  style={{ position: "absolute", top: 8, right: 8, color: accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showCrisisNotice && (
        <div style={{
          marginTop: 14, padding: "14px 16px", borderRadius: 12,
          background: "rgba(163,45,45,0.06)", border: "1px solid rgba(163,45,45,0.22)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: C.red, marginTop: 1 }} />
          <div>
            <p style={{ color: C.red, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              You're not alone. Help is available 24/7.
            </p>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              We'll prioritize crisis-support resources for you. If you're in immediate danger, please reach out now:
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="tel:988" style={{ flex: 1, background: C.red, borderRadius: 10, padding: "8px 6px", textAlign: "center", textDecoration: "none" }}>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1 }}>Call 988</p>
              </a>
              <a href="sms:741741" style={{ flex: 1, background: C.amber, borderRadius: 10, padding: "8px 6px", textAlign: "center", textDecoration: "none" }}>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 12, lineHeight: 1.2 }}>Text HOME<br/>to 741741</p>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}