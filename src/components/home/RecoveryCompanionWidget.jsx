import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gavel,
  HeartHandshake,
  MessageCircle,
  Music2,
  Phone,
  Pill,
  RefreshCw,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Wind,
} from "lucide-react";

const companionItems = [
  { id: "checkin", time: "8:00 AM", title: "Daily recovery check-in", type: "Grounding", icon: CalendarCheck, status: "complete", accent: "#34D399" },
  { id: "meeting", time: "12:30 PM", title: "Recovery meeting", type: "Support", icon: Users, status: "upcoming", accent: "#22D3EE" },
  { id: "therapy", time: "3:00 PM", title: "Counseling session", type: "Healing", icon: HeartHandshake, status: "upcoming", accent: "#F0B753" },
  { id: "court", time: "4:15 PM", title: "Court reminder", type: "Stability", icon: Gavel, status: "missed", accent: "#A78BFA" },
  { id: "meds", time: "8:30 PM", title: "Medication reminder", type: "Care", icon: Pill, status: "later", accent: "#34D399" },
  { id: "mentor", time: "9:00 PM", title: "Sponsor / mentor check-in", type: "Connection", icon: MessageCircle, status: "later", accent: "#22D3EE" },
];

const reasons = [
  "I forgot",
  "I didn’t have transportation",
  "I felt overwhelmed",
  "I didn’t want to go",
  "I had work/family conflict",
  "I relapsed or struggled today",
  "Other",
];

const supportCopy = {
  "I forgot": "That happens. Let’s make the next reminder harder to miss — earlier alert, second alert, and a clear reason why it matters.",
  "I didn’t have transportation": "Transportation can derail even good intentions. Let’s add a ride plan before the next appointment.",
  "I felt overwhelmed": "You’re not weak for feeling overwhelmed. Try a breathing reset, calming music, or ask a trusted person to check in.",
  "I didn’t want to go": "Thank you for being honest. What would make the next appointment feel easier or less heavy?",
  "I had work/family conflict": "Life gets complicated. Let’s build a backup plan and reschedule without turning this into shame.",
  "I relapsed or struggled today": "Missing one thing does not erase your progress. Please reach out to a trusted person, sponsor, mentor, or crisis-safe support if you feel unsafe.",
  Other: "Thanks for naming it. We can still adjust the plan and help you take the next right step.",
};

const preventionActions = [
  { label: "Add earlier reminder", icon: Bell },
  { label: "Add second reminder", icon: RefreshCw },
  { label: "Add transportation note", icon: Car },
  { label: "Add sponsor/mentor reminder", icon: MessageCircle },
  { label: "Add motivational reason", icon: Sparkles },
  { label: "Add emergency backup contact", icon: Phone },
  { label: "Reschedule appointment", icon: CalendarCheck },
  { label: "Mark as completed late", icon: CheckCircle2 },
];

const goals = ["Family", "Career", "Health", "Stability", "Purpose"];

export default function RecoveryCompanionWidget() {
  const missedItem = companionItems.find((item) => item.status === "missed");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);

  const completedCount = companionItems.filter((item) => item.status === "complete").length;
  const upcomingCount = companionItems.filter((item) => item.status === "upcoming" || item.status === "later").length;

  const supportiveResponse = useMemo(() => {
    if (!selectedReason) return "We’re not here to punish you. We’re here to help you get back on track.";
    return supportCopy[selectedReason];
  }, [selectedReason]);

  const toggleAction = (label) => {
    setSelectedActions((current) => current.includes(label)
      ? current.filter((item) => item !== label)
      : [...current, label]
    );
  };

  return (
    <section className="recovery-companion-section">
      <div className="companion-orb companion-orb-one" aria-hidden="true" />
      <div className="companion-orb companion-orb-two" aria-hidden="true" />
      <div className="companion-particles" aria-hidden="true"><span /><span /><span /><span /><span /></div>

      <div className="companion-header">
        <div>
          <p className="section-label">Recovery Companion Widget</p>
          <h2>Accountability without shame.</h2>
          <p>Today’s reminders, meetings, goals, and gentle recovery support — built to help users stay connected throughout the day.</p>
        </div>
        <div className="companion-mantra">
          <Shield size={18} />
          <span>Missing one thing does not erase your progress.</span>
        </div>
      </div>

      <div className="companion-layout">
        <div className="companion-main-card">
          <div className="companion-card-top">
            <div>
              <span>Today’s recovery rhythm</span>
              <h3>{completedCount} done · {upcomingCount} still ahead</h3>
            </div>
            <div className="companion-score-ring">
              <strong>82</strong>
              <span>steady</span>
            </div>
          </div>

          <div className="companion-timeline">
            {companionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`companion-item ${item.status}`} style={{ "--item-accent": item.accent }}>
                  <div className="item-icon"><Icon size={18} /></div>
                  <div>
                    <span>{item.time} · {item.type}</span>
                    <p>{item.title}</p>
                  </div>
                  <i>{item.status === "complete" ? "Done" : item.status === "missed" ? "Follow up" : "Upcoming"}</i>
                </div>
              );
            })}
          </div>

          {missedItem && (
            <div className="gentle-follow-up">
              <div className="follow-up-copy">
                <Clock size={18} />
                <div>
                  <h4>We noticed you missed this. No judgment. What happened?</h4>
                  <p>Accountability means helping you understand the barrier — not making you feel worse.</p>
                </div>
              </div>

              <div className="reason-grid">
                {reasons.map((reason) => (
                  <button key={reason} className={selectedReason === reason ? "active" : ""} onClick={() => setSelectedReason(reason)}>
                    {reason}
                  </button>
                ))}
              </div>

              <div className="support-response">
                <HeartHandshake size={18} />
                <p>{supportiveResponse}</p>
              </div>
            </div>
          )}

          <div className="prevent-next-time">
            <div className="prevent-head">
              <h4>Prevent This Next Time</h4>
              <span>{selectedActions.length} plan step{selectedActions.length === 1 ? "" : "s"} selected</span>
            </div>
            <div className="prevention-grid">
              {preventionActions.map(({ label, icon: Icon }) => (
                <button key={label} className={selectedActions.includes(label) ? "selected" : ""} onClick={() => toggleAction(label)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="companion-side-card">
          <div className="mobile-widget-preview">
            <div className="mobile-widget-top">
              <Smartphone size={16} />
              <span>Widget Preview</span>
            </div>
            <div className="phone-widget-card">
              <div className="phone-widget-head">
                <div>
                  <span>ReZilient</span>
                  <h4>Stay steady today</h4>
                </div>
                <Sparkles size={18} />
              </div>
              <div className="phone-widget-next">
                <CalendarCheck size={16} />
                <div>
                  <span>Next up · 12:30 PM</span>
                  <p>Recovery meeting</p>
                </div>
                <ChevronRight size={15} />
              </div>
              <div className="phone-widget-actions">
                <button><Wind size={13} /> Breathe</button>
                <button><Music2 size={13} /> Calm</button>
              </div>
            </div>
          </div>

          <div className="daily-reminder-card">
            <Sparkles size={18} />
            <div>
              <span>Motivational reminder of the day</span>
              <p>“You don’t need a perfect day. You just need one honest next step.”</p>
            </div>
          </div>

          <div className="goals-preview-card">
            <div className="goals-preview-head">
              <Target size={18} />
              <span>Top 5 non-negotiables</span>
            </div>
            {goals.map((goal, index) => (
              <div key={goal} className="goal-row">
                <strong>{index + 1}</strong>
                <p>{goal}</p>
                <i style={{ width: `${90 - index * 9}%` }} />
              </div>
            ))}
          </div>
        </aside>
      </div>

      <style>{`
        .recovery-companion-section { position: relative; margin: 0 0 88px; padding: clamp(26px, 5vw, 52px); border-radius: 42px; overflow: hidden; background: radial-gradient(circle at 18% 12%, rgba(34,211,238,.15), transparent 32%), radial-gradient(circle at 92% 12%, rgba(240,183,83,.12), transparent 30%), linear-gradient(145deg, rgba(4,7,13,.94), rgba(13,18,32,.78)); border: 1px solid rgba(190,225,255,.14); box-shadow: 0 34px 90px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(32px) saturate(165%); }
        .recovery-companion-section:before { content: ''; position: absolute; inset: 0; opacity: .12; background-image: radial-gradient(circle, rgba(255,255,255,.9) 0 1px, transparent 1.5px); background-size: 52px 52px; animation: companionParticleDrift 28s linear infinite; pointer-events: none; }
        .companion-orb { position: absolute; border-radius: 999px; filter: blur(36px); pointer-events: none; animation: companionFloat 9s ease-in-out infinite; }
        .companion-orb-one { width: 340px; height: 340px; top: -120px; right: -90px; background: rgba(34,211,238,.22); }
        .companion-orb-two { width: 280px; height: 280px; left: -80px; bottom: -110px; background: rgba(240,183,83,.16); animation-delay: -3s; }
        .companion-particles span { position: absolute; width: 5px; height: 5px; border-radius: 999px; background: #22D3EE; opacity: .48; animation: companionTinyFloat 5.4s ease-in-out infinite; }
        .companion-particles span:nth-child(1) { top: 16%; right: 22%; } .companion-particles span:nth-child(2) { top: 38%; right: 8%; animation-delay: -1s; } .companion-particles span:nth-child(3) { left: 9%; bottom: 28%; animation-delay: -2s; } .companion-particles span:nth-child(4) { right: 38%; bottom: 12%; animation-delay: -3s; } .companion-particles span:nth-child(5) { left: 44%; top: 19%; animation-delay: -4s; background: #F0B753; }
        .companion-header, .companion-layout { position: relative; z-index: 1; }
        .companion-header { display: flex; justify-content: space-between; align-items: end; gap: 22px; margin-bottom: 28px; }
        .companion-header h2 { margin: 0; font-size: clamp(34px, 5vw, 64px); line-height: .96; letter-spacing: -.045em; text-shadow: 0 0 34px rgba(34,211,238,.20); }
        .companion-header p:not(.section-label) { margin: 16px 0 0; max-width: 720px; color: var(--text-muted); font-size: clamp(15px, 1.5vw, 18px); line-height: 1.72; }
        .companion-mantra { max-width: 300px; display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-radius: 22px; color: #EAF0FF; background: rgba(255,255,255,.065); border: 1px solid rgba(34,211,238,.22); box-shadow: 0 0 24px rgba(34,211,238,.12), inset 0 1px 0 rgba(255,255,255,.08); }
        .companion-mantra svg { color: #34D399; flex-shrink: 0; }
        .companion-mantra span { font-size: 13px; line-height: 1.45; font-weight: 800; }
        .companion-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(320px, .65fr); gap: 22px; }
        .companion-main-card, .companion-side-card > div { background: linear-gradient(155deg, rgba(255,255,255,.105), rgba(255,255,255,.04)); border: 1px solid rgba(190,225,255,.14); border-radius: 32px; box-shadow: 0 22px 58px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(24px) saturate(160%); }
        .companion-main-card { padding: 24px; }
        .companion-card-top { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 18px; }
        .companion-card-top span, .mobile-widget-top span, .daily-reminder-card span, .goals-preview-head span { color: #22D3EE; font-size: 10.5px; font-weight: 950; text-transform: uppercase; letter-spacing: .14em; }
        .companion-card-top h3 { margin: 5px 0 0; font-size: 24px; }
        .companion-score-ring { width: 78px; height: 78px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#34D399 82%, rgba(255,255,255,.12) 0); box-shadow: 0 0 30px rgba(52,211,153,.20); position: relative; flex-shrink: 0; }
        .companion-score-ring:before { content: ''; position: absolute; inset: 7px; border-radius: 50%; background: rgba(7,10,20,.86); }
        .companion-score-ring strong, .companion-score-ring span { position: relative; z-index: 1; grid-area: 1/1; }
        .companion-score-ring strong { color: var(--text); font-size: 22px; transform: translateY(-5px); }
        .companion-score-ring span { color: var(--text-muted); font-size: 10px; transform: translateY(14px); letter-spacing: .04em; }
        .companion-timeline { display: grid; gap: 10px; }
        .companion-item { display: grid; grid-template-columns: 44px 1fr auto; gap: 12px; align-items: center; padding: 12px; border-radius: 20px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.09); transition: transform .22s, border-color .22s, background .22s; }
        .companion-item:hover { transform: translateX(4px); border-color: color-mix(in srgb, var(--item-accent) 42%, transparent); background: rgba(255,255,255,.075); }
        .item-icon { width: 44px; height: 44px; border-radius: 16px; display: grid; place-items: center; color: var(--item-accent); background: color-mix(in srgb, var(--item-accent) 14%, transparent); border: 1px solid color-mix(in srgb, var(--item-accent) 28%, transparent); box-shadow: 0 0 18px color-mix(in srgb, var(--item-accent) 16%, transparent); }
        .companion-item span { color: var(--text-dim); font-size: 11px; font-weight: 800; }
        .companion-item p { margin: 3px 0 0; color: var(--text); font-size: 14px; font-weight: 850; }
        .companion-item i { font-style: normal; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: .09em; color: var(--item-accent); }
        .companion-item.missed { border-color: rgba(240,183,83,.28); background: rgba(240,183,83,.07); }
        .gentle-follow-up, .prevent-next-time { margin-top: 16px; padding: 18px; border-radius: 26px; background: rgba(0,0,0,.18); border: 1px solid rgba(255,255,255,.10); }
        .follow-up-copy, .support-response, .daily-reminder-card, .goals-preview-head { display: flex; gap: 12px; align-items: flex-start; }
        .follow-up-copy svg, .support-response svg, .daily-reminder-card svg { color: #F0B753; flex-shrink: 0; }
        .follow-up-copy h4, .prevent-head h4 { margin: 0; color: var(--text); font-size: 18px; }
        .follow-up-copy p, .support-response p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.55; }
        .reason-grid, .prevention-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .reason-grid button, .prevention-grid button, .phone-widget-actions button { min-height: 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: var(--text-muted); padding: 0 12px; font-size: 12px; font-weight: 850; cursor: pointer; transition: transform .2s, background .2s, color .2s, border-color .2s; }
        .reason-grid button:hover, .prevention-grid button:hover, .reason-grid button.active, .prevention-grid button.selected { transform: translateY(-2px); color: #07101f; background: linear-gradient(135deg, #22D3EE, #F0B753); border-color: rgba(255,255,255,.34); }
        .support-response { margin-top: 14px; padding: 13px; border-radius: 18px; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.18); }
        .support-response svg { color: #34D399; }
        .prevent-head { display: flex; justify-content: space-between; gap: 14px; align-items: center; }
        .prevent-head span { color: var(--text-dim); font-size: 11px; font-weight: 850; }
        .prevention-grid button { display: inline-flex; align-items: center; gap: 6px; }
        .companion-side-card { display: grid; gap: 16px; }
        .mobile-widget-preview, .daily-reminder-card, .goals-preview-card { padding: 18px; }
        .mobile-widget-top { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .mobile-widget-top svg, .goals-preview-head svg { color: #22D3EE; }
        .phone-widget-card { padding: 16px; border-radius: 28px; background: linear-gradient(160deg, rgba(6,10,18,.96), rgba(23,31,49,.88)); border: 1px solid rgba(255,255,255,.14); box-shadow: 0 20px 44px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.12); }
        .phone-widget-head, .phone-widget-next { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
        .phone-widget-head span, .phone-widget-next span { color: var(--text-dim); font-size: 11px; font-weight: 850; }
        .phone-widget-head h4 { margin: 3px 0 0; font-size: 20px; }
        .phone-widget-head svg { color: #F0B753; }
        .phone-widget-next { margin-top: 14px; padding: 12px; border-radius: 18px; background: rgba(34,211,238,.09); border: 1px solid rgba(34,211,238,.18); }
        .phone-widget-next svg { color: #22D3EE; flex-shrink: 0; }
        .phone-widget-next p { margin: 2px 0 0; color: var(--text); font-size: 13px; font-weight: 850; }
        .phone-widget-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
        .phone-widget-actions button { display: inline-flex; justify-content: center; align-items: center; gap: 6px; color: var(--text); }
        .daily-reminder-card p { margin: 5px 0 0; color: var(--text); font-family: 'Lora', Georgia, serif; font-size: 17px; line-height: 1.42; }
        .goals-preview-card { display: grid; gap: 10px; }
        .goal-row { display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: center; }
        .goal-row strong { width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; color: #07101f; background: linear-gradient(135deg, #F0B753, #22D3EE); font-size: 12px; }
        .goal-row p { margin: 0; color: var(--text); font-size: 13px; font-weight: 850; }
        .goal-row i { grid-column: 2; height: 4px; border-radius: 999px; background: linear-gradient(90deg, #22D3EE, #F0B753); box-shadow: 0 0 12px rgba(34,211,238,.24); }
        @keyframes companionParticleDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-52px,-52px,0); } }
        @keyframes companionFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-10px,12px,0) scale(1.04); } }
        @keyframes companionTinyFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); opacity: .35; } 50% { transform: translate3d(8px,-14px,0) scale(1.45); opacity: .82; } }
        @media (max-width: 1100px) { .companion-header, .companion-layout { grid-template-columns: 1fr; } .companion-header { display: grid; } .companion-mantra { max-width: none; } .companion-layout { display: grid; } }
        @media (max-width: 680px) { .recovery-companion-section { padding: 24px 16px; border-radius: 30px; } .companion-main-card { padding: 18px; border-radius: 26px; } .companion-card-top, .prevent-head { align-items: flex-start; flex-direction: column; } .companion-item { grid-template-columns: 42px 1fr; } .companion-item i { grid-column: 2; } .reason-grid button, .prevention-grid button { flex: 1 1 100%; } }
      `}</style>
    </section>
  );
}