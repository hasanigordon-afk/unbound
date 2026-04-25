import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CATEGORY_BY_VALUE } from "@/lib/recoveryCategories";

/**
 * Small pill on the Home hero showing the user's primary recovery focus.
 * Tapping it routes to Profile where the focus can be reviewed.
 * Hidden if the user has no primary focus saved.
 */
export default function MyFocusPill({ userEmail }) {
  const { data: focuses = [] } = useQuery({
    queryKey: ["my-recovery-focus", userEmail],
    queryFn: () => base44.entities.RecoveryFocus.filter({ user_email: userEmail, is_primary: true }, "-selected_at", 1),
    enabled: !!userEmail,
    staleTime: 5 * 60_000,
  });

  const primary = focuses[0];
  if (!primary) return null;

  const meta = CATEGORY_BY_VALUE[primary.category];
  if (!meta) return null;

  const isCrisis = !!primary.is_crisis_category;

  return (
    <Link to="/Profile" style={{ textDecoration: "none", display: "inline-block", marginBottom: 22 }}>
      <div className="fu lift" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 12px 6px 8px", borderRadius: 20,
        background: isCrisis ? "rgba(163,45,45,0.06)" : "rgba(184,130,58,0.08)",
        border: `1px solid ${isCrisis ? "rgba(163,45,45,0.22)" : "rgba(184,130,58,0.25)"}`,
        animationDelay: ".12s",
      }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{meta.emoji}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".02em",
          color: isCrisis ? "#A32D2D" : "#B8823A",
        }}>
          Focus · {meta.label}
        </span>
      </div>
    </Link>
  );
}