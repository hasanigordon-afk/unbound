import React from "react";

/**
 * Re-siliant brand logo.
 * (File kept as AhHaLogo for backwards-compat with existing imports —
 *  exports both AhHaLogo and ResiliantLogo names.)
 *
 * Props:
 *  - size: pixel size for the logo image (default 40)
 *  - showWordmark: render the "Re-siliant" text next to the mark (default true)
 *  - showTagline: render the "Rebuild · Recover · Rise" tagline (default false)
 *  - layout: "row" | "column" (default "row")
 */
const LOGO_URL = "https://media.base44.com/images/public/698cbbdc830161c35d66ad0e/f9caa64cc_generated_image.png";

export default function ResiliantLogo({
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
        alt="Re-siliant"
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
            color: "#0F1E3D",
            letterSpacing: "-.02em",
          }}>
            Re<span style={{ color: "#C8932F" }}>-</span>siliant
          </span>
          {showTagline && (
            <span style={{
              fontSize: 9, color: "#C8932F", fontWeight: 700,
              letterSpacing: ".10em", textTransform: "uppercase", marginTop: 3,
            }}>
              Rebuild · Recover · Rise
            </span>
          )}
        </div>
      )}
    </div>
  );
}