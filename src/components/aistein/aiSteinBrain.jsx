// AI Stein — brain module: calls LLM with structured system prompt + context
import { base44 } from "@/api/base44Client";
import { detectIntent, detectCrisis, searchPages } from "./aiSteinConfig";

const SYSTEM_PROMPT = `You are AI Stein, a calm, grounded companion inside the Ah Ha recovery app.

IDENTITY: You are a guide and navigator — not a therapist, not a doctor, not a cheerleader.

TONE:
- Calm, respectful, direct
- Human-like, never robotic or preachy
- Simple language, no jargon

RULES:
- Do not give medical, clinical, or legal advice
- Do not diagnose
- If the user shows distress, gently suggest real-world support (988, Inner Circle, meeting, breathing)
- Keep responses under 80 words unless steps are requested
- When suggesting steps, use a short numbered list (max 3 steps)

OUTPUT:
Return JSON matching the provided schema. The "message" is what the user sees. The "route" is an optional in-app path to navigate to. "steps" is an optional short action list.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    message:  { type: "string", description: "Short, human reply shown to the user" },
    route:    { type: "string", description: "Optional in-app route like /Meetings or /DailyCheckIn. Empty string if none." },
    steps:    { type: "array", items: { type: "string" }, description: "Optional 1–3 short action steps" },
    crisis:   { type: "boolean", description: "True if user language indicates crisis" },
  },
  required: ["message"],
};

export async function askAIStein({ query, user, context = {} }) {
  const intent = detectIntent(query);
  const isCrisis = detectCrisis(query);

  // Short-circuit: crisis → skip LLM, return safe hardcoded response fast
  if (isCrisis) {
    return {
      message: "What you're feeling matters. You don't have to carry it alone right now. Please reach out — call or text 988 anytime, or open your Inner Circle to reach someone you trust.",
      route: "/Lifeline",
      steps: ["Call or text 988", "Open Inner Circle", "Take three slow breaths"],
      crisis: true,
      intent: "support",
    };
  }

  // Local search fast-path for navigation queries
  const pageMatches = searchPages(query, 3);
  const ctxLines = [];
  if (user?.full_name)        ctxLines.push(`User: ${user.full_name}`);
  if (context.currentPath)    ctxLines.push(`Currently on: ${context.currentPath}`);
  if (context.timeOfDay)      ctxLines.push(`Time of day: ${context.timeOfDay}`);
  if (context.missedCheckin)  ctxLines.push(`Note: user has not checked in today`);
  if (context.streak != null) ctxLines.push(`Check-in streak: ${context.streak} days`);

  const prompt = `${SYSTEM_PROMPT}

CONTEXT:
${ctxLines.join("\n") || "(none)"}

DETECTED INTENT: ${intent}

AVAILABLE IN-APP ROUTES (pick one if relevant):
${pageMatches.map(p => `- ${p.route}  (${p.name})`).join("\n") || "- /  (Home)"}

USER MESSAGE:
${query}

Respond as AI Stein. Be brief. If the user wants a resource or tool that matches one of the routes above, set "route" to that path.`;

  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESPONSE_SCHEMA,
    });
    return {
      message: res?.message || "I'm here. What's going on?",
      route:   res?.route || pageMatches[0]?.route || "",
      steps:   Array.isArray(res?.steps) ? res.steps.slice(0, 3) : [],
      crisis:  !!res?.crisis,
      intent,
    };
  } catch (e) {
    // Graceful fallback — still give navigation if we can
    return {
      message: pageMatches.length
        ? `Here's what might help:`
        : "I'm having trouble thinking right now. Try a quick action below.",
      route: pageMatches[0]?.route || "",
      steps: [],
      crisis: false,
      intent,
    };
  }
}