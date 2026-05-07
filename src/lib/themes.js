// Re-siliant Theme Engine — 6 cinematic themes
// Each theme exports a flat map of CSS variables that gets applied to <html>.
// All existing pages use var(--bg), var(--card), var(--text), --navy, --gold, etc.,
// so swapping themes re-skins the entire app without touching page code.

export const THEMES = {
  // ── Default: Midnight Elite (the new futuristic baseline) ─────────────
  midnight_elite: {
    key: "midnight_elite",
    label: "Midnight Elite",
    description: "Premium midnight + electric blue. The new default.",
    swatch: ["#0A0E1A", "#1E2746", "#5B8DEF"],
    mode: "dark",
    vars: {
      // Surfaces
      "--bg":          "#070A14",
      "--bg-2":        "#0D1220",
      "--surface":     "rgba(20, 26, 45, 0.55)",
      "--card":        "rgba(20, 26, 45, 0.55)",
      "--card-hover":  "rgba(28, 36, 60, 0.70)",
      "--card-solid":  "#121829",
      "--border":      "rgba(120, 150, 220, 0.14)",
      "--border-soft": "rgba(120, 150, 220, 0.08)",
      "--border-glow": "rgba(91, 141, 239, 0.32)",

      // Soft tinted surfaces
      "--tint-navy":   "rgba(30, 58, 138, 0.18)",
      "--tint-gold":   "rgba(200, 147, 47, 0.14)",
      "--tint-green":  "rgba(52, 211, 153, 0.12)",
      "--tint-mint":   "rgba(52, 211, 153, 0.12)",
      "--tint-blue":   "rgba(91, 141, 239, 0.14)",
      "--tint-peach":  "rgba(236, 72, 153, 0.10)",
      "--tint-sage":   "rgba(52, 211, 153, 0.10)",

      // Brand
      "--navy":         "#5B8DEF",   /* primary accent (electric blue) */
      "--navy-dim":     "rgba(91, 141, 239, 0.14)",
      "--navy-border":  "rgba(91, 141, 239, 0.32)",
      "--gold":         "#F0B753",   /* warm accent */
      "--gold-dim":     "rgba(240, 183, 83, 0.14)",
      "--gold-border":  "rgba(240, 183, 83, 0.32)",
      "--charcoal":     "#0D1220",
      "--muted-green":  "#34D399",

      // Legacy aliases (preserve so existing pages keep working)
      "--teal":         "#5B8DEF",
      "--teal-dim":     "rgba(91, 141, 239, 0.14)",
      "--teal-border":  "rgba(91, 141, 239, 0.32)",
      "--sand":         "#F0B753",
      "--sand-dim":     "rgba(240, 183, 83, 0.14)",
      "--sand-border":  "rgba(240, 183, 83, 0.32)",
      "--mint":         "#34D399",
      "--sky":          "#5B8DEF",

      // Status
      "--green":   "#34D399",
      "--amber":   "#F0B753",
      "--warning": "#F0B753",
      "--red":     "#F87171",
      "--indigo":  "#8B5CF6",
      "--purple":  "#A78BFA",
      "--accent":  "#5B8DEF",

      // Typography
      "--text":       "#EAF0FF",
      "--text-muted": "#A8B3CF",
      "--text-dim":   "#6B7891",

      // Shadows / glows
      "--shadow":      "0 18px 40px rgba(0, 0, 0, 0.45)",
      "--shadow-sm":   "0 4px 12px rgba(0, 0, 0, 0.35)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.40)",
      "--glow":        "0 0 30px rgba(91, 141, 239, 0.30)",
      "--glow-gold":   "0 0 30px rgba(240, 183, 83, 0.25)",

      // Ambient gradient stops (used by AmbientBackground)
      "--ambient-1":   "rgba(91, 141, 239, 0.22)",
      "--ambient-2":   "rgba(139, 92, 246, 0.18)",
      "--ambient-3":   "rgba(34, 211, 238, 0.14)",
      "--ambient-4":   "rgba(240, 183, 83, 0.10)",

      // Legacy aliases
      "--rebos-bg":      "#070A14",
      "--rebos-surface": "rgba(20, 26, 45, 0.55)",
      "--rebos-card":    "rgba(20, 26, 45, 0.55)",
      "--rebos-border":  "rgba(120, 150, 220, 0.14)",
      "--rebos-teal":    "#5B8DEF",
      "--rebos-blue":    "#5B8DEF",
      "--rebos-purple":  "#A78BFA",
      "--rebos-text":    "#EAF0FF",
      "--rebos-muted":   "#A8B3CF",
      "--rebos-dim":     "#6B7891",
    },
  },

  // ── Recovery Glow ──────────────────────────────────────────────────
  recovery_glow: {
    key: "recovery_glow",
    label: "Recovery Glow",
    description: "Healing teal & violet aurora.",
    swatch: ["#0A1A1F", "#0E3439", "#34D399"],
    mode: "dark",
    vars: {
      "--bg": "#06121A", "--bg-2": "#0A1F26",
      "--surface": "rgba(14, 52, 57, 0.45)",
      "--card": "rgba(14, 52, 57, 0.45)", "--card-hover": "rgba(18, 66, 72, 0.65)",
      "--card-solid": "#0E3439",
      "--border": "rgba(52, 211, 153, 0.16)", "--border-soft": "rgba(52, 211, 153, 0.08)",
      "--border-glow": "rgba(52, 211, 153, 0.32)",
      "--tint-navy": "rgba(91, 141, 239, 0.14)", "--tint-gold": "rgba(240, 183, 83, 0.14)",
      "--tint-green": "rgba(52, 211, 153, 0.16)", "--tint-mint": "rgba(52, 211, 153, 0.16)",
      "--tint-blue": "rgba(91, 141, 239, 0.14)", "--tint-peach": "rgba(236, 72, 153, 0.10)",
      "--tint-sage": "rgba(52, 211, 153, 0.12)",
      "--navy": "#34D399", "--navy-dim": "rgba(52, 211, 153, 0.14)", "--navy-border": "rgba(52, 211, 153, 0.32)",
      "--gold": "#F0B753", "--gold-dim": "rgba(240, 183, 83, 0.14)", "--gold-border": "rgba(240, 183, 83, 0.32)",
      "--charcoal": "#0A1F26", "--muted-green": "#34D399",
      "--teal": "#34D399", "--teal-dim": "rgba(52, 211, 153, 0.14)", "--teal-border": "rgba(52, 211, 153, 0.32)",
      "--sand": "#F0B753", "--sand-dim": "rgba(240, 183, 83, 0.14)", "--sand-border": "rgba(240, 183, 83, 0.32)",
      "--mint": "#34D399", "--sky": "#22D3EE",
      "--green": "#34D399", "--amber": "#F0B753", "--warning": "#F0B753", "--red": "#F87171",
      "--indigo": "#8B5CF6", "--purple": "#A78BFA", "--accent": "#34D399",
      "--text": "#E6FFF6", "--text-muted": "#A0CFC1", "--text-dim": "#6E9C90",
      "--shadow": "0 18px 40px rgba(0, 0, 0, 0.45)", "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.35)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.40)",
      "--glow": "0 0 30px rgba(52, 211, 153, 0.30)", "--glow-gold": "0 0 30px rgba(240, 183, 83, 0.25)",
      "--ambient-1": "rgba(52, 211, 153, 0.22)", "--ambient-2": "rgba(139, 92, 246, 0.16)",
      "--ambient-3": "rgba(34, 211, 238, 0.14)", "--ambient-4": "rgba(240, 183, 83, 0.10)",
      "--rebos-bg": "#06121A", "--rebos-surface": "rgba(14, 52, 57, 0.45)",
      "--rebos-card": "rgba(14, 52, 57, 0.45)", "--rebos-border": "rgba(52, 211, 153, 0.16)",
      "--rebos-teal": "#34D399", "--rebos-blue": "#22D3EE", "--rebos-purple": "#A78BFA",
      "--rebos-text": "#E6FFF6", "--rebos-muted": "#A0CFC1", "--rebos-dim": "#6E9C90",
    },
  },

  // ── Veteran Tactical ────────────────────────────────────────────────
  veteran_tactical: {
    key: "veteran_tactical",
    label: "Veteran Tactical",
    description: "Disciplined steel & muted green.",
    swatch: ["#0B0F0E", "#1A2620", "#7CB387"],
    mode: "dark",
    vars: {
      "--bg": "#0A0E0D", "--bg-2": "#121A18",
      "--surface": "rgba(26, 38, 32, 0.55)", "--card": "rgba(26, 38, 32, 0.55)",
      "--card-hover": "rgba(34, 50, 42, 0.70)", "--card-solid": "#1A2620",
      "--border": "rgba(124, 179, 135, 0.16)", "--border-soft": "rgba(124, 179, 135, 0.08)",
      "--border-glow": "rgba(124, 179, 135, 0.32)",
      "--tint-navy": "rgba(91, 120, 130, 0.16)", "--tint-gold": "rgba(200, 147, 47, 0.14)",
      "--tint-green": "rgba(124, 179, 135, 0.18)", "--tint-mint": "rgba(124, 179, 135, 0.16)",
      "--tint-blue": "rgba(91, 120, 130, 0.14)", "--tint-peach": "rgba(200, 147, 47, 0.10)",
      "--tint-sage": "rgba(124, 179, 135, 0.14)",
      "--navy": "#7CB387", "--navy-dim": "rgba(124, 179, 135, 0.14)", "--navy-border": "rgba(124, 179, 135, 0.32)",
      "--gold": "#C8932F", "--gold-dim": "rgba(200, 147, 47, 0.14)", "--gold-border": "rgba(200, 147, 47, 0.32)",
      "--charcoal": "#121A18", "--muted-green": "#7CB387",
      "--teal": "#7CB387", "--teal-dim": "rgba(124, 179, 135, 0.14)", "--teal-border": "rgba(124, 179, 135, 0.32)",
      "--sand": "#C8932F", "--sand-dim": "rgba(200, 147, 47, 0.14)", "--sand-border": "rgba(200, 147, 47, 0.32)",
      "--mint": "#7CB387", "--sky": "#8FA9B5",
      "--green": "#7CB387", "--amber": "#C8932F", "--warning": "#C8932F", "--red": "#D9685D",
      "--indigo": "#7C8EBF", "--purple": "#9B8FBF", "--accent": "#7CB387",
      "--text": "#E8EFE9", "--text-muted": "#9FB0A4", "--text-dim": "#6B7A70",
      "--shadow": "0 18px 40px rgba(0, 0, 0, 0.50)", "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.35)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.40)",
      "--glow": "0 0 30px rgba(124, 179, 135, 0.24)", "--glow-gold": "0 0 30px rgba(200, 147, 47, 0.22)",
      "--ambient-1": "rgba(124, 179, 135, 0.18)", "--ambient-2": "rgba(91, 120, 130, 0.14)",
      "--ambient-3": "rgba(200, 147, 47, 0.10)", "--ambient-4": "rgba(60, 80, 70, 0.18)",
      "--rebos-bg": "#0A0E0D", "--rebos-surface": "rgba(26, 38, 32, 0.55)",
      "--rebos-card": "rgba(26, 38, 32, 0.55)", "--rebos-border": "rgba(124, 179, 135, 0.16)",
      "--rebos-teal": "#7CB387", "--rebos-blue": "#8FA9B5", "--rebos-purple": "#9B8FBF",
      "--rebos-text": "#E8EFE9", "--rebos-muted": "#9FB0A4", "--rebos-dim": "#6B7A70",
    },
  },

  // ── Re-entry Rebuild ────────────────────────────────────────────────
  reentry_rebuild: {
    key: "reentry_rebuild",
    label: "Re-entry Rebuild",
    description: "Urban amber & midnight.",
    swatch: ["#0D0B14", "#241A2A", "#F59E42"],
    mode: "dark",
    vars: {
      "--bg": "#0A0814", "--bg-2": "#15101F",
      "--surface": "rgba(36, 26, 42, 0.55)", "--card": "rgba(36, 26, 42, 0.55)",
      "--card-hover": "rgba(48, 34, 56, 0.70)", "--card-solid": "#241A2A",
      "--border": "rgba(245, 158, 66, 0.16)", "--border-soft": "rgba(245, 158, 66, 0.08)",
      "--border-glow": "rgba(245, 158, 66, 0.32)",
      "--tint-navy": "rgba(139, 92, 246, 0.14)", "--tint-gold": "rgba(245, 158, 66, 0.16)",
      "--tint-green": "rgba(52, 211, 153, 0.12)", "--tint-mint": "rgba(52, 211, 153, 0.12)",
      "--tint-blue": "rgba(139, 92, 246, 0.14)", "--tint-peach": "rgba(245, 158, 66, 0.14)",
      "--tint-sage": "rgba(52, 211, 153, 0.10)",
      "--navy": "#F59E42", "--navy-dim": "rgba(245, 158, 66, 0.14)", "--navy-border": "rgba(245, 158, 66, 0.32)",
      "--gold": "#F59E42", "--gold-dim": "rgba(245, 158, 66, 0.14)", "--gold-border": "rgba(245, 158, 66, 0.32)",
      "--charcoal": "#15101F", "--muted-green": "#34D399",
      "--teal": "#F59E42", "--teal-dim": "rgba(245, 158, 66, 0.14)", "--teal-border": "rgba(245, 158, 66, 0.32)",
      "--sand": "#F59E42", "--sand-dim": "rgba(245, 158, 66, 0.14)", "--sand-border": "rgba(245, 158, 66, 0.32)",
      "--mint": "#34D399", "--sky": "#A78BFA",
      "--green": "#34D399", "--amber": "#F59E42", "--warning": "#F59E42", "--red": "#F87171",
      "--indigo": "#8B5CF6", "--purple": "#A78BFA", "--accent": "#F59E42",
      "--text": "#FBF1E6", "--text-muted": "#C2B0BC", "--text-dim": "#7E6E80",
      "--shadow": "0 18px 40px rgba(0, 0, 0, 0.50)", "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.35)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.40)",
      "--glow": "0 0 30px rgba(245, 158, 66, 0.30)", "--glow-gold": "0 0 30px rgba(245, 158, 66, 0.30)",
      "--ambient-1": "rgba(245, 158, 66, 0.22)", "--ambient-2": "rgba(139, 92, 246, 0.18)",
      "--ambient-3": "rgba(236, 72, 153, 0.10)", "--ambient-4": "rgba(91, 141, 239, 0.10)",
      "--rebos-bg": "#0A0814", "--rebos-surface": "rgba(36, 26, 42, 0.55)",
      "--rebos-card": "rgba(36, 26, 42, 0.55)", "--rebos-border": "rgba(245, 158, 66, 0.16)",
      "--rebos-teal": "#F59E42", "--rebos-blue": "#A78BFA", "--rebos-purple": "#8B5CF6",
      "--rebos-text": "#FBF1E6", "--rebos-muted": "#C2B0BC", "--rebos-dim": "#7E6E80",
    },
  },

  // ── Wellness Calm ────────────────────────────────────────────────────
  wellness_calm: {
    key: "wellness_calm",
    label: "Wellness Calm",
    description: "Soft cyan, lavender, breathing motion.",
    swatch: ["#0A1320", "#162236", "#22D3EE"],
    mode: "dark",
    vars: {
      "--bg": "#080F1A", "--bg-2": "#0F1A2A",
      "--surface": "rgba(22, 34, 54, 0.55)", "--card": "rgba(22, 34, 54, 0.55)",
      "--card-hover": "rgba(30, 46, 72, 0.70)", "--card-solid": "#162236",
      "--border": "rgba(34, 211, 238, 0.16)", "--border-soft": "rgba(34, 211, 238, 0.08)",
      "--border-glow": "rgba(34, 211, 238, 0.32)",
      "--tint-navy": "rgba(91, 141, 239, 0.14)", "--tint-gold": "rgba(240, 183, 83, 0.10)",
      "--tint-green": "rgba(34, 211, 238, 0.16)", "--tint-mint": "rgba(34, 211, 238, 0.14)",
      "--tint-blue": "rgba(91, 141, 239, 0.14)", "--tint-peach": "rgba(167, 139, 250, 0.14)",
      "--tint-sage": "rgba(34, 211, 238, 0.10)",
      "--navy": "#22D3EE", "--navy-dim": "rgba(34, 211, 238, 0.14)", "--navy-border": "rgba(34, 211, 238, 0.32)",
      "--gold": "#A78BFA", "--gold-dim": "rgba(167, 139, 250, 0.14)", "--gold-border": "rgba(167, 139, 250, 0.32)",
      "--charcoal": "#0F1A2A", "--muted-green": "#5EEAD4",
      "--teal": "#22D3EE", "--teal-dim": "rgba(34, 211, 238, 0.14)", "--teal-border": "rgba(34, 211, 238, 0.32)",
      "--sand": "#A78BFA", "--sand-dim": "rgba(167, 139, 250, 0.14)", "--sand-border": "rgba(167, 139, 250, 0.32)",
      "--mint": "#5EEAD4", "--sky": "#22D3EE",
      "--green": "#5EEAD4", "--amber": "#F0B753", "--warning": "#F0B753", "--red": "#F87171",
      "--indigo": "#8B5CF6", "--purple": "#A78BFA", "--accent": "#22D3EE",
      "--text": "#E6F4FF", "--text-muted": "#9CB4CF", "--text-dim": "#6A7E96",
      "--shadow": "0 18px 40px rgba(0, 0, 0, 0.45)", "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.35)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.40)",
      "--glow": "0 0 30px rgba(34, 211, 238, 0.28)", "--glow-gold": "0 0 30px rgba(167, 139, 250, 0.24)",
      "--ambient-1": "rgba(34, 211, 238, 0.20)", "--ambient-2": "rgba(167, 139, 250, 0.18)",
      "--ambient-3": "rgba(91, 141, 239, 0.12)", "--ambient-4": "rgba(94, 234, 212, 0.10)",
      "--rebos-bg": "#080F1A", "--rebos-surface": "rgba(22, 34, 54, 0.55)",
      "--rebos-card": "rgba(22, 34, 54, 0.55)", "--rebos-border": "rgba(34, 211, 238, 0.16)",
      "--rebos-teal": "#22D3EE", "--rebos-blue": "#5B8DEF", "--rebos-purple": "#A78BFA",
      "--rebos-text": "#E6F4FF", "--rebos-muted": "#9CB4CF", "--rebos-dim": "#6A7E96",
    },
  },

  // ── Focus Mode ───────────────────────────────────────────────────────
  focus_mode: {
    key: "focus_mode",
    label: "Focus Mode",
    description: "Pure black, single accent. Zero distraction.",
    swatch: ["#000000", "#0A0A0A", "#5B8DEF"],
    mode: "dark",
    vars: {
      "--bg": "#000000", "--bg-2": "#06070A",
      "--surface": "rgba(15, 16, 22, 0.70)", "--card": "rgba(15, 16, 22, 0.70)",
      "--card-hover": "rgba(22, 24, 32, 0.85)", "--card-solid": "#0A0A0F",
      "--border": "rgba(255, 255, 255, 0.08)", "--border-soft": "rgba(255, 255, 255, 0.04)",
      "--border-glow": "rgba(91, 141, 239, 0.32)",
      "--tint-navy": "rgba(91, 141, 239, 0.10)", "--tint-gold": "rgba(240, 183, 83, 0.08)",
      "--tint-green": "rgba(52, 211, 153, 0.08)", "--tint-mint": "rgba(52, 211, 153, 0.08)",
      "--tint-blue": "rgba(91, 141, 239, 0.10)", "--tint-peach": "rgba(236, 72, 153, 0.08)",
      "--tint-sage": "rgba(52, 211, 153, 0.06)",
      "--navy": "#5B8DEF", "--navy-dim": "rgba(91, 141, 239, 0.12)", "--navy-border": "rgba(91, 141, 239, 0.32)",
      "--gold": "#F0B753", "--gold-dim": "rgba(240, 183, 83, 0.12)", "--gold-border": "rgba(240, 183, 83, 0.32)",
      "--charcoal": "#06070A", "--muted-green": "#34D399",
      "--teal": "#5B8DEF", "--teal-dim": "rgba(91, 141, 239, 0.12)", "--teal-border": "rgba(91, 141, 239, 0.32)",
      "--sand": "#F0B753", "--sand-dim": "rgba(240, 183, 83, 0.12)", "--sand-border": "rgba(240, 183, 83, 0.32)",
      "--mint": "#34D399", "--sky": "#5B8DEF",
      "--green": "#34D399", "--amber": "#F0B753", "--warning": "#F0B753", "--red": "#F87171",
      "--indigo": "#8B5CF6", "--purple": "#A78BFA", "--accent": "#5B8DEF",
      "--text": "#FFFFFF", "--text-muted": "#A0A8B8", "--text-dim": "#5B6478",
      "--shadow": "0 18px 40px rgba(0, 0, 0, 0.65)", "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.50)",
      "--shadow-card": "0 12px 28px rgba(0, 0, 0, 0.55)",
      "--glow": "0 0 30px rgba(91, 141, 239, 0.30)", "--glow-gold": "0 0 30px rgba(240, 183, 83, 0.22)",
      "--ambient-1": "rgba(91, 141, 239, 0.10)", "--ambient-2": "rgba(0, 0, 0, 0.0)",
      "--ambient-3": "rgba(0, 0, 0, 0.0)", "--ambient-4": "rgba(0, 0, 0, 0.0)",
      "--rebos-bg": "#000000", "--rebos-surface": "rgba(15, 16, 22, 0.70)",
      "--rebos-card": "rgba(15, 16, 22, 0.70)", "--rebos-border": "rgba(255, 255, 255, 0.08)",
      "--rebos-teal": "#5B8DEF", "--rebos-blue": "#5B8DEF", "--rebos-purple": "#A78BFA",
      "--rebos-text": "#FFFFFF", "--rebos-muted": "#A0A8B8", "--rebos-dim": "#5B6478",
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME_KEY = "midnight_elite";

export const applyTheme = (themeKey) => {
  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME_KEY];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = theme.key;
  root.dataset.mode = theme.mode;
};