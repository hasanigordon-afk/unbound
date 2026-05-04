// Alkaline Fuel & Fitness — config, questions, mode language
import { Apple, Dumbbell, Calendar } from "lucide-react";

export const WP_COLORS = {
  navy:    "#0F1E3D",
  gold:    "#C8932F",
  cream:   "#F6F4EF",
  text:    "#1A1F2C",
  muted:   "#4A5260",
  dim:     "#6B7280",
  card:    "#FFFFFF",
  border:  "#E4DFD3",
  green:   "#6B8F71",
  red:     "#B5483D",
};

export const WP_PLAN_TYPES = [
  { key: "nutrition", label: "Nutrition Plan",   icon: Apple,    desc: "Build clean eating habits",       cta: "Create My Nutrition Plan" },
  { key: "exercise",  label: "Exercise Plan",    icon: Dumbbell, desc: "Move your body. Stack discipline.", cta: "Create My Exercise Plan"  },
  { key: "full_90",   label: "90-Day Wellness Plan", icon: Calendar, desc: "Reset · Build · Discipline",  cta: "Create Full 90-Day Plan"   },
];

export const WP_MODES = [
  { key: "standard", label: "Standard",        desc: "Clear, supportive, simple." },
  { key: "veteran",  label: "Veteran Mode",    desc: "Mission-based & disciplined." },
  { key: "rebuild",  label: "Men's Rebuild",   desc: "Strong, focused, no excuses." },
];

// Tone instructions injected into the AI prompt per mode
export const WP_MODE_TONE = {
  standard: `Use a calm, supportive, encouraging tone. Plain language. Focus on doability.`,
  veteran:  `Use Veteran Mode framing. Use "Today's Mission", "Daily Standard", "Fuel Objective", "Movement Objective", "Recovery Objective", "Discipline Check", "Mission Complete". Mission-based, structured, disciplined. Strong but never harsh.`,
  rebuild:  `Use Men's Rebuild Mode framing. Focus on confidence, discipline, energy, strength, structure, accountability, rebuilding self-respect, reducing excuses, creating routine. Strong but supportive. Lines like "This plan is not about perfection. It is about proving to yourself that you can still show up."`,
};

// ── Nutrition questionnaire ──
export const NUTRITION_QUESTIONS = [
  { key: "nutrition_goal", q: "What is your main nutrition goal?", multi: false, options: [
    "More energy", "Weight loss", "Muscle support", "Better digestion",
    "Cleaner eating", "Reduce sugar cravings", "Build daily discipline", "Overall wellness",
  ]},
  { key: "meals_per_day", q: "How many meals do you usually eat per day?", multi: false, options: [
    "1 meal", "2 meals", "3 meals", "3 meals plus snacks",
  ]},
  { key: "food_access", q: "What is your current food access?", multi: false, options: [
    "I can grocery shop regularly",
    "I have limited money for food",
    "I use food pantries or community resources",
    "I mostly eat fast food or convenience food",
    "I live in a shelter or shared housing",
    "I need very low-cost meal ideas",
  ]},
  { key: "foods_to_avoid", q: "What foods do you want to avoid?", multi: true, options: [
    "Pork", "Red meat", "Fried foods", "Dairy", "Processed sugar",
    "Soda", "Alcohol", "Too much bread", "None",
  ]},
  { key: "fasting_preference", q: "Do you want fasting included?", multi: false, options: [
    "No fasting", "12-hour overnight fast", "14-hour fast", "16-hour fast", "Teach me about fasting first",
  ]},
  { key: "cooking_setup", q: "What cooking setup do you have?", multi: false, options: [
    "Full kitchen", "Microwave only", "Hot plate", "Air fryer", "No kitchen", "Not sure",
  ]},
  { key: "duration", q: "What type of plan do you want?", multi: false, options: [
    "1-day plan", "3-day plan", "7-day plan", "30-day plan", "90-day plan",
  ]},
];

// ── Exercise questionnaire ──
export const EXERCISE_QUESTIONS = [
  { key: "fitness_level", q: "What is your current fitness level?", multi: false, options: [
    "Beginner", "Getting back in shape", "Intermediate", "Advanced", "Injured or limited mobility",
  ]},
  { key: "fitness_goal", q: "What is your main fitness goal?", multi: false, options: [
    "Lose weight", "Build strength", "Improve endurance", "Improve discipline",
    "Reduce stress", "Build confidence", "Stay sober and focused", "Prepare for work", "Feel like myself again",
  ]},
  { key: "equipment_available", q: "What equipment do you have?", multi: true, options: [
    "No equipment", "Resistance bands", "Dumbbells", "Gym access",
    "Pull-up bar", "Outdoor space", "Pool access", "Not sure",
  ]},
  { key: "preferred_exercises", q: "What exercises do you prefer?", multi: true, options: [
    "Walking", "Swimming", "Pushups", "Planks", "Core workouts", "Stretching",
    "Bodyweight workouts", "Running", "Boxing-style conditioning", "Mobility work", "Low-impact workouts",
  ]},
  { key: "days_per_week", q: "How many days per week can you work out?", multi: false, options: [
    "2 days", "3 days", "4 days", "5 days", "Every day, light movement",
  ]},
  { key: "minutes_per_workout", q: "How much time do you have per workout?", multi: false, options: [
    "10 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes",
  ]},
  { key: "limitations", q: "Do you have any limitations?", multi: true, options: [
    "Knee pain", "Back pain", "Shoulder pain", "Low energy",
    "Overweight", "Limited mobility", "No limitations", "Prefer not to say",
  ]},
];

// Map "X-day plan" answer → duration enum
export const DURATION_MAP = {
  "1-day plan": "1_day",
  "3-day plan": "3_day",
  "7-day plan": "7_day",
  "30-day plan": "30_day",
  "90-day plan": "90_day",
};
export const DURATION_DAYS = { "1_day": 1, "3_day": 3, "7_day": 7, "30_day": 30, "90_day": 90 };

export const ALKALINE_FOODS = [
  "Leafy greens", "Cucumbers", "Avocados", "Quinoa", "Lentils", "Chickpeas",
  "Sweet potatoes", "Berries", "Apples", "Bananas", "Melons", "Herbal teas",
  "Lemon water", "Nuts and seeds", "Olive oil", "Fresh vegetables", "Beans", "Whole grains",
];

export const FOODS_TO_REDUCE = [
  "Soda", "Candy", "Fried foods", "Heavy processed foods", "Excess white bread",
  "Excess sugar", "Excess energy drinks", "Too much fast food", "Alcohol",
];

export const QUICK_ACTIONS = [
  { key: "new_plan",        label: "Generate New Plan",   icon: "🔄" },
  { key: "save",            label: "Save to Profile",     icon: "💾" },
  { key: "start_90",        label: "Start 90-Day Plan",   icon: "📆" },
  { key: "low_cost",        label: "Low-Cost Meal Ideas", icon: "💰" },
  { key: "no_equipment",    label: "No Equipment Workout",icon: "💪" },
  { key: "pantry",          label: "Food Pantry Meals",   icon: "🥫" },
  { key: "veteran_mode",    label: "Veteran Mode",        icon: "🇺🇸" },
  { key: "rebuild_mode",    label: "Men's Rebuild Mode",  icon: "🔥" },
  { key: "adjust_injury",   label: "Adjust for Injury",   icon: "🩹" },
  { key: "update_goal",     label: "Update My Goal",      icon: "🎯" },
];