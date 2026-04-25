/**
 * Ah Ha — Recovery focus categories.
 * Single source of truth for category metadata used across onboarding, profile,
 * admin filtering, and crisis-routing logic.
 */

export const CRISIS_CATEGORIES = ["self_harm", "suicide_prevention"];

export const RECOVERY_CATEGORIES = [
  { value: "alcohol",                       label: "Alcohol",                                  emoji: "🍷" },
  { value: "narcotics_drugs",               label: "Narcotics / Drugs",                        emoji: "💊" },
  { value: "opioids",                       label: "Opioids",                                  emoji: "🩹" },
  { value: "marijuana_cannabis",            label: "Marijuana / Cannabis",                     emoji: "🌿" },
  { value: "nicotine_tobacco",              label: "Nicotine / Tobacco",                       emoji: "🚬" },
  { value: "gambling",                      label: "Gambling",                                 emoji: "🎲" },
  { value: "food_eating",                   label: "Food / Eating-related",                    emoji: "🍽️" },
  { value: "prescription_misuse",           label: "Prescription medication misuse",           emoji: "📋" },
  { value: "pornography_compulsive_sexual", label: "Pornography / compulsive sexual behavior", emoji: "💭" },
  { value: "general_addiction",             label: "General addiction recovery",               emoji: "🌱" },
  { value: "multiple_co_occurring",         label: "Multiple / co-occurring recovery areas",   emoji: "🔀" },
  { value: "supporting_loved_one",          label: "Supporting a loved one in recovery",       emoji: "💛" },
  // Crisis-support categories — handled with elevated safety routing
  { value: "self_harm",                     label: "Self-harm recovery support",               emoji: "🤍", isCrisis: true },
  { value: "suicide_prevention",            label: "Suicide prevention / crisis-support",      emoji: "🆘", isCrisis: true },
];

export const CATEGORY_BY_VALUE = Object.fromEntries(
  RECOVERY_CATEGORIES.map(c => [c.value, c])
);

export const isCrisisCategory = (value) => CRISIS_CATEGORIES.includes(value);