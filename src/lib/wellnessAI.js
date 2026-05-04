// Alkaline Fuel & Fitness — AI plan generator
import { base44 } from "@/api/base44Client";
import {
  WP_MODE_TONE, ALKALINE_FOODS, FOODS_TO_REDUCE, DURATION_DAYS,
} from "./wellnessConfig";

const SAFETY = `
You are a wellness plan generator inside a recovery & reentry support app.

SAFETY RULES (NEVER break):
- Present alkaline-style eating as a CLEAN EATING and WELLNESS approach.
- NEVER claim alkaline eating cures addiction, disease, mental health, cancer, or medical problems.
- NEVER give medical advice. Always recommend speaking with a doctor, nutritionist, or healthcare professional before major diet/exercise changes — especially with medical conditions, injuries, or medication.
- Be practical. The user may have limited money, no kitchen, or live in a shelter. Adjust accordingly.
- Be supportive, never shaming. Action-focused, plain language.

OUTPUT RULE: Return valid JSON matching the schema. No extra text.
`.trim();

const NUTRITION_DAY_SCHEMA = {
  type: "object",
  properties: {
    day: { type: "number" },
    phase: { type: "string", description: "phase_1, phase_2, phase_3, or empty" },
    breakfast: { type: "string" },
    lunch: { type: "string" },
    dinner: { type: "string" },
    snacks: { type: "string" },
    hydration: { type: "string" },
    discipline_check: { type: "string" },
  },
  required: ["day", "breakfast", "lunch", "dinner"],
};

const WORKOUT_DAY_SCHEMA = {
  type: "object",
  properties: {
    day: { type: "number" },
    phase: { type: "string" },
    title: { type: "string" },
    warmup: { type: "string" },
    main_workout: { type: "string" },
    core_finisher: { type: "string" },
    cooldown: { type: "string" },
    beginner_mod: { type: "string" },
    advanced_mod: { type: "string" },
    rest_day: { type: "boolean" },
  },
  required: ["day", "title"],
};

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    plan_title: { type: "string" },
    headline_message: { type: "string", description: "Strong opener / mission line in the chosen mode's voice" },
    discipline_goal: { type: "string" },
    hydration_goal: { type: "string" },
    weekly_goal: { type: "string" },

    meal_plan: { type: "array", items: NUTRITION_DAY_SCHEMA },
    workout_plan: { type: "array", items: WORKOUT_DAY_SCHEMA },

    grocery_list: { type: "array", items: { type: "string" } },
    low_cost_options: { type: "array", items: { type: "string" } },
    pantry_friendly_options: { type: "array", items: { type: "string" } },
    alkaline_foods: { type: "array", items: { type: "string" } },
    gut_health_tips: { type: "array", items: { type: "string" } },
    foods_to_reduce: { type: "array", items: { type: "string" } },
    meal_prep_tips: { type: "array", items: { type: "string" } },

    phase_1_focus: { type: "string" },
    phase_2_focus: { type: "string" },
    phase_3_focus: { type: "string" },
  },
  required: ["plan_title", "headline_message", "discipline_goal"],
};

const buildPrompt = ({ planType, duration, mode, answers }) => {
  const days = DURATION_DAYS[duration] || 7;
  const tone = WP_MODE_TONE[mode] || WP_MODE_TONE.standard;
  const includeMeals    = planType === "nutrition" || planType === "full_90";
  const includeWorkouts = planType === "exercise"  || planType === "full_90";

  // For long plans, only fully detail key days; mark phase on each day
  const planScopeNote = days <= 7
    ? `Generate every day in detail (days 1..${days}).`
    : days === 30
      ? `Generate days 1, 7, 14, 21, and 30 in detail. Mark phase as "active".`
      : `This is a 90-day plan with 3 phases (Reset days 1–30, Build days 31–60, Discipline days 61–90). Generate days 1, 15, 30, 45, 60, 75, 90 in detail. Set "phase" on each day to phase_1, phase_2, or phase_3. Also fill phase_1_focus, phase_2_focus, phase_3_focus with the focus list for that phase.`;

  return `${SAFETY}

TONE: ${tone}

USER ANSWERS:
${JSON.stringify(answers, null, 2)}

PLAN TYPE: ${planType}
DURATION: ${duration} (${days} days)
INCLUDE MEALS: ${includeMeals}
INCLUDE WORKOUTS: ${includeWorkouts}

${planScopeNote}

Reference (you may use these in suggestions):
- Alkaline-style foods: ${ALKALINE_FOODS.join(", ")}
- Foods to reduce: ${FOODS_TO_REDUCE.join(", ")}

Build a personalized, practical plan that respects food access, cooking setup, equipment, and limitations. Adjust for the user's mode (${mode}). Return JSON only.`;
};

export const generateWellnessPlan = async ({ planType, duration, mode = "standard", answers }) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: buildPrompt({ planType, duration, mode, answers }),
    response_json_schema: PLAN_SCHEMA,
  });

  return {
    plan_title: result.plan_title || "My Wellness Plan",
    headline_message: result.headline_message || "Build your body. Clear your mind. Reclaim your discipline.",
    discipline_goal: result.discipline_goal || "Show up for yourself today.",
    hydration_goal: result.hydration_goal || "Drink at least 8 glasses of water.",
    weekly_goal: result.weekly_goal || "",
    meal_plan: Array.isArray(result.meal_plan) ? result.meal_plan : [],
    workout_plan: Array.isArray(result.workout_plan) ? result.workout_plan : [],
    grocery_list: result.grocery_list || [],
    low_cost_options: result.low_cost_options || [],
    pantry_friendly_options: result.pantry_friendly_options || [],
    alkaline_foods: result.alkaline_foods || ALKALINE_FOODS,
    gut_health_tips: result.gut_health_tips || [],
    foods_to_reduce: result.foods_to_reduce || FOODS_TO_REDUCE,
    meal_prep_tips: result.meal_prep_tips || [],
    phase_1_focus: result.phase_1_focus || "",
    phase_2_focus: result.phase_2_focus || "",
    phase_3_focus: result.phase_3_focus || "",
  };
};