import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle } from "lucide-react";
import { RECOVERY_CATEGORIES, CATEGORY_BY_VALUE } from "@/lib/recoveryCategories";

/**
 * Admin CRM view — distribution of users across the 14 recovery focus categories.
 * Surfaces crisis-category counts at the top so staff can prioritize routing.
 */
export default function RecoveryFocusTab() {
  const { data: focuses = [], isLoading } = useQuery({
    queryKey: ["all-recovery-focus"],
    queryFn: () => base44.entities.RecoveryFocus.list("-selected_at", 1000),
  });

  const stats = useMemo(() => {
    const counts = {};
    let crisisCount = 0;
    focuses.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
      if (f.is_crisis_category) crisisCount += 1;
    });
    const total = focuses.length;
    const rows = RECOVERY_CATEGORIES.map(c => ({
      ...c,
      count: counts[c.value] || 0,
      pct: total > 0 ? Math.round(((counts[c.value] || 0) / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
    return { rows, total, crisisCount };
  }, [focuses]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Loader2 style={{ width: 24, height: 24, color: "#B8823A" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top-line stats */}
      <div style={{
        background: "linear-gradient(135deg, rgba(184,130,58,0.08), rgba(122,158,126,0.05))",
        border: "1px solid #E8E2D9", borderRadius: 14, padding: "20px 20px",
        marginBottom: 16, textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
          Total Recovery Focus Selections
        </p>
        <p style={{ fontSize: 36, fontWeight: 800, color: "#B8823A", lineHeight: 1 }}>{stats.total}</p>
        <p style={{ fontSize: 12, color: "#9B8E83", marginTop: 4 }}>
          across {RECOVERY_CATEGORIES.length} categories
        </p>
      </div>

      {/* Crisis count */}
      {stats.crisisCount > 0 && (
        <div style={{
          background: "rgba(163,45,45,0.06)", border: "1px solid rgba(163,45,45,0.22)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <AlertCircle style={{ width: 18, height: 18, color: "#A32D2D", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#A32D2D" }}>
              {stats.crisisCount} user{stats.crisisCount !== 1 ? "s" : ""} flagged crisis support
            </p>
            <p style={{ fontSize: 11, color: "#4A3F35" }}>
              Self-harm or suicide-prevention focus — review for elevated routing
            </p>
          </div>
        </div>
      )}

      {/* Distribution */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Category Distribution
      </p>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "16px 18px" }}>
        {stats.rows.map((r, i) => (
          <div key={r.value} style={{ marginBottom: i < stats.rows.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
              <span style={{ fontSize: 13, color: "#1C1410", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{r.emoji}</span>
                {r.label}
                {r.isCrisis && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                    background: "rgba(163,45,45,0.10)", color: "#A32D2D",
                    textTransform: "uppercase", letterSpacing: ".05em",
                  }}>Crisis</span>
                )}
              </span>
              <span style={{ fontSize: 12, color: "#9B8E83", flexShrink: 0 }}>
                {r.count} ({r.pct}%)
              </span>
            </div>
            <div style={{ height: 6, background: "#F7F3EE", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${r.pct}%`, height: "100%",
                background: r.isCrisis ? "#A32D2D" : "#B8823A",
                borderRadius: 3, transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", lineHeight: 1.6, marginTop: 18 }}>
        Users select their primary focus during onboarding. Distribution updates in real time.
      </p>
    </>
  );
}