import React from "react";
import { Activity, BarChart3, HeartCrack } from "lucide-react";

const statCards = [
  {
    title: "Overdose Crisis",
    icon: Activity,
    note: "Recent years show the scale of pain families and communities are carrying.",
    values: [58, 66, 74, 86, 94, 88],
    labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
  },
  {
    title: "Recidivism",
    icon: BarChart3,
    note: "Without structure and support, old cycles can pull people back in.",
    values: [68, 64, 61, 58, 56, 54],
    labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6"],
  },
  {
    title: "Recovery Support Gap",
    icon: HeartCrack,
    note: "Many individuals lose support systems immediately after treatment or release.",
    values: [42, 50, 63, 70, 76, 82],
    labels: ["Start", "30d", "60d", "90d", "6m", "1y"],
  },
];

function MiniChart({ values, labels }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 8, height: 112, marginTop: 18 }}>
      {values.map((value, index) => (
        <div key={labels[index]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className="reality-bar" style={{ width: "100%", height: `${Math.max(18, (value / max) * 100)}%`, borderRadius: "999px 999px 8px 8px", background: "linear-gradient(180deg, var(--accent), var(--purple))", boxShadow: "0 0 18px rgba(91,141,239,.28)", animationDelay: `${index * 90}ms` }} />
          <span style={{ fontSize: 9, color: "var(--text-dim)", fontWeight: 800 }}>{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

export default function WhyThisMattersSection() {
  return (
    <section style={{ marginBottom: 74 }}>
      <div style={{ maxWidth: 860, marginBottom: 24 }}>
        <p className="section-label">The Reality</p>
        <h2 style={{ fontSize: "clamp(34px, 5vw, 62px)", lineHeight: 1, margin: 0 }}>America&apos;s Other Crisis</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.75, marginTop: 16 }}>
          Millions struggle with addiction, incarceration cycles, and rebuilding life after trauma. Too many people are released back into society without structure, resources, accountability, or hope.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {statCards.map(({ title, icon: Icon, note, values, labels }) => (
          <article key={title} className="reality-card" style={{ padding: 22, borderRadius: 30, background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.72))", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", backdropFilter: "blur(24px) saturate(155%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 23 }}>{title}</h3>
              <div style={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--navy-dim)", border: "1px solid var(--navy-border)", color: "var(--accent)" }}><Icon size={21} /></div>
            </div>
            <MiniChart values={values} labels={labels} />
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55, margin: "18px 0 0" }}>{note}</p>
          </article>
        ))}
      </div>
      <style>{`
        .reality-card { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both; transition: transform .22s, border-color .22s, box-shadow .22s; }
        .reality-card:hover { transform: translateY(-5px); border-color: var(--border-glow); box-shadow: var(--glow), var(--shadow-card); }
        .reality-bar { transform-origin: bottom; animation: barRise .9s cubic-bezier(.22,1,.36,1) both; }
        @keyframes barRise { from { transform: scaleY(.15); opacity: .35; } to { transform: scaleY(1); opacity: 1; } }
        @media (max-width: 980px) { section [style*="repeat(3"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}