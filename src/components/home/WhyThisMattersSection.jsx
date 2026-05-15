import React from "react";
import { Activity, RotateCcw, HeartCrack } from "lucide-react";

const overdoseValues = [67, 71, 92, 107, 109, 112, 108];
const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"];

function BarTrend() {
  const max = Math.max(...overdoseValues);
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 7, height: 108, marginTop: 16 }}>
      {overdoseValues.map((value, index) => (
        <div key={years[index]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <div className="reality-bar" style={{ width: "100%", height: `${(value / max) * 100}%`, borderRadius: "999px 999px 8px 8px", background: "linear-gradient(180deg, var(--accent), var(--purple))", boxShadow: "0 0 18px rgba(91,141,239,.30)", animationDelay: `${index * 80}ms` }} />
          <span style={{ fontSize: 8.5, color: "var(--text-dim)", fontWeight: 800 }}>{years[index]}</span>
        </div>
      ))}
    </div>
  );
}

function LineTrend() {
  return (
    <div style={{ height: 124, marginTop: 12, position: "relative" }}>
      <svg viewBox="0 0 280 110" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <path d="M12 78 C48 44, 86 50, 120 62 S184 92, 226 54 S258 44, 272 38" fill="none" stroke="rgba(91,141,239,.18)" strokeWidth="12" strokeLinecap="round" />
        <path className="line-draw" d="M12 78 C48 44, 86 50, 120 62 S184 92, 226 54 S258 44, 272 38" fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
        <defs><linearGradient id="lineGradient" x1="0" x2="1"><stop stopColor="#5B8DEF"/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs>
        {[12,64,120,176,226,272].map((x, i) => <circle key={x} className="line-dot" cx={x} cy={[78,48,62,84,54,38][i]} r="4" fill="#EAF0FF" style={{ animationDelay: `${i * 110}ms` }} />)}
      </svg>
    </div>
  );
}

function DonutChart() {
  return (
    <div style={{ display: "grid", placeItems: "center", height: 124, marginTop: 12 }}>
      <div className="donut-chart" style={{ width: 116, height: 116, borderRadius: "50%", background: "conic-gradient(var(--accent) 0 80%, rgba(255,255,255,.10) 80% 100%)", display: "grid", placeItems: "center", boxShadow: "0 0 34px rgba(91,141,239,.25)" }}>
        <div style={{ width: 78, height: 78, borderRadius: "50%", background: "rgba(13,18,32,.92)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.10)" }}>
          <strong style={{ fontSize: 26, color: "var(--text)" }}>80%+</strong>
        </div>
      </div>
    </div>
  );
}

const cards = [
  { title: "Overdose Crisis", icon: Activity, number: "112,000+", label: "Lives lost in America", chart: <BarTrend /> },
  { title: "Recidivism Rate", icon: RotateCcw, number: "44%", label: "Many individuals return due to lack of structure and support.", chart: <LineTrend /> },
  { title: "Recovery Support Gap", icon: HeartCrack, number: "80%+", label: "Many individuals lose support systems after treatment or release.", chart: <DonutChart /> },
];

export default function WhyThisMattersSection() {
  return (
    <section style={{ marginBottom: 78 }}>
      <div style={{ maxWidth: 900, marginBottom: 26 }}>
        <p className="section-label">Why This Matters</p>
        <h2 style={{ fontSize: "clamp(34px, 5vw, 62px)", lineHeight: 1, margin: 0 }}>America&apos;s Other Crisis</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.75, marginTop: 16 }}>
          Millions struggle with addiction, incarceration cycles, trauma, and rebuilding life after difficult circumstances.
          ReZilient exists to help people create structure, accountability, and support after life&apos;s hardest moments.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {cards.map(({ title, icon: Icon, number, label, chart }) => (
          <article key={title} className="reality-card" style={{ padding: 22, borderRadius: 30, background: "linear-gradient(145deg, rgba(255,255,255,.105), rgba(13,18,32,.74))", border: "1px solid rgba(190,215,255,.16)", boxShadow: "var(--shadow-card)", backdropFilter: "blur(26px) saturate(160%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>{title}</h3>
              <div style={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--navy-dim)", border: "1px solid var(--navy-border)", color: "var(--accent)" }}><Icon size={21} /></div>
            </div>
            {chart}
            <strong style={{ display: "block", fontSize: 34, color: "var(--text)", marginTop: 12 }}>{number}</strong>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{label}</p>
          </article>
        ))}
      </div>
      <style>{`
        .reality-card { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both; transition: transform .22s, border-color .22s, box-shadow .22s; }
        .reality-card:hover { transform: translateY(-5px); border-color: var(--border-glow); box-shadow: var(--glow), var(--shadow-card); }
        .reality-bar { transform-origin: bottom; animation: barRise .9s cubic-bezier(.22,1,.36,1) both; }
        .line-draw { stroke-dasharray: 420; stroke-dashoffset: 420; animation: drawLine 1.4s cubic-bezier(.22,1,.36,1) forwards; }
        .line-dot { opacity: 0; animation: fadeIn .5s ease forwards; }
        .donut-chart { animation: donutPulse 3.2s ease-in-out infinite; }
        @keyframes barRise { from { transform: scaleY(.15); opacity: .35; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes donutPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @media (max-width: 980px) { section [style*="repeat(3"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}