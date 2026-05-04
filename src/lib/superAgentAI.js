// Re-siliant SuperAgent — AI brain
import { base44 } from "@/api/base44Client";
import { SA_CATEGORIES, detectCrisis } from "./superAgentConfig";

const SYSTEM_TONE = `
You are the Re-siliant SuperAgent — a calm, encouraging, direct AI guide for people in recovery, reentry, veterans, and anyone working to rebuild their life.

Tone rules (NEVER break these):
- Calm, encouraging, direct, easy to understand.
- Non-medical, non-judgmental, respectful, hopeful, action-focused.
- Speak like a smart friend — short sentences, plain words. No jargon.
- Never lecture. Never moralize. Never shame.
- You are NOT a doctor, therapist, counselor, sponsor, probation officer, attorney, or emergency service. Never claim to replace them.
- If the user's situation needs a professional, gently say so and point them in that direction.

Crisis rule:
- If the user mentions self-harm, suicide, overdose, violence, or a medical emergency, your FIRST line MUST tell them to call 911 or 988 immediately, and to reach a trusted person, sponsor, counselor, or crisis line.
- Stay with them. Be calm. Don't preach.

Output rule:
- Always return valid JSON matching the schema you're given. No extra text.
`.trim();

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    response: {
      type: "string",
      description: "The full supportive response to the user. 3–7 short sentences. Plain text. No markdown headers.",
    },
    summary: {
      type: "string",
      description: "One short line summarizing what the user is dealing with.",
    },
    category: {
      type: "string",
      enum: SA_CATEGORIES.map(c => c.key),
      description: "Best-fit category for this conversation.",
    },
    suggested_next_steps: {
      type: "array",
      items: { type: "string" },
      description: "2–5 concrete, doable next steps. Plain language, action-focused.",
    },
    suggested_resources: {
      type: "array",
      items: { type: "string" },
      description: "0–4 relevant Re-siliant resources or page names (e.g. 'Veteran Support Hub', 'Meeting Directory', 'Aftercare Plan Builder', '988 Lifeline'). Skip if none fit.",
    },
    is_crisis: {
      type: "boolean",
      description: "True ONLY if user mentioned self-harm, suicide, overdose, violence, or medical emergency.",
    },
  },
  required: ["response", "summary", "category", "suggested_next_steps", "is_crisis"],
};

const buildPrompt = ({ userInput, history = [] }) => {
  const historyText = history.length
    ? "\n\nConversation so far:\n" + history.map((h, i) =>
        `Turn ${i + 1}\nUser: ${h.user_message}\nYou: ${h.ai_response}`
      ).join("\n\n")
    : "";

  return `${SYSTEM_TONE}

${historyText}

User's latest message:
"""
${userInput}
"""

Respond as the SuperAgent. Return JSON only.`;
};

export const generateSuperAgentResponse = async ({ userInput, history = [] }) => {
  const crisisFromKeywords = detectCrisis(userInput);

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: buildPrompt({ userInput, history }),
    response_json_schema: RESPONSE_SCHEMA,
  });

  // Hard-override: if our keyword scan caught a crisis, force is_crisis true
  // and prepend a 911/988 line if the model didn't.
  let response = result.response || "";
  let isCrisis = !!result.is_crisis || crisisFromKeywords;

  if (isCrisis && !/911|988/.test(response)) {
    response = `If you're in danger right now, please call 911 or 988 (Suicide & Crisis Lifeline). You can also text HOME to 741741. Reach out to a trusted person, sponsor, or counselor as soon as you can.\n\n${response}`;
  }

  return {
    response,
    summary: result.summary || "",
    category: result.category || "ask_anything",
    suggested_next_steps: Array.isArray(result.suggested_next_steps) ? result.suggested_next_steps : [],
    suggested_resources:  Array.isArray(result.suggested_resources)  ? result.suggested_resources  : [],
    is_crisis: isCrisis,
  };
};

// Plan generator — used by "Create 7-Day Plan" and similar quick actions
const PLAN_SCHEMA = {
  type: "object",
  properties: {
    plan_title: { type: "string" },
    plan_summary: { type: "string" },
    action_steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["day", "title"],
      },
    },
  },
  required: ["plan_title", "plan_summary", "action_steps"],
};

export const generateSuperAgentPlan = async ({ context, planType = "7_day" }) => {
  const days = planType === "daily" ? 1 : planType === "7_day" ? 7 : planType === "30_day" ? 30 : 90;
  const prompt = `${SYSTEM_TONE}

Build a ${days}-day plan for this person. Keep each day's step small, doable, and concrete. Plain language.

Context from their conversation:
"""
${context}
"""

Return JSON with plan_title, plan_summary, and action_steps array (one per day, day 1..${days}).`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: PLAN_SCHEMA,
  });

  return {
    plan_title: result.plan_title || `${days}-Day Plan`,
    plan_summary: result.plan_summary || "",
    action_steps: (result.action_steps || []).map(s => ({
      day: s.day,
      title: s.title,
      description: s.description || "",
      completed: false,
    })),
  };
};