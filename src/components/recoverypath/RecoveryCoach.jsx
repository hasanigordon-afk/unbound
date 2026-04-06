import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, Sun, CalendarDays, Heart, RefreshCw,
  Loader2, ChevronDown, ChevronUp, Info
} from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  indigo:  "#6366F1",
  emerald: "#10B981",
  purple:  "#A78BFA",
  rose:    "#F472B6",
};

const CACHE_KEY = "recovery_coach_cache";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_KEY); return null; }
    return parsed.data;
  } catch { return null; }
}

function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function Section({ icon: Icon, color, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 12,
      background: `${color}08`, border: `1px solid ${color}22` }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "14px 16px", background: "none", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ color, width: 16, height: 16 }} />
        </div>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 800, color: "#fff", textAlign: "left" }}>{title}</p>
        {open
          ? <ChevronUp style={{ color: "rgba(255,255,255,0.3)", width: 16, height: 16 }} />
          : <ChevronDown style={{ color: "rgba(255,255,255,0.3)", width: 16, height: 16 }} />}
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}

function BulletList({ items, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color,
            flexShrink: 0, marginTop: 6 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function RecoveryCoach({ user }) {
  const [coaching, setCoaching] = useState(() => getCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoaching = async (force = false) => {
    if (!force) {
      const cached = getCache();
      if (cached) { setCoaching(cached); return; }
    }
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('recoveryCoach', {});
    const data = res.data;
    setCoaching(data);
    setCache(data);
    setLoading(false);
  };

  // Auto-fetch on first mount if no cache
  React.useEffect(() => {
    if (!coaching && user?.email) fetchCoaching();
  }, [user?.email]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      {/* Header card */}
      <div style={{ borderRadius: 20, padding: "22px 20px", marginBottom: 16, position: "relative",
        overflow: "hidden", background: "linear-gradient(135deg,#0E1528,#111A2E)",
        border: "1px solid rgba(167,139,250,0.2)" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Sparkles style={{ color: C.purple, width: 16, height: 16 }} />
            <p style={{ fontSize: 11, fontWeight: 800, color: C.purple, textTransform: "uppercase", letterSpacing: ".08em" }}>
              AI Recovery Coach
            </p>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Your Personalized Coaching</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>{today}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
            borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Info style={{ color: "rgba(255,255,255,0.25)", width: 13, height: 13, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
              Coaching is generated from your real reflection entries, task completions, and recovery check-ins. Updated every 6 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Data summary pills */}
      {coaching?.data_summary && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: `${coaching.data_summary.doneCount} tasks done`, color: C.emerald },
            { label: `${coaching.data_summary.skippedCount} skipped`, color: C.gold },
            { label: `${coaching.streak || 0}d streak`, color: C.teal },
            { label: `${coaching.data_summary.reflectionCount} reflections`, color: C.indigo },
          ].map(pill => (
            <div key={pill.label} style={{ padding: "4px 10px", borderRadius: 20,
              background: `${pill.color}12`, border: `1px solid ${pill.color}30` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: pill.color }}>{pill.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ borderRadius: 20, padding: "48px 24px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Loader2 style={{ color: C.purple, width: 28, height: 28, margin: "0 auto 16px" }} className="animate-spin" />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            Analyzing your path…
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Reading your reflections, completion patterns, and check-ins to craft something personal for you.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ borderRadius: 16, padding: "20px", textAlign: "center",
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(239,68,68,0.8)", marginBottom: 10 }}>
            Couldn't load coaching right now. Your path is still here.
          </p>
          <button onClick={() => fetchCoaching(true)}
            style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)",
              background: "transparent", color: "#EF4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      )}

      {/* Coaching content */}
      {coaching && !loading && (
        <>
          {/* Morning encouragement */}
          <Section icon={Sun} color={C.gold} title="Good Morning" defaultOpen={true}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75,
              fontStyle: "italic", borderLeft: `3px solid ${C.gold}40`, paddingLeft: 14 }}>
              "{coaching.morning_encouragement}"
            </p>
          </Section>

          {/* Weekly plan suggestions */}
          {coaching.weekly_suggestions?.length > 0 && (
            <Section icon={CalendarDays} color={C.teal} title="This Week's Adjustments" defaultOpen={true}>
              <BulletList items={coaching.weekly_suggestions} color={C.teal} />
            </Section>
          )}

          {/* Coping strategies */}
          {coaching.coping_strategies?.length > 0 && (
            <Section icon={Heart} color={C.rose} title="Coping Strategies For You" defaultOpen={true}>
              <BulletList items={coaching.coping_strategies} color={C.rose} />
            </Section>
          )}

          {/* Refresh */}
          <button onClick={() => fetchCoaching(true)} disabled={loading}
            style={{ width: "100%", marginTop: 4, padding: "12px", borderRadius: 14,
              border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.06)",
              color: C.purple, fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh Coaching
          </button>
          {coaching.generated_at && (
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
              Generated {coaching.generated_at} · Updates every 6 hours
            </p>
          )}
        </>
      )}

      {/* No data nudge */}
      {!coaching && !loading && !error && (
        <div style={{ borderRadius: 20, padding: "40px 24px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🌱</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            Build your path first
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Complete a few tasks, log a reflection, or do a daily check-in — then your coach will have something real to work with.
          </p>
        </div>
      )}
    </div>
  );
}