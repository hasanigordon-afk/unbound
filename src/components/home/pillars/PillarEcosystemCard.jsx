import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Compass,
  Flame,
  HeartHandshake,
  Home,
  MapPinned,
  Music2,
  Phone,
  Route,
  Sparkles,
  Star,
  TrendingUp,
  Utensils,
} from "lucide-react";

const TOOL_ICONS = {
  housing: Home,
  food: Utensils,
  jobs: Briefcase,
  map: MapPinned,
  support: HeartHandshake,
  emergency: Phone,
  calm: Music2,
  progress: TrendingUp,
  journey: Route,
  spark: Sparkles,
};

function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function ProgressRing({ value, color }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="pillar-ring" style={{ "--ring-color": color }}>
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r={radius} />
        <circle cx="30" cy="30" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function ResourceMapPreview({ accent }) {
  return (
    <div className="mini-map-preview">
      {["Housing", "Food", "Jobs", "VA"].map((label, index) => (
        <span key={label} className={`map-pin pin-${index + 1}`} style={{ "--pin-color": accent }}>
          <MapPinned size={12} /> {label}
        </span>
      ))}
    </div>
  );
}

function MissionBoardPreview({ accent }) {
  return (
    <div className="mission-board-preview">
      {["Family", "Career", "Health", "Stability", "Purpose"].map((item, index) => (
        <div key={item}>
          <span>{index + 1}</span>
          <p>{item}</p>
          <i style={{ width: `${88 - index * 9}%`, background: accent }} />
        </div>
      ))}
    </div>
  );
}

function StoryPreview() {
  return (
    <div className="story-preview-card">
      <Star size={16} />
      <p>“When I finally got tired of surviving and decided to rebuild...”</p>
      <span>Featured Ah-Ha Moment</span>
    </div>
  );
}

function FocusPreview({ accent }) {
  return (
    <div className="focus-preview-card">
      <ProgressRing value={72} color={accent} />
      <div>
        <span>Today’s focus</span>
        <p>“Breathe. Stay present. Keep building.”</p>
      </div>
    </div>
  );
}

export default function PillarEcosystemCard({ pillar, index }) {
  const [expanded, setExpanded] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const Icon = pillar.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingIndex((current) => (current + 1) % pillar.rotating.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [pillar.rotating.length]);

  const Preview = useMemo(() => {
    if (pillar.previewType === "map") return <ResourceMapPreview accent={pillar.color} />;
    if (pillar.previewType === "story") return <StoryPreview />;
    if (pillar.previewType === "focus") return <FocusPreview accent={pillar.color} />;
    return <MissionBoardPreview accent={pillar.color} />;
  }, [pillar.previewType, pillar.color]);

  return (
    <article
      className={`pillar-ecosystem-card ${expanded ? "is-expanded" : ""}`}
      style={{ "--pillar-color": pillar.color, animationDelay: `${index * 120}ms` }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded((value) => !value)}
    >
      <div className="pillar-particles" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <div className="pillar-topline">
        <div className="pillar-mega-icon">
          <Icon size={34} />
        </div>
        <div className="pillar-status">
          <CircleDot size={12} /> Live ecosystem
        </div>
      </div>

      <div className="pillar-copy">
        <span>{pillar.title}</span>
        <h3>{pillar.headline}</h3>
        <p>{pillar.description}</p>
      </div>

      <div className="pillar-rotator">
        <Sparkles size={14} />
        <span>{pillar.rotating[rotatingIndex]}</span>
      </div>

      <div className="pillar-stats-grid">
        {pillar.stats.map((stat) => (
          <div key={stat.label}>
            <strong><AnimatedCounter value={stat.value} suffix={stat.suffix} /></strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="pillar-actions" onClick={(event) => event.stopPropagation()}>
        {pillar.actions.map((action) => {
          const ActionIcon = action.icon || ArrowUpRight;
          return (
            <Link key={action.label} to={action.to}>
              <ActionIcon size={14} /> {action.label}
            </Link>
          );
        })}
      </div>

      <div className="pillar-expanded-zone">
        <div className="pillar-tool-list">
          {pillar.tools.map((tool) => {
            const ToolIcon = TOOL_ICONS[tool.icon] || CheckCircle2;
            return (
              <span key={tool.label}>
                <ToolIcon size={13} /> {tool.label}
              </span>
            );
          })}
        </div>

        <div className="pillar-next-steps">
          <span>Suggested next steps</span>
          {pillar.nextSteps.map((step) => (
            <p key={step}><CheckCircle2 size={13} /> {step}</p>
          ))}
        </div>
      </div>

      <div className="pillar-preview-shell">
        {Preview}
      </div>

      {pillar.music && (
        <Link className="floating-music-button" to="/HealingHub" onClick={(event) => event.stopPropagation()}>
          <Music2 size={16} /> Calm music
        </Link>
      )}
    </article>
  );
}