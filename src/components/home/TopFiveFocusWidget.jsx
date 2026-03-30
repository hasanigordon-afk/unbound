import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Flame, Check, ArrowRight, Loader2 } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/pages/TopFiveFocus";

const C = {
  teal:   "#2DD4BF",
  emerald:"#10B981",
  muted:  "rgba(241,245,249,0.38)",
};

function toDateStr(d) { return d.toISOString().split("T")[0]; }

export default function TopFiveFocusWidget({ user }) {
  const queryClient = useQueryClient();
  const today = toDateStr(new Date());

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["focus-logs-today", user?.email, today],
    queryFn: () => base44.entities.DailyFocusLog.filter({ user_email: user.email, log_date: today }),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const { data: streak } = useQuery({
    queryKey: ["focus-streak", user?.email],
    queryFn: () => base44.entities.FocusStreak.filter({ user_email: user.email }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  const completedKeys = useMemo(() =>
    new Set(todayLogs.filter(l => l.completed).map(l => l.category_key)),
    [todayLogs]
  );

  const completedCount = completedKeys.size;

  const toggleMutation = useMutation({
    mutationFn: async (cat) => {
      const existing = todayLogs.find(l => l.category_key === cat.key);
      const nowCompleted = !existing?.completed;
      if (existing) {
        await base44.entities.DailyFocusLog.update(existing.id, {
          completed: nowCompleted,
          completed_at: nowCompleted ? new Date().toISOString() : null,
        });
      } else {
        await base44.entities.DailyFocusLog.create({
          user_email: user.email, log_date: today,
          category_key: cat.key, category_name: cat.name,
          completed: true, completed_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["focus-logs-today"] }),
  });

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, padding: "18px 18px 14px", marginBottom: 20 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Stay Focused Today</p>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Small wins. Every day.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {streak?.current_streak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
              borderRadius: 20, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)" }}>
              <Flame style={{ color: C.teal, width: 13, height: 13 }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: C.teal }}>{streak.current_streak}</p>
            </div>
          )}
          <Link to={createPageUrl("TopFiveocus")} style={{ display: "flex", alignItems: "center", gap: 4,
            color: C.muted, textDecoration: "none", fontSize: 11, fontWeight: 600 }}>
            View <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, marginBottom: 14, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          width: `${(completedCount / 5) * 100}%`,
          background: completedCount >= 5
            ? `linear-gradient(90deg,${C.emerald},#0DA372)`
            : `linear-gradient(90deg,${C.teal},#22C5B0)`,
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* 5 category buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {DEFAULT_CATEGORIES.map(cat => {
          const done = completedKeys.has(cat.key);
          const loading = toggleMutation.isPending && toggleMutation.variables?.key === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => toggleMutation.mutate(cat)}
              disabled={loading}
              title={cat.name}
              style={{
                flex: 1, aspectRatio: "1", borderRadius: 14,
                border: `1.5px solid ${done ? `${cat.color}50` : "rgba(255,255,255,0.08)"}`,
                background: done ? `${cat.color}14` : "rgba(255,255,255,0.03)",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
                transition: "all 0.2s ease",
                boxShadow: done ? `0 0 12px ${cat.color}20` : "none",
                padding: "8px 4px",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
              {loading
                ? <Loader2 style={{ width: 10, height: 10, color: cat.color }} className="animate-spin" />
                : done
                  ? <Check style={{ width: 10, height: 10, color: cat.color, strokeWidth: 3 }} />
                  : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              }
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 10, fontWeight: 600 }}>
        {completedCount >= 5
          ? "🎉 All 5 complete today!"
          : `${completedCount} of 5 completed`}
      </p>
    </div>
  );
}