import React, { useState } from "react";
import { ThumbsUp, CheckCircle, ChevronDown, ChevronUp, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PROGRAM_LABELS = {
  detox: "Detox", inpatient: "Inpatient", residential: "Residential",
  outpatient: "Outpatient", iop: "IOP", php: "PHP", mat: "MAT", other: "Program",
};

const STAY_LABELS = {
  less_than_1_week: "< 1 week", "1_2_weeks": "1–2 weeks", "30_days": "30 days",
  "60_days": "60 days", "90_days": "90 days", "6_months_plus": "6+ months",
};

function ScoreDot({ score }) {
  const color = score >= 8 ? "#10B981" : score >= 5 ? "#F59E0B" : "#EF4444";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: "50%",
      background: color + "20", color, fontSize: 12, fontWeight: 800,
    }}>
      {score}
    </span>
  );
}

function ScoreBar({ label, score }) {
  const color = score >= 8 ? "#10B981" : score >= 5 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: "#5A5A5A", minWidth: 90 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: "#F0F0F3", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 10}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 18, textAlign: "right" }}>{score}</span>
    </div>
  );
}

export default function FacilityReviewCard({ review, onHelpful }) {
  const [expanded, setExpanded] = useState(false);
  const [markedHelpful, setMarkedHelpful] = useState(false);

  const overallColor = review.overall_score >= 8 ? "#10B981" : review.overall_score >= 5 ? "#F59E0B" : "#EF4444";
  const hasScores = review.score_staff || review.score_program || review.score_environment || review.score_aftercare;

  const handleHelpful = () => {
    if (markedHelpful) return;
    setMarkedHelpful(true);
    base44.entities.FacilityReview.update(review.id, { helpful_count: (review.helpful_count || 0) + 1 }).catch(() => {});
    onHelpful && onHelpful(review);
  };

  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16,
      overflow: "hidden", marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1E1E1E", lineHeight: 1.2 }}>
              {review.facility_name}
            </p>
            {(review.facility_city || review.facility_state) && (
              <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
                {[review.facility_city, review.facility_state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {/* Overall score circle */}
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: overallColor + "15", border: `2px solid ${overallColor}40`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: overallColor, lineHeight: 1 }}>
              {review.overall_score}
            </span>
            <span style={{ fontSize: 8, color: overallColor, fontWeight: 700, opacity: 0.7 }}>/10</span>
          </div>
        </div>

        {/* Tags row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {review.program_type && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: "#EBF3FD", color: "#4A90E2",
            }}>
              {PROGRAM_LABELS[review.program_type] || review.program_type}
            </span>
          )}
          {review.length_of_stay && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F3F4F6", color: "#6B7280" }}>
              {STAY_LABELS[review.length_of_stay] || review.length_of_stay}
            </span>
          )}
          {review.year_attended && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F3F4F6", color: "#6B7280" }}>
              {review.year_attended}
            </span>
          )}
          {review.verified_attendee && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", gap: 3 }}>
              <CheckCircle style={{ width: 9, height: 9 }} /> Verified
            </span>
          )}
          {review.would_recommend && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#FFF7ED", color: "#F97316" }}>
              👍 Would Recommend
            </span>
          )}
        </div>
      </div>

      {/* Headline + review */}
      <div style={{ padding: "12px 16px" }}>
        {review.headline && (
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", marginBottom: 6 }}>
            "{review.headline}"
          </p>
        )}

        {/* Pros */}
        {review.pros?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>✅ What they did well</p>
            {review.pros.map((pro, i) => (
              <p key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "#10B981" }}>•</span> {pro}
              </p>
            ))}
          </div>
        )}

        {/* Cons */}
        {review.cons?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>🔧 Could be improved</p>
            {review.cons.map((con, i) => (
              <p key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "#F59E0B" }}>•</span> {con}
              </p>
            ))}
          </div>
        )}

        {/* Full review (expandable) */}
        {review.full_review && (
          <div>
            <p style={{
              fontSize: 12, color: "#5A5A5A", lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 3,
              WebkitBoxOrient: "vertical",
            }}>
              {review.full_review}
            </p>
            {review.full_review.length > 180 && (
              <button
                onClick={() => setExpanded(e => !e)}
                style={{ fontSize: 11, fontWeight: 600, color: "#4A90E2", background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 3 }}
              >
                {expanded ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show less</> : <><ChevronDown style={{ width: 12, height: 12 }} /> Read more</>}
              </button>
            )}
          </div>
        )}

        {/* Breakdown scores (expandable) */}
        {hasScores && expanded && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F3F4F6" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Score Breakdown</p>
            {review.score_staff      && <ScoreBar label="Staff & Care"      score={review.score_staff} />}
            {review.score_program    && <ScoreBar label="Program Quality"   score={review.score_program} />}
            {review.score_environment && <ScoreBar label="Environment"       score={review.score_environment} />}
            {review.score_aftercare  && <ScoreBar label="Aftercare Support" score={review.score_aftercare} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 16px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid #F3F4F6",
      }}>
        <p style={{ fontSize: 11, color: "#8E8E93" }}>
          {review.is_anonymous ? "Anonymous survivor" : (review.reviewer_name || "Community member")}
          {review.created_date && ` · ${new Date(review.created_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
        </p>
        <button
          onClick={handleHelpful}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 20,
            background: markedHelpful ? "#EBF3FD" : "#F9FAFB",
            border: `1px solid ${markedHelpful ? "#4A90E2" : "#E5E7EB"}`,
            color: markedHelpful ? "#4A90E2" : "#6B7280",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}
        >
          <ThumbsUp style={{ width: 11, height: 11 }} />
          {markedHelpful ? "Helpful!" : "Helpful"} {(review.helpful_count || 0) > 0 && `(${review.helpful_count})`}
        </button>
      </div>
    </div>
  );
}