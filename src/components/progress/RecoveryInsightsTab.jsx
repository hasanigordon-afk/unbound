import React from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Area, AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

function InsightCard({ title, emoji, children, accent }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function TrendBadge({ current, previous, higherIsBetter = true, unit = "" }) {
  if (current == null || previous == null) return null;
  const diff = parseFloat((current - previous).toFixed(1));
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const neutral = Math.abs(diff) < 0.1;

  if (neutral) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#F1F5F9", color: "#64748B", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
      <Minus style={{ width: 10, height: 10 }} /> Steady
    </span>
  );

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: improved ? "#F0FDF4" : "#FEF2F2",
      color: improved ? "#16A34A" : "#DC2626",
      borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700,
    }}>
      {improved
        ? <TrendingUp style={{ width: 10, height: 10 }} />
        : <TrendingDown style={{ width: 10, height: 10 }} />}
      {diff > 0 ? "+" : ""}{diff}{unit} vs last 15d
    </span>
  );
}

const MOOD_LABELS = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😊" };

function MoodTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 700, color: "#1E1E1E", marginBottom: 4 }}>{label}</p>
      {d.mood != null && <p style={{ color: "#8B5CF6" }}>Mood: {MOOD_LABELS[d.mood] || ""} {d.mood}/5</p>}
      {d.craving != null && <p style={{ color: "#EF4444" }}>Craving: {d.craving}/10</p>}
      {d.stress != null && <p style={{ color: "#F59E0B" }}>Stress: {d.stress}/10</p>}
    </div>
  );
}

export default function RecoveryInsightsTab({ checkIns }) {
  // Build last 30 days data points (one per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const key = format(d, "yyyy-MM-dd");
    const label = format(d, "MMM d");
    const shortLabel = i % 5 === 0 ? format(d, "MMM d") : "";
    const match = checkIns.find(c => c.check_in_date === key);
    return {
      date: key,
      label,
      shortLabel,
      mood: match?.mood_rating ?? null,
      craving: match?.craving_intensity ?? null,
      stress: match?.stress_level ?? null,
      meeting: match?.attended_meeting ? 1 : 0,
      sponsor: match?.connected_with_sponsor ? 1 : 0,
      hasEntry: !!match,
    };
  });

  // Weekly meeting attendance (last 4 weeks)
  const weeklyBars = [0, 1, 2, 3].map(wk => {
    const start = 29 - wk * 7;
    const slice = days30.slice(Math.max(0, start - 6), start + 1);
    const meetings = slice.filter(d => d.meeting === 1).length;
    const days = slice.filter(d => d.hasEntry).length;
    const wkStart = format(subDays(today, start), "MMM d");
    return { week: wkStart, meetings, days };
  }).reverse();

  // Averages for trend badges
  const first15 = days30.slice(0, 15);
  const last15  = days30.slice(15);
  const avg = (arr, key) => {
    const vals = arr.filter(d => d[key] != null).map(d => d[key]);
    return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
  };

  const moodFirst = avg(first15, "mood");
  const moodLast  = avg(last15, "mood");
  const cravFirst = avg(first15, "craving");
  const cravLast  = avg(last15, "craving");

  const totalMeetings30 = days30.filter(d => d.meeting === 1).length;
  const totalCheckIns30 = days30.filter(d => d.hasEntry).length;

  // Check if we have any data
  const hasMoodData    = days30.some(d => d.mood != null);
  const hasCravingData = days30.some(d => d.craving != null);

  const EmptyState = ({ label }) => (
    <div style={{ textAlign: "center", padding: "28px 0", color: "#94A3B8" }}>
      <p style={{ fontSize: 13 }}>No {label} data yet — keep checking in daily.</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* Summary chips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { emoji: "📋", val: totalCheckIns30, label: "check-ins", color: "#4A90E2" },
          { emoji: "🤝", val: totalMeetings30, label: "meetings",  color: "#16A34A" },
          { emoji: "😊", val: moodLast != null ? `${moodLast}/5` : "—", label: "avg mood", color: "#8B5CF6" },
        ].map(item => (
          <div key={item.label} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 18, marginBottom: 4 }}>{item.emoji}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.val}</p>
            <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      <InsightCard title="Mood Trend" emoji="😊">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "#64748B" }}>How you've been feeling, day by day</p>
          <TrendBadge current={moodLast} previous={moodFirst} higherIsBetter={true} />
        </div>
        {!hasMoodData ? <EmptyState label="mood" /> : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={days30} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<MoodTooltip />} />
                <ReferenceLine y={3} stroke="#E2E8F0" strokeDasharray="4 4" />
                <Area
                  type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2}
                  fill="url(#moodGrad)" dot={(props) => {
                    if (props.payload.mood == null) return null;
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill="#8B5CF6" stroke="#FFF" strokeWidth={1.5} />;
                  }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#CBD5E1" }}>
              <span>1 = very low</span><span>5 = very positive</span>
            </div>
          </>
        )}
      </InsightCard>

      {/* Craving + stress chart */}
      <InsightCard title="Craving & Stress" emoji="🔥">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "#64748B" }}>Lower is better — track your triggers</p>
          <TrendBadge current={cravLast} previous={cravFirst} higherIsBetter={false} />
        </div>
        {!hasCravingData ? <EmptyState label="craving" /> : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={days30} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<MoodTooltip />} />
                <ReferenceLine y={7} stroke="#FCA5A5" strokeDasharray="4 4" label={{ value: "high", position: "right", fontSize: 9, fill: "#FCA5A5" }} />
                <Line
                  type="monotone" dataKey="craving" stroke="#EF4444" strokeWidth={2}
                  dot={(props) => {
                    if (props.payload.craving == null) return null;
                    const fill = props.payload.craving >= 8 ? "#DC2626" : "#EF4444";
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={props.payload.craving >= 8 ? 5 : 3} fill={fill} stroke="#FFF" strokeWidth={1.5} />;
                  }}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3"
                  dot={(props) => {
                    if (props.payload.stress == null) return null;
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill="#F59E0B" stroke="#FFF" strokeWidth={1.5} />;
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "#64748B" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 14, height: 3, background: "#EF4444", display: "inline-block", borderRadius: 2 }} /> Craving
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 14, height: 3, background: "#F59E0B", display: "inline-block", borderRadius: 2, opacity: 0.7 }} /> Stress
              </span>
              <span style={{ fontSize: 10, color: "#FCA5A5", marginLeft: "auto" }}>— dashed = high-risk zone</span>
            </div>
          </>
        )}
      </InsightCard>

      {/* Meeting attendance chart */}
      <InsightCard title="Meeting Attendance" emoji="🤝">
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Weekly meetings attended (last 4 weeks)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyBars} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val, name) => [`${val} meeting${val !== 1 ? "s" : ""}`, "Attended"]}
              labelFormatter={(label) => `Week of ${label}`}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0" }}
            />
            <Bar dataKey="meetings" fill="#4A90E2" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>
          {totalMeetings30} meetings in the last 30 days
        </p>
      </InsightCard>

      {/* Sponsor contact chart */}
      <InsightCard title="Support Connections" emoji="💬">
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Days you reached out to a sponsor or support person</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
          {days30.map(d => (
            <div
              key={d.date}
              title={d.label}
              style={{
                aspectRatio: "1",
                borderRadius: 5,
                background: !d.hasEntry ? "#F1F5F9" : d.sponsor ? "#22C55E" : "#FEE2E2",
                border: `1px solid ${!d.hasEntry ? "#E2E8F0" : d.sponsor ? "#86EFAC" : "#FECACA"}`,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11, color: "#64748B" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, background: "#22C55E", borderRadius: 3, display: "inline-block" }} /> Connected
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, background: "#FEE2E2", borderRadius: 3, display: "inline-block" }} /> Not today
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, background: "#F1F5F9", borderRadius: 3, display: "inline-block" }} /> No check-in
          </span>
        </div>
      </InsightCard>

    </div>
  );
}