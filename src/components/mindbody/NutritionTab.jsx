import React, { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { NUTRITION, LIMIT_FOODS } from "./workoutLibrary";

const DAILY_FOCUS = [
  "Hydration + greens",
  "Fermented foods + water",
  "Whole fruits + leafy greens",
  "Alkaline vegetables + lemon water",
  "Plant protein + fiber",
];

function MealLogSheet({ category, onClose, onSave, saving }) {
  const cat = NUTRITION[category];
  const [selected, setSelected] = useState([]);

  const toggle = (item) => {
    setSelected(s => s.includes(item) ? s.filter(x => x !== item) : [...s, item]);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(28,20,16,0.6)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: "#FDFAF6", width: "100%", maxWidth: 480, margin: "0 auto",
        borderRadius: "20px 20px 0 0", padding: "24px 20px 32px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".1em" }}>
            {cat.emoji} {cat.label}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8E83", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1C1410", marginBottom: 16 }}>
          What did you eat?
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {cat.items.map(item => {
            const sel = selected.includes(item);
            return (
              <button key={item} onClick={() => toggle(item)} style={{
                padding: "9px 14px", borderRadius: 20, cursor: "pointer",
                background: sel ? cat.color : "#F7F3EE",
                color: sel ? "#fff" : "#4A3F35",
                border: sel ? "none" : "1px solid #E8E2D9",
                fontSize: 12, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                {sel && <Check style={{ width: 11, height: 11 }} strokeWidth={3} />}
                {item}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onSave(selected)}
          disabled={selected.length === 0 || saving}
          style={{
            width: "100%", padding: 14, borderRadius: 50, border: "none",
            cursor: selected.length > 0 && !saving ? "pointer" : "default",
            background: selected.length > 0 ? "#B8823A" : "#E8E2D9",
            color: "#fff", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Check style={{ width: 15, height: 15 }} />}
          Log Meal
        </button>
      </div>
    </div>
  );
}

export default function NutritionTab({ onLogMeal, askMood, saving }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const todayIndex = new Date().getDate() % DAILY_FOCUS.length;

  const handleSave = async (items) => {
    await onLogMeal({
      category: activeCategory,
      items,
      logged_at: new Date().toISOString(),
    });
    setActiveCategory(null);
    askMood();
  };

  return (
    <div style={{ padding: "20px 16px" }}>

      {/* Daily focus */}
      <div style={{
        background: "linear-gradient(135deg, rgba(122,158,126,.12), rgba(95,158,138,.04))",
        border: "1px solid rgba(122,158,126,.3)",
        borderRadius: 14, padding: "16px 18px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#5F9E8A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
          Today's focus
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1C1410", fontFamily: "'Lora', serif" }}>
          {DAILY_FOCUS[todayIndex]}
        </p>
      </div>

      {/* Log a meal */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Log a clean meal
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {Object.entries(NUTRITION).map(([key, cat]) => (
          <button key={key} onClick={() => setActiveCategory(key)} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 14, padding: "14px 16px",
            cursor: "pointer", textAlign: "left", width: "100%",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: `${cat.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              {cat.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>{cat.label}</p>
              <p style={{ fontSize: 11, color: "#9B8E83" }}>
                {cat.items.slice(0, 4).join(" · ")}
              </p>
            </div>
            <span style={{ color: "#9B8E83", fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>

      {/* Limit (educational) */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Ease up on
      </p>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "4px 16px", marginBottom: 14 }}>
        {LIMIT_FOODS.map((f, i) => (
          <div key={f.label} style={{
            padding: "12px 0",
            borderBottom: i < LIMIT_FOODS.length - 1 ? "1px solid #E8E2D9" : "none",
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1410", marginBottom: 2 }}>{f.label}</p>
            <p style={{ fontSize: 11, color: "#9B8E83" }}>{f.note}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", fontStyle: "italic", lineHeight: 1.5 }}>
        Progress, not perfection.
      </p>

      {activeCategory && (
        <MealLogSheet
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}