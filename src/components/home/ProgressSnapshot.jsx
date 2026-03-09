import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../pages/utils";

const FOCUS_LABELS = {
  leaving_rehab:     "Leaving treatment",
  staying_sober:     "Staying sober",
  basic_needs:       "Basic needs",
  coming_home:       "Coming home",
  getting_back:      "Getting back on track",
  support_resources: "Finding support",
};

export default function ProgressSnapshot({ streak, checkinRate, profile }) {
  const focus = profile?.goals?.[0];
  const focusLabel = focus ? FOCUS_LABELS[focus] : null;
  const streakColor = streak >= 3 ? "#4A90E2" : streak > 0 ? "#8E8E93" : "#D1D1D6";
  const rateColor   = checkinRate >= 70 ? "#22C55E" : checkinRate >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
        Your progress
      </p>

      <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 18, padding: "20px", display: "flex", marginBottom: 10 }}>
        <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #E5E7EB", paddingRight: 16 }}>
          <p style={{ fontSize: 34, fontWeight: 800, color: streakColor, lineHeight: 1 }}>{streak}</p>
          <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 5 }}>
            {streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>
        <div style={{ flex: 1, textAlign: "center", paddingLeft: 16 }}>
          <p style={{ fontSize: 34, fontWeight: 800, color: rateColor, lineHeight: 1 }}>{checkinRate}%</p>
          <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 5 }}>Check-ins this week</p>
        </div>
      </div>

      {focusLabel && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Current focus</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1E1E1E" }}>{focusLabel}</p>
          </div>
          <Link to={createPageUrl("ForwardPlan")} style={{ textDecoration: "none" }}>
            <p style={{ fontSize: 13, color: "#4A90E2", fontWeight: 600 }}>See plan →</p>
          </Link>
        </div>
      )}
    </div>
  );
}