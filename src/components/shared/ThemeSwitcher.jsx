import React, { useState } from "react";
import { Palette, Check, X } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { THEME_LIST } from "@/lib/themes";

/**
 * Floating theme switcher — bottom-right FAB that opens a glassy sheet
 * with all 6 themes. Persists via ThemeContext (localStorage).
 */
export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Change theme"
        style={{
          position: "fixed", right: 16, bottom: 96, zIndex: 60,
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--card)",
          border: "1px solid var(--border-glow)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "var(--glow)",
          color: "var(--text)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .15s ease",
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(.94)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        onBlur={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <Palette style={{ width: 18, height: 18, color: "var(--accent)" }} strokeWidth={2} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            animation: "ts-fade .25s ease",
          }}
        >
          <style>{`
            @keyframes ts-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes ts-rise { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto",
              background: "var(--card)",
              border: "1px solid var(--border-glow)",
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
              padding: "20px 18px 28px",
              boxShadow: "var(--shadow)",
              animation: "ts-rise .3s cubic-bezier(.22,1,.36,1)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 800, color: "var(--accent)",
                  textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 4 }}>
                  Visual Theme
                </p>
                <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 20, fontWeight: 700,
                  color: "var(--text)", lineHeight: 1.25 }}>
                  Choose your atmosphere
                </h3>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "transparent", border: "none", cursor: "pointer", padding: 4,
              }}>
                <X style={{ width: 20, height: 20, color: "var(--text-muted)" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {THEME_LIST.map((t) => {
                const active = t.key === themeKey;
                return (
                  <button key={t.key}
                    onClick={() => { setThemeKey(t.key); setTimeout(() => setOpen(false), 250); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 14px", borderRadius: 14,
                      background: active ? "var(--card-hover)" : "var(--surface)",
                      border: `1px solid ${active ? "var(--border-glow)" : "var(--border)"}`,
                      cursor: "pointer", textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all .15s ease",
                      boxShadow: active ? "var(--glow)" : "none",
                    }}>
                    {/* Swatch */}
                    <div style={{ display: "flex", flexShrink: 0,
                      borderRadius: 10, overflow: "hidden",
                      border: "1px solid var(--border)",
                      width: 56, height: 40,
                    }}>
                      {t.swatch.map((c, i) => (
                        <div key={i} style={{ flex: 1, background: c }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)",
                        marginBottom: 2 }}>{t.label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.description}</p>
                    </div>
                    {active && (
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, boxShadow: "var(--glow)",
                      }}>
                        <Check style={{ width: 14, height: 14, color: "#fff" }} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center",
              marginTop: 16, lineHeight: 1.6 }}>
              Your theme is saved on this device.
            </p>
          </div>
        </div>
      )}
    </>
  );
}