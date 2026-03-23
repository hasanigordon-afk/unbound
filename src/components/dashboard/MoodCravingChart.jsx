import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(11,18,32,0.95)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
    }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: <span style={{ color: "#fff" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function MoodCravingChart({ checkIns = [] }) {
  // Build last-30-days data, one point per day (most recent check-in per day)
  const data = React.useMemo(() => {
    const byDate = {};
    checkIns.forEach(c => {
      if (!byDate[c.check_in_date]) byDate[c.check_in_date] = c;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, c]) => ({
        date: format(parseISO(date), "MMM d"),
        Mood: c.mood_rating ?? null,
        Cravings: c.craving_intensity ?? null,
      }));
  }, [checkIns]);

  if (data.length === 0) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18, padding: "32px 20px", textAlign: "center",
      }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>📊</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
          Complete a few check-ins to see your trend here.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: "20px",
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
          Mood & Craving Trends
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Last {data.length} check-ins · Mood 1–5 · Cravings 0–10
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.4)", paddingTop: 8 }}
          />
          <Line
            type="monotone"
            dataKey="Mood"
            stroke="#3ECFBF"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3ECFBF", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Cravings"
            stroke="#F97316"
            strokeWidth={2}
            dot={{ r: 3, fill: "#F97316", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {(() => {
          const moods = data.map(d => d.Mood).filter(Boolean);
          const cravings = data.map(d => d.Cravings).filter(Boolean);
          const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : "—";
          const avgCraving = cravings.length ? (cravings.reduce((a, b) => a + b, 0) / cravings.length).toFixed(1) : "—";
          const moodTrend = moods.length >= 2 ? moods[moods.length - 1] - moods[0] : 0;
          const cravingTrend = cravings.length >= 2 ? cravings[cravings.length - 1] - cravings[0] : 0;
          return [
            {
              label: "Avg Mood",
              value: avgMood,
              unit: "/ 5",
              trend: moodTrend > 0 ? "↑ Improving" : moodTrend < 0 ? "↓ Declining" : null,
              trendColor: moodTrend > 0 ? "#10B981" : "#EF4444",
              color: "#3ECFBF",
            },
            {
              label: "Avg Cravings",
              value: avgCraving,
              unit: "/ 10",
              trend: cravingTrend < 0 ? "↓ Decreasing" : cravingTrend > 0 ? "↑ Increasing" : null,
              trendColor: cravingTrend < 0 ? "#10B981" : "#EF4444",
              color: "#F97316",
            },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, padding: "12px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                {stat.value}
                <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginLeft: 3 }}>{stat.unit}</span>
              </p>
              {stat.trend && (
                <p style={{ fontSize: 11, fontWeight: 700, color: stat.trendColor, marginTop: 4 }}>{stat.trend}</p>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}