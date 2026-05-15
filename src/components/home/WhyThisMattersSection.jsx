import React from "react";
import { Activity, HeartCrack, RotateCcw } from "lucide-react";

const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"];

function RisingLineChart() {
  const points = ["18,90", "55,82", "92,68", "129,56", "166,45", "203,28", "240,22"];
  return (
    <div className="chart-panel overdose-chart-panel">
      <div className="trend-badge">+32% increase</div>
      <svg viewBox="0 0 258 128" className="overdose-chart-svg">
        {[30, 58, 86].map((y) => <line key={y} x1="10" x2="248" y1={y} y2={y} stroke="rgba(255,255,255,.07)" />)}
        <polyline points={points.join(" ")} fill="none" stroke="rgba(91,141,239,.14)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <polyline className="analytics-line" points={points.join(" ")} fill="none" stroke="url(#overdoseGradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="overdoseGradient" x1="0" x2="1">
            <stop stopColor="#5B8DEF" />
            <stop offset=".55" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#F0B753" />
          </linearGradient>
        </defs>
        {points.map((point, index) => {
          const [x, y] = point.split(",");
          return <circle key={point} className="analytics-dot" cx={x} cy={y} r="5" fill="#EAF0FF" style={{ animationDelay: `${index * 90}ms` }} />;
        })}
      </svg>
      <div className="chart-years overdose-years">{years.map((year) => <span key={year}>{year}</span>)}</div>
    </div>
  );
}

function RecidivismChart() {
  const bars = [62, 50, 56, 44, 48, 38, 44];
  return (
    <div className="chart-panel recidivism-panel">
      <svg viewBox="0 0 266 104" style={{ width: "100%", height: 104, overflow: "visible" }}>
        <path d="M14 62 C52 42, 82 48, 112 58 S174 74, 206 54 S236 42, 252 48" fill="none" stroke="rgba(167,139,250,.15)" strokeWidth="12" strokeLinecap="round" />
        <path className="analytics-line" d="M14 62 C52 42, 82 48, 112 58 S174 74, 206 54 S236 42, 252 48" fill="none" stroke="url(#reGradient)" strokeWidth="4" strokeLinecap="round" />
        <defs><linearGradient id="reGradient" x1="0" x2="1"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#5B8DEF"/></linearGradient></defs>
      </svg>
      <div className="mini-bars">{bars.map((bar, index) => <span key={index} style={{ height: `${bar}%`, animationDelay: `${index * 80}ms` }} />)}</div>
    </div>
  );
}

function DonutChart() {
  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <div className="donut-inner">
          <strong>80%+</strong>
          <span>gap</span>
        </div>
      </div>
      <div className="donut-caption">
        <span style={{ background: "var(--accent)" }} /> Support lost
        <span style={{ background: "rgba(255,255,255,.16)" }} /> Remaining
      </div>
    </div>
  );
}

const cards = [
  {
    title: "Overdose Crisis",
    icon: Activity,
    number: "112,000+",
    metric: "Lives lost in America",
    description: "Recent years show the scale of pain families and communities are carrying.",
    source: "CDC data",
    chart: <RisingLineChart />,
  },
  {
    title: "Recidivism Rate",
    icon: RotateCcw,
    number: "44%",
    metric: "Repeat incarceration rate",
    description: "Many people return due to lack of support and structure.",
    source: "reentry trend",
    chart: <RecidivismChart />,
  },
  {
    title: "Recovery Support Gap",
    icon: HeartCrack,
    number: "80%+",
    metric: "Support disruption",
    description: "Many people lose support systems after treatment or release.",
    source: "support gap",
    chart: <DonutChart />,
  },
];

export default function WhyThisMattersSection() {
  return (
    <section className="crisis-dashboard" style={{ marginBottom: 68 }}>
      <div className="crisis-header">
        <p className="section-label">Why This Matters</p>
        <h2>America&apos;s Other Crisis</h2>
        <p>
          Millions struggle with addiction, incarceration cycles, trauma, and rebuilding life after difficult circumstances.
          ReZilient exists to help create structure, accountability and support.
        </p>
      </div>

      <div className="crisis-card-grid">
        {cards.map(({ title, icon: Icon, number, metric, description, source, chart }, index) => {
          const isOverdose = title === "Overdose Crisis";
          return (
            <article key={title} className={`crisis-stat-card ${isOverdose ? "overdose-card" : ""}`} style={{ animationDelay: `${index * 120}ms` }}>
              <div className="card-topline">
                <div>
                  <p>{isOverdose ? "📈 " : ""}{title}</p>
                  {!isOverdose && (
                    <>
                      <strong>{number}</strong>
                      <span>{metric}</span>
                    </>
                  )}
                </div>
                <div className="card-icon"><Icon size={21} /></div>
              </div>
              {chart}
              {isOverdose ? (
                <div className="overdose-bottom-metric">
                  <strong>{number}</strong>
                  <span>{metric}</span>
                  <small>Source: CDC</small>
                </div>
              ) : (
                <>
                  <p className="card-description">{description}</p>
                  <div className="source-row"><span />{source}</div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <style>{`
        .crisis-dashboard { position: relative; }
        .crisis-header { max-width: 850px; margin-bottom: 18px; }
        .crisis-header h2 { font-size: clamp(34px, 5vw, 58px); line-height: 1; margin: 0; }
        .crisis-header p:not(.section-label) { color: var(--text-muted); font-size: clamp(15.5px, 1.8vw, 18px); line-height: 1.65; margin-top: 14px; }
        .crisis-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .crisis-stat-card { position: relative; overflow: hidden; min-height: 390px; padding: 18px; border-radius: 28px; background: linear-gradient(145deg, rgba(255,255,255,.115), rgba(13,18,32,.78)); border: 1px solid rgba(190,215,255,.17); box-shadow: 0 18px 54px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter: blur(26px) saturate(160%); animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both, statFloat 7s ease-in-out infinite; transition: transform .22s, border-color .22s, box-shadow .22s; }
        .crisis-stat-card:before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 80% 0%, rgba(91,141,239,.18), transparent 38%), radial-gradient(circle at 0% 100%, rgba(167,139,250,.12), transparent 40%); }
        .crisis-stat-card:hover { transform: translateY(-6px); border-color: var(--border-glow); box-shadow: var(--glow), 0 20px 60px rgba(0,0,0,.42); }
        .card-topline { position: relative; display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .card-topline p { color: var(--text); font-size: 15px; font-weight: 900; margin: 0 0 10px; }
        .card-topline strong { display: block; font-size: clamp(36px, 4vw, 48px); letter-spacing: -.055em; line-height: .95; background: linear-gradient(135deg, var(--text), var(--accent), var(--purple)); -webkit-background-clip: text; color: transparent; }
        .card-topline span { display: block; margin-top: 8px; color: var(--text-muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
        .card-icon { width: 44px; height: 44px; border-radius: 16px; display: grid; place-items: center; color: var(--accent); background: rgba(91,141,239,.13); border: 1px solid rgba(91,141,239,.30); box-shadow: 0 0 24px rgba(91,141,239,.16); flex-shrink: 0; }
        .chart-panel { position: relative; margin-top: 18px; padding: 12px 10px 8px; border-radius: 20px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); }
        .overdose-card { display: flex; flex-direction: column; min-height: 340px; padding: 18px; }
        .overdose-chart-panel { flex: 1; min-height: 174px; margin-top: 14px; padding: 14px 12px 10px; display: flex; flex-direction: column; justify-content: center; }
        .overdose-chart-svg { width: 100%; height: 128px; overflow: visible; }
        .trend-badge { align-self: flex-start; margin-bottom: 2px; padding: 5px 10px; border-radius: 999px; color: var(--gold); background: rgba(240,183,83,.13); border: 1px solid rgba(240,183,83,.28); font-size: 11px; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; box-shadow: 0 0 18px rgba(240,183,83,.12); }
        .chart-years { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-top: 3px; }
        .chart-years span { color: var(--text-dim); font-size: 8px; font-weight: 900; text-align: center; }
        .overdose-years span { color: var(--text-muted); }
        .overdose-bottom-metric { position: relative; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.09); }
        .overdose-bottom-metric strong { display: block; font-size: clamp(34px, 3.5vw, 44px); letter-spacing: -.055em; line-height: .9; background: linear-gradient(135deg, var(--text), var(--accent), var(--purple)); -webkit-background-clip: text; color: transparent; }
        .overdose-bottom-metric span { display: block; margin-top: 7px; color: var(--text-muted); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
        .overdose-bottom-metric small { display: flex; align-items: center; gap: 7px; margin-top: 10px; color: var(--text-dim); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .13em; }
        .overdose-bottom-metric small:before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 16px rgba(52,211,153,.45); }
        .analytics-line { stroke-dasharray: 540; stroke-dashoffset: 540; filter: drop-shadow(0 0 10px rgba(91,141,239,.55)); animation: drawLine 1.45s cubic-bezier(.22,1,.36,1) forwards; }
        .analytics-dot { opacity: 0; filter: drop-shadow(0 0 8px rgba(234,240,255,.7)); animation: fadeIn .45s ease forwards; }
        .recidivism-panel { min-height: 144px; }
        .mini-bars { position: absolute; left: 16px; right: 16px; bottom: 13px; height: 42px; display: flex; align-items: end; gap: 8px; opacity: .72; }
        .mini-bars span { flex: 1; border-radius: 999px 999px 6px 6px; background: linear-gradient(180deg, rgba(167,139,250,.9), rgba(91,141,239,.45)); transform-origin: bottom; animation: barRise .8s cubic-bezier(.22,1,.36,1) both; }
        .donut-wrap { display: grid; place-items: center; gap: 10px; margin-top: 18px; padding: 12px; min-height: 166px; border-radius: 20px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); }
        .donut-chart { width: 126px; height: 126px; border-radius: 50%; background: conic-gradient(var(--accent) 0 80%, rgba(255,255,255,.11) 80% 100%); display: grid; place-items: center; box-shadow: 0 0 34px rgba(91,141,239,.25); animation: donutPulse 3.2s ease-in-out infinite; }
        .donut-inner { width: 82px; height: 82px; border-radius: 50%; background: rgba(13,18,32,.94); display: grid; place-items: center; align-content: center; border: 1px solid rgba(255,255,255,.10); }
        .donut-inner strong { font-size: 25px; color: var(--text); line-height: 1; }
        .donut-inner span { color: var(--text-dim); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; margin-top: 5px; }
        .donut-caption { display: flex; gap: 9px; align-items: center; justify-content: center; flex-wrap: wrap; color: var(--text-muted); font-size: 10px; font-weight: 800; }
        .donut-caption span { width: 8px; height: 8px; border-radius: 999px; }
        .card-description { position: relative; min-height: 42px; color: var(--text-muted); font-size: 13px; line-height: 1.5; margin: 14px 0 12px; }
        .source-row { position: absolute; left: 18px; right: 18px; bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-dim); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .13em; }
        .source-row span { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 16px rgba(52,211,153,.45); }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes dotPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.25); } }
        @keyframes barRise { from { transform: scaleY(.2); opacity: .35; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes donutPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
        @keyframes statFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -4px; } }
        @media (max-width: 1050px) { .crisis-card-grid { grid-template-columns: 1fr; } .crisis-stat-card { min-height: 360px; } }
      `}</style>
    </section>
  );
}