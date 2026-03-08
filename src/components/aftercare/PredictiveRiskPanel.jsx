import React, { useState } from "react";
import { TrendingDown, TrendingUp, Activity, ChevronDown, ChevronRight, AlertTriangle, Eye } from "lucide-react";
import { calcPredictiveRisk } from "./predictiveRisk";
import { engagementLevelColor } from "./engagementScore";

const LEVEL_CONFIG = {
  "Pre-Alert":      { color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", icon: AlertTriangle },
  "Emerging Risk":  { color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", icon: TrendingDown },
  "Watching":       { color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", icon: Eye },
};

const DIRECTION_ICON = {
  down:     <TrendingDown className="w-3 h-3" style={{ color: "#EF4444" }} />,
  up:       <TrendingUp   className="w-3 h-3" style={{ color: "#F59E0B" }} />,
  volatile: <Activity     className="w-3 h-3" style={{ color: "#8B5CF6" }} />,
};

function RiskBar({ score }) {
  const color = score >= 45 ? "#EF4444" : score >= 22 ? "#F59E0B" : "#3B82F6";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#F0F0F3" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

function ClientRiskCard({ metrics, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const { predictiveScore, predictiveLevel, signals } = calcPredictiveRisk(metrics.checkIns || []);

  // Only show clients with at least one signal
  if (signals.length === 0 && predictiveLevel === "Watching" && predictiveScore < 10) return null;

  const cfg = LEVEL_CONFIG[predictiveLevel] || LEVEL_CONFIG["Watching"];
  const LevelIcon = cfg.icon;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cfg.border}`, background: "#FFF" }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
            <LevelIcon className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#1E1E1E" }}>{metrics.email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                {predictiveLevel}
              </span>
              <span className="text-[11px]" style={{ color: "#8E8E93" }}>
                {signals.length} signal{signals.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="w-28 flex-shrink-0">
            <RiskBar score={predictiveScore} />
          </div>
        </div>
        <span className="ml-2 flex-shrink-0" style={{ color: "#8E8E93" }}>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid #F0F0F3" }}>
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>
              Detected Signals
            </p>
            {signals.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <div className="flex items-center gap-2">
                  {DIRECTION_ICON[s.direction]}
                  <span className="text-xs font-medium" style={{ color: "#374151" }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 rounded-full w-16" style={{ background: "#E5E7EB" }}>
                    <div className="h-1 rounded-full" style={{
                      width: `${s.weight}%`,
                      background: s.weight >= 60 ? "#EF4444" : s.weight >= 30 ? "#F59E0B" : "#3B82F6"
                    }} />
                  </div>
                  <span className="text-[11px] font-bold w-6 text-right" style={{ color: "#6B7280" }}>{Math.round(s.weight)}</span>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-sm font-bold" style={{ color: engagementLevelColor(metrics.engagementLevel) }}>
                  {metrics.engagementScore}
                </p>
                <p className="text-[10px]" style={{ color: "#8E8E93" }}>Eng. Score</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-sm font-bold" style={{ color: "#4A90E2" }}>{metrics.daysSinceCheckIn}d</p>
                <p className="text-[10px]" style={{ color: "#8E8E93" }}>Since Check-in</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{metrics.avgCraving ?? "—"}</p>
                <p className="text-[10px]" style={{ color: "#8E8E93" }}>Avg Craving</p>
              </div>
            </div>

            <button
              onClick={() => onSelect(metrics)}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              View Full Client Profile →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PredictiveRiskPanel({ clientMetrics, onSelectClient }) {
  // Exclude clients already in High Risk (they have live alerts)
  const candidates = clientMetrics
    .filter((m) => m.engagementLevel !== "High Risk")
    .map((m) => ({ ...m, _pred: calcPredictiveRisk(m.checkIns || []) }))
    .filter((m) => m._pred.predictiveLevel !== "Watching" || m._pred.predictiveScore >= 10)
    .sort((a, b) => b._pred.predictiveScore - a._pred.predictiveScore);

  const preAlertCount    = candidates.filter((m) => m._pred.predictiveLevel === "Pre-Alert").length;
  const emergingCount    = candidates.filter((m) => m._pred.predictiveLevel === "Emerging Risk").length;

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-xl text-center" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <p className="text-xl font-bold" style={{ color: "#EF4444" }}>{preAlertCount}</p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#EF4444" }}>Pre-Alert</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "#FFFBEB", border: "1px solid #FCD34D" }}>
          <p className="text-xl font-bold" style={{ color: "#F59E0B" }}>{emergingCount}</p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#F59E0B" }}>Emerging Risk</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <p className="text-xl font-bold" style={{ color: "#1E1E1E" }}>{clientMetrics.length}</p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#8E8E93" }}>Total Clients</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>
        Predictive Risk Analysis · 14-day rolling window
      </p>

      {candidates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#F0FDF4" }}>
            <Activity className="w-6 h-6" style={{ color: "#22C55E" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No emerging trends detected</p>
          <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>All clients show stable engagement patterns.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {candidates.map((m) => (
            <ClientRiskCard key={m.email} metrics={m} onSelect={onSelectClient} />
          ))}
        </div>
      )}

      <p className="text-[10px] text-center mt-6 px-4" style={{ color: "#C0C0C7" }}>
        Predictive scores are based on 14-day trend analysis across mood, cravings, check-in frequency,
        meeting attendance, and sponsor contact. This is not a clinical diagnosis.
      </p>
    </div>
  );
}