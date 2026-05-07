import React from "react";

export default function SectionHeading({ children, accent = "var(--text-dim)" }) {
  return (
    <p style={{
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      fontSize: 10.5, fontWeight: 700,
      color: accent,
      letterSpacing: ".22em", textTransform: "uppercase",
      margin: "26px 4px 12px",
    }}>{children}</p>
  );
}