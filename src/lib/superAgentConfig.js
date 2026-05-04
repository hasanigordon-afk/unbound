// Re-siliant SuperAgent — categories, prompts, palette
import {
  HeartPulse, Compass, Shield, Home, Utensils, Briefcase, Bus,
  Brain, Dumbbell, Sparkles, AlertTriangle, Target, MessageCircle,
} from "lucide-react";

export const SA_COLORS = {
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

export const SA_CATEGORIES = [
  { key: "recovery_support",  label: "Recovery Support",   icon: HeartPulse,    color: "#2E7D7A", tint: "rgba(46,125,122,0.10)" },
  { key: "reentry_support",   label: "Reentry Support",    icon: Compass,       color: "#0F1E3D", tint: "rgba(15,30,61,0.08)" },
  { key: "veteran_support",   label: "Veteran Support",    icon: Shield,        color: "#1E88E5", tint: "rgba(30,136,229,0.10)" },
  { key: "housing_help",      label: "Housing Help",       icon: Home,          color: "#6B5B8E", tint: "rgba(107,91,142,0.10)" },
  { key: "food_help",         label: "Food Help",          icon: Utensils,      color: "#C8932F", tint: "rgba(200,147,47,0.10)" },
  { key: "job_search",        label: "Job Search",         icon: Briefcase,     color: "#2A6F4A", tint: "rgba(42,111,74,0.10)" },
  { key: "transportation",    label: "Transportation",     icon: Bus,           color: "#4A6B8A", tint: "rgba(74,107,138,0.10)" },
  { key: "mental_wellness",   label: "Mental Wellness",    icon: Brain,         color: "#7C5CBF", tint: "rgba(124,92,191,0.10)" },
  { key: "fitness_nutrition", label: "Fitness & Nutrition",icon: Dumbbell,      color: "#2E7D7A", tint: "rgba(46,125,122,0.10)" },
  { key: "daily_motivation",  label: "Daily Motivation",   icon: Sparkles,      color: "#C8932F", tint: "rgba(200,147,47,0.10)" },
  { key: "emergency_planning",label: "Emergency Planning", icon: AlertTriangle, color: "#B5483D", tint: "rgba(181,72,61,0.10)" },
  { key: "personal_goals",    label: "Personal Goals",     icon: Target,        color: "#0F1E3D", tint: "rgba(15,30,61,0.08)" },
  { key: "ask_anything",      label: "Ask AI Anything",    icon: MessageCircle, color: "#4A5260", tint: "rgba(74,82,96,0.08)" },
];

export const SA_CATEGORY_MAP = Object.fromEntries(SA_CATEGORIES.map(c => [c.key, c]));

export const SA_STARTER_PROMPTS = [
  { key: "out_of_treatment", text: "I just got out of treatment. What should I do first?", category: "recovery_support" },
  { key: "need_food",        text: "I need help finding food today.",                       category: "food_help" },
  { key: "need_job",         text: "I need a job but I don't know where to start.",         category: "job_search" },
  { key: "veteran",          text: "I'm a veteran and I need support.",                     category: "veteran_support" },
  { key: "released",         text: "I just got released and need a plan.",                  category: "reentry_support" },
  { key: "overwhelmed",      text: "I feel overwhelmed today.",                             category: "mental_wellness" },
  { key: "seven_day_plan",   text: "Help me make a 7-day plan.",                            category: "personal_goals" },
  { key: "stay_focused",     text: "Help me stay focused today.",                           category: "daily_motivation" },
  { key: "ask_counselor",    text: "What should I ask my counselor?",                       category: "recovery_support" },
  { key: "ah_ha",            text: "Help me write down my Ah Ha Moment.",                   category: "personal_goals" },
];

export const SA_QUICK_ACTIONS = [
  { key: "save",          label: "Save This",            icon: "💾" },
  { key: "goal",          label: "Turn Into Goal",       icon: "🎯" },
  { key: "reminder",      label: "Add Reminder",         icon: "⏰" },
  { key: "resources",     label: "Find Resources",       icon: "🗺️" },
  { key: "plan_7",        label: "Create 7-Day Plan",    icon: "📅" },
  { key: "plan_90",       label: "Add to 90-Day Plan",   icon: "📆" },
  { key: "share_counselor", label: "Share w/ Counselor", icon: "👤" },
  { key: "share_sponsor",   label: "Share w/ Sponsor",   icon: "🤝" },
  { key: "share_po",        label: "Share w/ PO",        icon: "⚖️" },
  { key: "ah_ha",         label: "Write Ah Ha Moment",   icon: "✨" },
];

// Crisis keyword detection — broad net, errs toward safety
export const CRISIS_KEYWORDS = [
  "kill myself", "kill my self", "suicide", "suicidal", "end my life", "end it all",
  "want to die", "wanna die", "don't want to live", "dont want to live",
  "self harm", "self-harm", "hurt myself", "cut myself", "cutting myself",
  "overdose", "od ", "od.", "od,", "took too many", "took too much",
  "kill someone", "hurt someone", "shoot", "gun to my", "knife to my",
  "emergency", "dying", "bleeding out", "can't breathe", "cant breathe",
  "heart attack", "stroke",
];

export const detectCrisis = (text = "") => {
  const t = (text || "").toLowerCase();
  return CRISIS_KEYWORDS.some(k => t.includes(k));
};