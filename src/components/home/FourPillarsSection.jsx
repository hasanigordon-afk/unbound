import React from "react";
import {
  Brain,
  CalendarCheck,
  Compass,
  Flag,
  Handshake,
  Headphones,
  HeartPulse,
  MapPinned,
  Mic2,
  PenLine,
  PlayCircle,
  ShieldAlert,
  Sprout,
  Target,
  TrendingUp,
} from "lucide-react";
import PillarEcosystemCard from "@/components/home/pillars/PillarEcosystemCard";

const pillars = [
  {
    title: "Help",
    icon: Handshake,
    color: "#22D3EE",
    headline: "Real support when life gets heavy.",
    description: "Find practical resources designed to help users rebuild stability and move forward.",
    rotating: ["Housing assistance", "Food resources", "Transportation help", "Veteran support"],
    stats: [
      { value: 84, label: "housing resources found near you" },
      { value: 42, label: "available food resources" },
      { value: 29, label: "job opportunities nearby" },
    ],
    actions: [
      { label: "Find Help", to: "/RecoveryHub", icon: Compass },
      { label: "Resource Map", to: "/VeteranResourceMap", icon: MapPinned },
      { label: "Emergency Contacts", to: "/MySafetyPlan", icon: ShieldAlert },
    ],
    tools: [
      { label: "Housing assistance", icon: "housing" },
      { label: "Food resources", icon: "food" },
      { label: "Transportation help", icon: "map" },
      { label: "Job opportunities", icon: "jobs" },
      { label: "Treatment finder", icon: "support" },
      { label: "Veteran support", icon: "support" },
      { label: "Reentry services", icon: "journey" },
      { label: "Legal assistance", icon: "support" },
      { label: "Community organizations", icon: "map" },
    ],
    nextSteps: ["Search resources by location", "Save the closest support option", "Build a stability plan"],
    previewType: "map",
  },
  {
    title: "Hope",
    icon: Sprout,
    color: "#F0B753",
    headline: "Proof that comebacks happen every day.",
    description: "Stories from people who changed their lives and decided they wanted more.",
    rotating: ["Ah Ha Moments", "Recovery testimonials", "Comeback videos", "Daily inspiration"],
    stats: [
      { value: 12483, label: "people inspired today" },
      { value: 316, label: "stories shared" },
      { value: 58, label: "new comeback videos" },
    ],
    actions: [
      { label: "Watch Story", to: "/AhHaCommunity", icon: PlayCircle },
      { label: "Share My Story", to: "/SubmitAhHa", icon: Mic2 },
      { label: "Listen", to: "/HopeHub", icon: Headphones },
    ],
    tools: [
      { label: "Ah Ha Moments", icon: "spark" },
      { label: "Recovery testimonials", icon: "support" },
      { label: "Overdose survivor stories", icon: "support" },
      { label: "Comeback videos", icon: "spark" },
      { label: "Podcast clips", icon: "spark" },
      { label: "Daily inspiration", icon: "spark" },
    ],
    nextSteps: ["Watch one comeback story", "Save a quote that hits home", "Share your Ah-Ha moment"],
    previewType: "story",
  },
  {
    title: "Healing",
    icon: Brain,
    color: "#34D399",
    headline: "Healing starts with small daily wins.",
    description: "Build habits and routines that help users stay grounded.",
    rotating: ["Daily check-ins", "Mood tracker", "Breathing exercises", "Panic relief tools"],
    stats: [
      { value: 7, label: "current streak" },
      { value: 72, label: "weekly progress", suffix: "%" },
      { value: 18, label: "calm sessions completed" },
    ],
    actions: [
      { label: "Check In", to: "/DailyCheckIn", icon: CalendarCheck },
      { label: "Journal", to: "/Journal", icon: PenLine },
      { label: "Calm Me Down", to: "/MentalReset", icon: HeartPulse },
    ],
    tools: [
      { label: "Daily check-ins", icon: "progress" },
      { label: "Journal", icon: "spark" },
      { label: "Mood tracker", icon: "progress" },
      { label: "Meditation", icon: "calm" },
      { label: "Binaural beats", icon: "calm" },
      { label: "Panic relief tools", icon: "support" },
      { label: "Breathing exercises", icon: "calm" },
      { label: "Accountability reminders", icon: "progress" },
    ],
    nextSteps: ["Complete today’s check-in", "Write one honest journal line", "Play a calming track"],
    previewType: "focus",
    music: true,
  },
  {
    title: "Growth",
    icon: TrendingUp,
    color: "#A78BFA",
    headline: "Build the future you deserve.",
    description: "Create goals and build routines for long-term transformation.",
    rotating: ["Top 5 life goals board", "AI planning assistant", "90 Day Rebuild roadmap", "Progress tracking"],
    stats: [
      { value: 14, label: "goals completed" },
      { value: 87, label: "weekly momentum score" },
      { value: 21, label: "growth streak" },
    ],
    actions: [
      { label: "My Goals", to: "/TopFiveNonNegotiables", icon: Target },
      { label: "AI Planner", to: "/AIAftercareTeam", icon: Brain },
      { label: "Start Today", to: "/NinetyDayReset", icon: Flag },
    ],
    tools: [
      { label: "Top 5 life goals board", icon: "progress" },
      { label: "AI planning assistant", icon: "spark" },
      { label: "90 Day Rebuild roadmap", icon: "journey" },
      { label: "Fitness plans", icon: "progress" },
      { label: "Education", icon: "spark" },
      { label: "Job readiness", icon: "jobs" },
      { label: "Daily habits", icon: "progress" },
      { label: "Progress tracking", icon: "progress" },
    ],
    nextSteps: ["Choose your top mission", "Let AI shape the next step", "Track one win today"],
    previewType: "mission",
  },
];

export default function FourPillarsSection() {
  return (
    <section className="four-pillars-ecosystem">
      <div className="pillars-section-head">
        <p className="section-label">The 4 Pillars</p>
        <h2>Help. Hope. Healing. Growth.</h2>
        <p>Everything ReZilient offers connects into one life rebuilding system: immediate support, real stories, daily healing, and long-term growth.</p>
      </div>

      <div className="pillars-ecosystem-grid">
        {pillars.map((pillar, index) => (
          <PillarEcosystemCard key={pillar.title} pillar={pillar} index={index} />
        ))}
      </div>

      <style>{`
        .four-pillars-ecosystem { position: relative; margin: 0 0 96px; padding: clamp(28px, 5vw, 54px); border-radius: 42px; overflow: hidden; background: radial-gradient(circle at 15% 15%, rgba(34,211,238,.14), transparent 32%), radial-gradient(circle at 88% 12%, rgba(240,183,83,.12), transparent 30%), linear-gradient(145deg, rgba(4,7,13,.92), rgba(13,18,32,.76)); border: 1px solid rgba(190,225,255,.14); box-shadow: 0 34px 90px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(32px) saturate(165%); }
        .four-pillars-ecosystem:before { content: ''; position: absolute; inset: 0; opacity: .16; background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px); background-size: 54px 54px; animation: pillarParticles 26s linear infinite; pointer-events: none; }
        .pillars-section-head { position: relative; z-index: 1; max-width: 850px; margin-bottom: 34px; }
        .pillars-section-head h2 { font-size: clamp(34px, 5vw, 66px); line-height: .94; margin: 0; letter-spacing: -.045em; text-shadow: 0 0 36px rgba(34,211,238,.20); }
        .pillars-section-head > p:last-child { max-width: 720px; color: var(--text-muted); font-size: clamp(15px, 1.5vw, 18px); line-height: 1.75; margin: 18px 0 0; }
        .pillars-ecosystem-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; align-items: stretch; }
        .pillar-ecosystem-card { min-height: 620px; position: relative; overflow: hidden; padding: 26px; border-radius: 34px; background: linear-gradient(155deg, rgba(255,255,255,.105), rgba(255,255,255,.035) 46%, rgba(0,0,0,.16)); border: 1px solid color-mix(in srgb, var(--pillar-color) 28%, rgba(255,255,255,.12)); box-shadow: 0 22px 58px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12); animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both, ecosystemFloat 8s ease-in-out infinite; transition: transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s, border-color .32s, background .32s; cursor: pointer; }
        .pillar-ecosystem-card:before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--pillar-color) 26%, transparent), transparent 34%), linear-gradient(135deg, rgba(255,255,255,.08), transparent 45%); opacity: .9; pointer-events: none; }
        .pillar-ecosystem-card:hover, .pillar-ecosystem-card.is-expanded { transform: translateY(-10px) scale(1.012); border-color: color-mix(in srgb, var(--pillar-color) 58%, white 18%); box-shadow: 0 0 46px color-mix(in srgb, var(--pillar-color) 30%, transparent), 0 34px 82px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.16); }
        .pillar-particles span { position: absolute; width: 5px; height: 5px; border-radius: 999px; background: var(--pillar-color); opacity: .5; filter: blur(.2px); animation: tinyFloat 5s ease-in-out infinite; }
        .pillar-particles span:nth-child(1) { top: 14%; right: 18%; }
        .pillar-particles span:nth-child(2) { top: 42%; right: 9%; animation-delay: -1.4s; }
        .pillar-particles span:nth-child(3) { left: 12%; bottom: 25%; animation-delay: -2.1s; }
        .pillar-particles span:nth-child(4) { right: 28%; bottom: 12%; animation-delay: -3s; }
        .pillar-topline, .pillar-copy, .pillar-rotator, .pillar-stats-grid, .pillar-actions, .pillar-expanded-zone, .pillar-preview-shell { position: relative; z-index: 1; }
        .pillar-topline { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .pillar-mega-icon { width: 76px; height: 76px; border-radius: 26px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, color-mix(in srgb, var(--pillar-color) 78%, white 10%), rgba(255,255,255,.08)); border: 1px solid rgba(255,255,255,.22); box-shadow: 0 0 34px color-mix(in srgb, var(--pillar-color) 38%, transparent), inset 0 1px 0 rgba(255,255,255,.22); animation: iconPulse 4.4s ease-in-out infinite; transition: transform .3s; }
        .pillar-ecosystem-card:hover .pillar-mega-icon, .pillar-ecosystem-card.is-expanded .pillar-mega-icon { transform: scale(1.08) rotate(-4deg); }
        .pillar-status { display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px; border-radius: 999px; font-size: 10px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; color: var(--pillar-color); background: rgba(255,255,255,.055); border: 1px solid color-mix(in srgb, var(--pillar-color) 32%, transparent); box-shadow: 0 0 20px color-mix(in srgb, var(--pillar-color) 12%, transparent); }
        .pillar-copy { margin-top: 26px; }
        .pillar-copy > span { color: var(--pillar-color); font-size: 12px; font-weight: 950; letter-spacing: .18em; text-transform: uppercase; font-family: 'Space Grotesk', 'DM Sans', sans-serif; }
        .pillar-copy h3 { margin: 10px 0 12px; font-size: clamp(25px, 3vw, 38px); line-height: 1.02; letter-spacing: -.035em; }
        .pillar-copy p { margin: 0; color: var(--text-muted); font-size: 15px; line-height: 1.65; max-width: 540px; }
        .pillar-rotator { margin-top: 18px; min-height: 44px; display: inline-flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 999px; color: var(--text); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.11); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); }
        .pillar-rotator svg { color: var(--pillar-color); }
        .pillar-stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
        .pillar-stats-grid div { padding: 14px 12px; border-radius: 20px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.10); min-height: 94px; }
        .pillar-stats-grid strong { display: block; color: var(--text); font-size: 22px; line-height: 1; text-shadow: 0 0 18px color-mix(in srgb, var(--pillar-color) 26%, transparent); }
        .pillar-stats-grid span { display: block; margin-top: 8px; color: var(--text-muted); font-size: 10.5px; line-height: 1.35; }
        .pillar-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .pillar-actions a, .floating-music-button { min-height: 40px; display: inline-flex; align-items: center; gap: 7px; padding: 0 14px; border-radius: 999px; text-decoration: none; color: #06101a; font-size: 12px; font-weight: 950; background: linear-gradient(135deg, var(--pillar-color), rgba(255,255,255,.78)); border: 1px solid rgba(255,255,255,.30); box-shadow: 0 0 24px color-mix(in srgb, var(--pillar-color) 22%, transparent), 0 12px 24px rgba(0,0,0,.24); transition: transform .22s, filter .22s, box-shadow .22s; }
        .pillar-actions a:hover, .floating-music-button:hover { transform: translateY(-3px); filter: brightness(1.08); }
        .pillar-expanded-zone { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; margin-top: 18px; max-height: 0; opacity: 0; transform: translateY(10px); overflow: hidden; transition: max-height .42s cubic-bezier(.22,1,.36,1), opacity .28s, transform .28s; }
        .pillar-ecosystem-card:hover .pillar-expanded-zone, .pillar-ecosystem-card.is-expanded .pillar-expanded-zone { max-height: 260px; opacity: 1; transform: translateY(0); }
        .pillar-tool-list { display: flex; flex-wrap: wrap; gap: 7px; align-content: flex-start; }
        .pillar-tool-list span { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border-radius: 999px; color: var(--text-muted); font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); }
        .pillar-tool-list svg { color: var(--pillar-color); }
        .pillar-next-steps { padding: 13px; border-radius: 20px; background: rgba(0,0,0,.16); border: 1px solid rgba(255,255,255,.09); }
        .pillar-next-steps > span { display: block; margin-bottom: 8px; color: var(--pillar-color); font-size: 10px; font-weight: 950; letter-spacing: .13em; text-transform: uppercase; }
        .pillar-next-steps p { display: flex; align-items: flex-start; gap: 7px; margin: 8px 0 0; color: var(--text-muted); font-size: 11.5px; line-height: 1.35; }
        .pillar-next-steps svg { flex-shrink: 0; color: var(--pillar-color); margin-top: 1px; }
        .pillar-preview-shell { margin-top: 18px; min-height: 144px; border-radius: 24px; overflow: hidden; background: linear-gradient(135deg, rgba(0,0,0,.22), rgba(255,255,255,.055)); border: 1px solid rgba(255,255,255,.10); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); }
        .mini-map-preview { position: relative; min-height: 144px; background-image: linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px); background-size: 28px 28px; }
        .mini-map-preview:before { content: ''; position: absolute; inset: 12%; border: 1px dashed rgba(255,255,255,.16); border-radius: 50%; }
        .map-pin { position: absolute; display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border-radius: 999px; color: #06101a; font-size: 10px; font-weight: 900; background: var(--pin-color); box-shadow: 0 0 24px color-mix(in srgb, var(--pin-color) 30%, transparent); animation: pinPulse 2.8s ease-in-out infinite; }
        .pin-1 { left: 8%; top: 18%; } .pin-2 { right: 12%; top: 24%; animation-delay: -.7s; } .pin-3 { left: 36%; bottom: 18%; animation-delay: -1.2s; } .pin-4 { right: 22%; bottom: 35%; animation-delay: -1.8s; }
        .story-preview-card, .focus-preview-card, .mission-board-preview { min-height: 144px; padding: 18px; }
        .story-preview-card { display: grid; align-content: center; gap: 10px; }
        .story-preview-card svg { color: var(--pillar-color); }
        .story-preview-card p { margin: 0; color: var(--text); font-family: 'Lora', Georgia, serif; font-size: 18px; line-height: 1.4; }
        .story-preview-card span { color: var(--text-muted); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
        .focus-preview-card { display: flex; align-items: center; gap: 18px; }
        .focus-preview-card span { color: var(--pillar-color); font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: .14em; }
        .focus-preview-card p { margin: 5px 0 0; color: var(--text); font-size: 18px; line-height: 1.35; font-family: 'Lora', Georgia, serif; }
        .pillar-ring { position: relative; width: 70px; height: 70px; flex-shrink: 0; display: grid; place-items: center; }
        .pillar-ring svg { position: absolute; inset: 0; width: 70px; height: 70px; transform: rotate(-90deg); }
        .pillar-ring circle { fill: none; stroke: rgba(255,255,255,.12); stroke-width: 6; }
        .pillar-ring circle:nth-child(2) { stroke: var(--ring-color); stroke-linecap: round; transition: stroke-dashoffset .8s ease; filter: drop-shadow(0 0 8px var(--ring-color)); }
        .pillar-ring strong { position: relative; color: var(--text); font-size: 16px; }
        .mission-board-preview { display: grid; gap: 8px; }
        .mission-board-preview div { display: grid; grid-template-columns: 24px 1fr; gap: 9px; align-items: center; }
        .mission-board-preview span { width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; color: #06101a; background: var(--pillar-color); font-size: 11px; font-weight: 950; }
        .mission-board-preview p { margin: 0; color: var(--text); font-size: 13px; font-weight: 850; }
        .mission-board-preview i { grid-column: 2; height: 4px; border-radius: 999px; opacity: .72; box-shadow: 0 0 12px var(--pillar-color); }
        .floating-music-button { position: absolute; right: 22px; bottom: 22px; z-index: 2; background: linear-gradient(135deg, #34D399, #22D3EE); }
        @keyframes pillarParticles { from { transform: translate3d(0,0,0); } to { transform: translate3d(-54px,-54px,0); } }
        @keyframes ecosystemFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes tinyFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); opacity: .35; } 50% { transform: translate3d(8px,-14px,0) scale(1.5); opacity: .85; } }
        @keyframes iconPulse { 0%,100% { box-shadow: 0 0 28px color-mix(in srgb, var(--pillar-color) 28%, transparent); } 50% { box-shadow: 0 0 48px color-mix(in srgb, var(--pillar-color) 46%, transparent); } }
        @keyframes pinPulse { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.04); } }
        @media (max-width: 1100px) { .pillars-ecosystem-grid { grid-template-columns: 1fr; } .pillar-ecosystem-card { min-height: auto; } }
        @media (max-width: 680px) { .four-pillars-ecosystem { padding: 24px 16px; border-radius: 30px; } .pillar-ecosystem-card { padding: 20px; border-radius: 28px; } .pillar-stats-grid, .pillar-expanded-zone { grid-template-columns: 1fr; } .pillar-actions a { flex: 1; justify-content: center; } .floating-music-button { position: relative; right: auto; bottom: auto; margin-top: 14px; } }
      `}</style>
    </section>
  );
}