import React from "react";

/**
 * Shared Ah Ha logo component.
 * Use across landing, onboarding, hero headers, and footer for consistent branding.
 *
 * Props:
 *  - size: pixel size for the logo image (default 40)
 *  - showWordmark: render the "Ah Ha" text next to the mark (default true)
 *  - showTagline: render the "Help · Hope · Healing" tagline under wordmark (default false)
 *  - layout: "row" | "column" (default "row")
 *  - linkTo: optional path; if provided, wraps logo in <a>
 */
const LOGO_URL = "https://media.base44.com/images/public/698cbbdc830161c35d66ad0e/47ae40bbf_ChatGPTImageApr25202604_54_43PM.png";

export default function AhHaLogo({
  size = 40,
  showWordmark = true,
  showTagline = false,
  layout = "row",
  className,
  style,
}) {
  const isColumn = layout === "column";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: isColumn ? "column" : "row",
        alignItems: "center",
        gap: isColumn ? 8 : 10,
        ...style,
      }}
    >
      <img
        src={LOGO_URL}
        alt="Ah Ha"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
          display: "block",
        }}
      />
      {showWordmark && (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: isColumn ? "center" : "flex-start",
          lineHeight: 1,
        }}>
          <span style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: Math.max(16, Math.round(size * 0.46)),
            fontWeight: 700,
            color: "#1C1410",
            letterSpacing: "-.02em",
          }}>
            Ah Ha
          </span>
          {showTagline && (
            <span style={{
              fontSize: 9, color: "#9B8E83", fontWeight: 600,
              letterSpacing: ".08em", textTransform: "uppercase", marginTop: 3,
            }}>
              Help · Hope · Healing
            </span>
          )}
        </div>
      )}
    </div>
  );
}