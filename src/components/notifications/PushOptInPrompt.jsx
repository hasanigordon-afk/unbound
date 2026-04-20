/**
 * Legacy shim — the push opt-in has been replaced by the 3 H's SubscriptionPrompt.
 * This file re-exports the trigger helpers so existing callers keep working.
 */
import { trackHomeVisit, markTrigger, TRIGGERS } from "@/lib/subscriptionEngine";

export { trackHomeVisit };

// Old name used throughout the app — maps to a generic "meaningful action" trigger.
export function markActionComplete() {
  markTrigger(TRIGGERS.FIRST_CHECKIN);
}

// Default export kept as a no-op component so any legacy imports don't crash.
export default function PushOptInPrompt() { return null; }