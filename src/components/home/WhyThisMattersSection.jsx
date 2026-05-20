import React, { useState } from "react";
import { Briefcase, CalendarX2, ChevronDown, Clock3, FileText, HeartHandshake, RotateCcw, ShieldCheck } from "lucide-react";

function RecoveryTimeline() {
  return (
    <div className="impact-viz timeline-viz">
      {["Day 1", "30", "60", "90"].map((label, index) => (
        <div key={label} className={`timeline-node node-${index + 1}`}>
          <span />
          <p>{label}</p>
        </div>
      ))}
      <div className="risk-band"><strong>Elevated support need</strong></div>
    </div>
  );
}

function ReentryLineGraph() {
  return (
    <div className="impact-viz line-viz">
      <svg viewBox="0 0 280 126">
        {[34, 64, 94].map((y) => <line key={y} x1="12" x2="268" y1={y} y2={y} />)}
        <path d="M18 92 C52 44, 82 32, 116 42 S180 76, 214 64 S246 48, 264 54" className="line-glow" />
        <path d="M18 92 C52 44, 82 32, 116 42 S180 76, 214 64 S246 48, 264 54" className="line-main" />
        <circle cx="76" cy="34" r="5" /><circle cx="154" cy="68" r="5" /><circle cx="264" cy="54" r="5" />
      </svg>
      <div className="line-labels"><span>Release</span><span>6 months</span><span>1 year</span></div>
    </div>
  );
}

function AppointmentTracker() {
  return (
    <div className="impact-viz appointment-viz">
      {[
        ["Check-in", true], ["Meeting", true], ["Court", false], ["Mentor", true], ["Therapy", true],
      ].map(([label, done]) => (
        <div key={label} className={done ? "done" : "missed"}>
          <span>{done ? "✓" : "!"}</span>
          <p>{label}</p>
        </div>
      ))}
    </div>
  );
}

function StabilityDashboard() {
  return (
    <div className="impact-viz stability-viz">
      <div className="stability-ring"><strong>Stable</strong><span>routine + work</span></div>
      <div className="stability-bars">
        <p><span style={{ width: "72%" }} />Job readiness</p>
        <p><span style={{ width: "64%" }} />Daily routine</p>
        <p><span style={{ width: "81%" }} />Goal momentum</p>
      </div>
    </div>
  );
}

const cards = [
  {
    title: "Recovery Support Gap",
    icon: HeartHandshake,
    stat: "First 90 days",
    source: "SAMHSA / NIDA research",
    viz: <RecoveryTimeline />,
    explanation: "The transition back into daily life is when many people face transportation issues, housing instability, isolation, and missed appointments.",
    why: "Early recovery needs structure, reminders, and connection before small barriers become bigger setbacks.",
    response: "Recovery Companion + reminders + accountability tools + support resources",
    sourceDetail: "SAMHSA and NIDA publications describe continuing care, recovery supports, relapse vulnerability, and the importance of ongoing services after treatment.",
  },
  {
    title: "Repeat Incarceration & Reentry Challenges",
    icon: RotateCcw,
    stat: "~44% rearrested within one year",
    source: "Bureau of Justice Statistics",
    viz: <ReentryLineGraph />,
    explanation: "Many people return to difficult environments without structure or support.",
    why: "Reentry risk is often connected to housing, employment, supervision pressure, transportation, and untreated recovery needs.",
    response: "Justice Radar + transportation + employment + recovery roadmap",
    sourceDetail: "Bureau of Justice Statistics recidivism reports have found high rearrest rates among released individuals, including roughly 44% within the first year in major cohort studies.",
  },
  {
    title: "Missed Appointment Risk",
    icon: CalendarX2,
    stat: "Live engagement signal",
    source: "ReZilient accountability model",
    viz: <AppointmentTracker />,
    explanation: "Small disruptions can create larger setbacks if support systems disappear.",
    why: "A missed meeting, court date, check-in, or counseling session should trigger support — not shame.",
    response: "Accountability Without Shame system: “No judgment. What happened?”",
    sourceDetail: "This metric area is designed for live engagement data from check-ins, meetings, reminders, and companion interactions inside ReZilient.",
  },
  {
    title: "Employment & Stability",
    icon: Briefcase,
    stat: "Work + routine drive stability",
    source: "NIJ / reentry workforce research",
    viz: <StabilityDashboard />,
    explanation: "Employment and routine often become major foundations of long-term stability.",
    why: "Income, schedule, purpose, and daily momentum can reduce instability during reentry and recovery.",
    response: "Job resources + daily goals + progress tracking",
    sourceDetail: "National Institute of Justice and public reentry workforce research discuss employment, training, and stable routines as key factors in successful reintegration.",
  },
];

export default function WhyThisMattersSection() {
  const [openSource, setOpenSource] = useState(null);

  return (
    <section className="impact-intelligence-section">
      <div className="impact-header">
        <p className="section-label">Why This Matters</p>
        <h2>Mission-driven recovery & reentry intelligence.</h2>
        <p>Evidence-based signals that show why people need support after treatment, release, supervision, and major life disruption.</p>
      </div>

      <div className="impact-card-grid">
        {cards.map(({ title, icon: Icon, stat, source, viz, explanation, why, response, sourceDetail }, index) => {
          const isOpen = openSource === title;
          return (
            <article key={title} className="impact-card" style={{ animationDelay: `${index * 120}ms` }}>
              <div className="impact-card-top">
                <div className="impact-icon"><Icon size={22} /></div>
                <div>
                  <span>{source}</span>
                  <h3>{title}</h3>
                </div>
              </div>

              <strong className="impact-stat">{stat}</strong>
              {viz}
              <p className="impact-explanation">{explanation}</p>

              <div className="impact-detail-block">
                <h4><ShieldCheck size={15} /> Why this matters</h4>
                <p>{why}</p>
              </div>

              <div className="impact-detail-block response-block">
                <h4><Clock3 size={15} /> How ReZilient responds</h4>
                <p>{response}</p>
              </div>

              <button className="source-toggle" onClick={() => setOpenSource(isOpen ? null : title)}>
                <FileText size={14} /> View Source <ChevronDown size={14} className={isOpen ? "open" : ""} />
              </button>

              {isOpen && <div className="source-detail">{sourceDetail}</div>}
            </article>
          );
        })}
      </div>

      <p className="impact-footer-note">Information is educational and sourced from public organizations.</p>

      <style>{`
        .impact-intelligence-section { position: relative; margin-bottom: 78px; padding: clamp(26px, 4vw, 42px); border-radius: 42px; overflow: hidden; background: radial-gradient(circle at 15% 12%, rgba(34,211,238,.13), transparent 32%), radial-gradient(circle at 90% 10%, rgba(240,183,83,.10), transparent 28%), linear-gradient(145deg, rgba(4,7,13,.92), rgba(13,18,32,.76)); border: 1px solid rgba(190,225,255,.14); box-shadow: 0 34px 90px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(32px) saturate(165%); }
        .impact-intelligence-section:before { content: ''; position: absolute; inset: 0; opacity: .11; background-image: radial-gradient(circle, rgba(255,255,255,.9) 0 1px, transparent 1.5px); background-size: 54px 54px; animation: impactDrift 28s linear infinite; pointer-events: none; }
        .impact-header, .impact-card-grid, .impact-footer-note { position: relative; z-index: 1; }
        .impact-header { max-width: 850px; margin-bottom: 24px; }
        .impact-header h2 { font-size: clamp(34px, 5vw, 62px); line-height: .96; margin: 0; letter-spacing: -.045em; }
        .impact-header p:not(.section-label) { color: var(--text-muted); font-size: clamp(15.5px, 1.8vw, 18px); line-height: 1.68; margin-top: 14px; }
        .impact-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .impact-card { position: relative; overflow: hidden; min-height: 610px; padding: 22px; border-radius: 30px; background: linear-gradient(145deg, rgba(255,255,255,.105), rgba(13,18,32,.80)); border: 1px solid rgba(190,215,255,.16); box-shadow: 0 18px 54px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter: blur(26px) saturate(160%); animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both, impactFloat 7s ease-in-out infinite; transition: transform .24s, border-color .24s, box-shadow .24s; }
        .impact-card:before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 82% 0%, rgba(34,211,238,.14), transparent 36%), radial-gradient(circle at 0% 100%, rgba(240,183,83,.09), transparent 38%); }
        .impact-card:hover { transform: translateY(-7px); border-color: rgba(34,211,238,.32); box-shadow: 0 0 38px rgba(34,211,238,.18), 0 22px 64px rgba(0,0,0,.44); }
        .impact-card > * { position: relative; z-index: 1; }
        .impact-card-top { display: flex; gap: 13px; align-items: flex-start; }
        .impact-icon { width: 50px; height: 50px; border-radius: 18px; display: grid; place-items: center; color: #22D3EE; background: rgba(34,211,238,.10); border: 1px solid rgba(34,211,238,.24); box-shadow: 0 0 24px rgba(34,211,238,.14); flex-shrink: 0; }
        .impact-card-top span { color: var(--text-dim); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .11em; }
        .impact-card-top h3 { margin: 5px 0 0; font-size: 24px; line-height: 1.12; }
        .impact-stat { display: block; margin-top: 20px; font-size: clamp(31px, 4vw, 48px); line-height: .96; letter-spacing: -.055em; background: linear-gradient(135deg, var(--text), #22D3EE, #F0B753); -webkit-background-clip: text; color: transparent; }
        .impact-viz { margin-top: 18px; min-height: 154px; padding: 16px; border-radius: 22px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.09); }
        .timeline-viz { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; gap: 8px; }
        .timeline-viz:before { content: ''; position: absolute; left: 38px; right: 38px; top: 57px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #F0B753, #22D3EE); box-shadow: 0 0 18px rgba(34,211,238,.28); }
        .timeline-node { position: relative; display: grid; justify-items: center; gap: 9px; z-index: 1; }
        .timeline-node span { width: 24px; height: 24px; border-radius: 999px; background: #22D3EE; border: 4px solid rgba(7,10,20,.92); box-shadow: 0 0 22px rgba(34,211,238,.38); animation: nodePulse 2.6s ease-in-out infinite; }
        .node-1 span, .node-2 span { background: #F0B753; box-shadow: 0 0 22px rgba(240,183,83,.38); }
        .timeline-node p { margin: 0; color: var(--text-muted); font-size: 11px; font-weight: 900; }
        .risk-band { position: absolute; left: 15px; right: 15px; bottom: 14px; padding: 8px 12px; border-radius: 999px; text-align: center; color: #F0B753; background: rgba(240,183,83,.10); border: 1px solid rgba(240,183,83,.22); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
        .line-viz svg { width: 100%; height: 126px; overflow: visible; }
        .line-viz line { stroke: rgba(255,255,255,.08); }
        .line-glow { fill: none; stroke: rgba(34,211,238,.13); stroke-width: 14; stroke-linecap: round; }
        .line-main { fill: none; stroke: url(#impactGradient); stroke-width: 4.5; stroke-linecap: round; stroke-dasharray: 520; stroke-dashoffset: 520; animation: drawImpactLine 1.5s cubic-bezier(.22,1,.36,1) forwards; }
        .line-viz circle { fill: #EAF0FF; filter: drop-shadow(0 0 8px rgba(34,211,238,.7)); }
        .line-labels { display: flex; justify-content: space-between; color: var(--text-dim); font-size: 10px; font-weight: 900; }
        .appointment-viz { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; align-items: stretch; }
        .appointment-viz div { display: grid; place-items: center; align-content: center; gap: 8px; min-height: 118px; border-radius: 18px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.09); }
        .appointment-viz span { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 999px; font-weight: 950; }
        .appointment-viz .done span { color: #07101f; background: #34D399; box-shadow: 0 0 18px rgba(52,211,153,.30); }
        .appointment-viz .missed span { color: #07101f; background: #F0B753; box-shadow: 0 0 18px rgba(240,183,83,.34); }
        .appointment-viz p { margin: 0; color: var(--text-muted); font-size: 10px; font-weight: 850; text-align: center; }
        .stability-viz { display: grid; grid-template-columns: 135px 1fr; gap: 18px; align-items: center; }
        .stability-ring { width: 124px; height: 124px; border-radius: 50%; display: grid; place-items: center; align-content: center; background: conic-gradient(#22D3EE 74%, rgba(255,255,255,.12) 0); box-shadow: 0 0 32px rgba(34,211,238,.20); border: 8px solid rgba(7,10,20,.64); }
        .stability-ring strong { color: var(--text); font-size: 18px; }
        .stability-ring span { color: var(--text-dim); font-size: 10px; margin-top: 4px; }
        .stability-bars { display: grid; gap: 14px; }
        .stability-bars p { margin: 0; color: var(--text-muted); font-size: 11px; font-weight: 850; }
        .stability-bars span { display: block; height: 6px; margin-bottom: 6px; border-radius: 999px; background: linear-gradient(90deg, #22D3EE, #F0B753); box-shadow: 0 0 14px rgba(34,211,238,.24); }
        .impact-explanation { color: var(--text-muted); font-size: 14px; line-height: 1.58; margin: 16px 0; }
        .impact-detail-block { padding: 13px; border-radius: 18px; background: rgba(0,0,0,.16); border: 1px solid rgba(255,255,255,.09); margin-top: 10px; }
        .impact-detail-block h4 { display: flex; align-items: center; gap: 7px; margin: 0 0 7px; color: var(--text); font-size: 13px; }
        .impact-detail-block h4 svg { color: #22D3EE; }
        .impact-detail-block p { margin: 0; color: var(--text-muted); font-size: 12.5px; line-height: 1.5; }
        .response-block { border-color: rgba(52,211,153,.16); background: rgba(52,211,153,.065); }
        .response-block h4 svg { color: #34D399; }
        .source-toggle { display: inline-flex; align-items: center; gap: 7px; margin-top: 14px; min-height: 38px; padding: 0 13px; border-radius: 999px; border: 1px solid rgba(190,225,255,.14); background: rgba(255,255,255,.06); color: var(--text-muted); font-size: 12px; font-weight: 900; cursor: pointer; }
        .source-toggle:hover { color: #07101f; background: linear-gradient(135deg, #22D3EE, #F0B753); }
        .source-toggle .open { transform: rotate(180deg); }
        .source-detail { margin-top: 10px; padding: 12px; border-radius: 16px; color: var(--text-muted); font-size: 12px; line-height: 1.5; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); }
        .impact-footer-note { margin: 22px 0 0; color: var(--text-dim); font-size: 11px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; text-align: center; }
        @keyframes impactDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-54px,-54px,0); } }
        @keyframes impactFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -4px; } }
        @keyframes nodePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
        @keyframes drawImpactLine { to { stroke-dashoffset: 0; } }
        @media (max-width: 1050px) { .impact-card-grid { grid-template-columns: 1fr; } .impact-card { min-height: auto; } }
        @media (max-width: 640px) { .impact-intelligence-section { padding: 24px 16px; border-radius: 30px; } .appointment-viz { grid-template-columns: 1fr; } .stability-viz { grid-template-columns: 1fr; justify-items: center; } }
      `}</style>
      <svg width="0" height="0" aria-hidden="true"><defs><linearGradient id="impactGradient" x1="0" x2="1"><stop stopColor="#F0B753"/><stop offset=".52" stopColor="#22D3EE"/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs></svg>
    </section>
  );
}