import React, { useMemo } from "react";
import { Flame } from "lucide-react";

/**
 * Computes a daily-usage streak from the user's FiveWs entries and shows a tiny pill.
 * Only renders when streak >= 1.
 */
export default function FiveWsStreak({ entries = [] }) {
  const streak = useMemo(() => {
    if (!entries.length) return 0;
    const dates = new Set(
      entries.map(e => new Date(e.created_date).toISOString().split("T")[0])
    );
    let n = 0;
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);
    while (true) {
      const key = cur.toISOString().split("T")[0];
      if (dates.has(key)) { n++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return n;
  }, [entries]);

  if (streak < 1) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 999,
      background: "rgba(200,147,47,0.10)",
      border: "1px solid rgba(200,147,47,0.28)",
    }}>
      <Flame style={{ width: 12, height: 12, color: "#C8932F" }} fill="#C8932F" />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#C8932F" }}>
        {streak} day{streak === 1 ? "" : "s"} in a row
      </span>
    </div>
  );
}