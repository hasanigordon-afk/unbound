/**
 * UNBOUND COPY SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all user-facing language in the app.
 * Import with: import { COPY } from "@/components/copy";
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * VOICE PRINCIPLES
 * ═════════════════════════════════════════════════════════════════════════════
 *
 *  1. Human first.   Write like a calm, knowledgeable friend — not a form.
 *  2. Plain language. If a 7th grader would struggle, rewrite it.
 *  3. Steady & warm.  Not cheerful. Not clinical. Never cold.
 *  4. Short sentences. Especially in moments of stress.
 *  5. Never lecture.  Never shame. Never over-explain.
 *  6. Always forward. Focus on the next step, not past mistakes.
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * RULES BY ELEMENT TYPE
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * PAGE TITLES
 * ───────────
 *  Rule: 1–3 words, plain noun or verb phrase. No jargon. No punctuation.
 *
 *  ✅ "Help Near Me"        ❌ "Resource Directory"
 *  ✅ "Check In"            ❌ "Compliance Submission"
 *  ✅ "My Plan"             ❌ "Goal Tracking Dashboard"
 *  ✅ "Messages"            ❌ "Communication Portal"
 *
 * SECTION LABELS  (all caps, small text, letter-spaced)
 * ──────────────
 *  Rule: Short noun phrase. Describes what's below, not what to do.
 *
 *  ✅ "Find help"           ❌ "Available Resources"
 *  ✅ "Your week"           ❌ "Weekly Compliance Metrics"
 *  ✅ "Right now"           ❌ "Immediate Action Items"
 *  ✅ "Start here"          ❌ "Recommended Next Steps"
 *
 * BUTTON LABELS
 * ─────────────
 *  Rule: Action verb + object. Max 4 words.
 *  Avoid: "Submit", "Okay", "Confirm", "Proceed", "Click here".
 *
 *  ✅ "Start My Plan →"     ❌ "Submit"
 *  ✅ "Keep going"          ❌ "Proceed to next step"
 *  ✅ "Done →"              ❌ "Confirm submission"
 *  ✅ "I was there ✓"       ❌ "Log Attendance"
 *  ✅ "Message support"     ❌ "Contact Your Care Team"
 *
 *  Primary CTA → add " →" suffix
 *  Success/completion → add " ✓" suffix
 *  Destructive actions → lowercase: "remove", "delete", "sign out"
 *
 * HELPER TEXT  (below headings or inputs)
 * ───────────
 *  Rule: One sentence. Reassuring, not instructional. Max 12 words.
 *
 *  ✅ "Wherever you are — that's a valid place to start."
 *  ✅ "You can change this any time."
 *  ❌ "Please complete all required fields before proceeding."
 *  ❌ "This information will be used to personalize your experience."
 *
 * EMPTY STATES
 * ────────────
 *  Rule: Two lines. Line 1 = plain observation. Line 2 = one low-pressure prompt.
 *
 *  ✅ "No messages yet."  /  "Your counselor's messages will show up here."
 *  ❌ "No data available."
 *  ❌ "You have not completed any check-ins."
 *
 * CHECK-IN & PROGRESS
 * ────────────────────
 *  Rule: Celebrate showing up — not outcomes. Avoid implying failure.
 *
 *  ✅ "You showed up today."          ❌ "Check-in complete."
 *  ✅ "X days in a row."              ❌ "X-day streak maintained."
 *  ✅ "Keep moving forward."          ❌ "Compliance: 100%"
 *  ✅ "Progress still counts."        ❌ "You are on track."
 *
 * CRISIS & SUPPORT
 * ─────────────────
 *  Rule: Brief. Direct. Non-judgmental. Never dramatic. Never minimizing.
 *
 *  ✅ "You are not alone right now."
 *  ✅ "Your safety matters most."
 *  ✅ "It sounds like things are hard right now."
 *  ❌ "Don't panic!"
 *  ❌ "This is a serious situation requiring immediate action."
 *
 *  Crisis numbers: always show number AND label.
 *  ✅ "988 — Crisis Line"     ❌ "988"
 *  ✅ "Text HOME to 741741"   ❌ "741741"
 *
 * REMINDERS & NOTIFICATIONS
 * ──────────────────────────
 *  Rule: One sentence, friendly, optional-feeling. No guilt. No urgency theater.
 *
 *  ✅ "Haven't checked in yet — it takes 30 seconds."
 *  ❌ "You have not submitted your daily check-in."
 *  ❌ "REMINDER: Required check-in overdue."
 *
 * ERROR MESSAGES
 * ──────────────
 *  Rule: What happened + what to do. No tech jargon. No blame.
 *
 *  ✅ "Something went wrong. Try again."
 *  ❌ "Error 500: Internal server error."
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * WORDS TO AVOID → USE INSTEAD
 * ═════════════════════════════════════════════════════════════════════════════
 *
 *  compliance           → check-in, tracking, staying on track
 *  submit               → done, save, send
 *  mandatory / required → (make it required silently — don't announce it)
 *  portal               → (drop it — just name the feature)
 *  user                 → you / your name
 *  module               → section, step
 *  case manager         → counselor, support contact
 *  violation            → missed, skipped
 *  addict / addiction   → person in recovery, recovery journey
 *  relapse              → setback, hard time, rough stretch
 *  treatment program    → treatment / program (either is fine)
 *
 * ═════════════════════════════════════════════════════════════════════════════
 */

export const COPY = {

  // ── Greetings ──────────────────────────────────────────────────────────────
  greeting: (hour) =>
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",

  // ── Check-in ───────────────────────────────────────────────────────────────
  checkin: {
    cta_title:    "Check in for today",
    cta_sub:      "30 seconds. No judgment.",
    done_title:   "You showed up today.",
    streak_many:  (n) => `${n} days in a row. Keep moving forward.`,
    streak_one:   "That's a real first step. Come back tomorrow.",
    progress_sub: "Progress still counts, even on hard days.",
    hard_day_msg: "Sounds like today was rough. You don't have to carry this alone — your support team is here.",
  },

  // ── Check-in questions ─────────────────────────────────────────────────────
  questions: {
    mood:        { title: "How are you feeling today?",           sub: "Wherever you are — that's a valid place to start." },
    meeting:     { title: "Did you go to a meeting today?",       sub: "AA, NA, SMART Recovery, or anything similar." },
    meetingType: { title: "What kind of meeting?",                sub: "Pick whichever fits best." },
    connect:     { title: "Did you connect with someone today?",  sub: "A sponsor, mentor, counselor, or someone you trust." },
    helpNeeded:  { title: "Do you need any support right now?",   sub: "It's okay either way. We just want to make sure you're alright." },
    notes:       { label: "Anything on your mind? (optional)",    placeholder: "Say whatever you need to say…" },
  },

  // ── Button labels ──────────────────────────────────────────────────────────
  buttons: {
    continue:        "Keep going",
    finish:          "Done →",
    save:            "Save",
    send:            "Send",
    back:            "Back",
    close:           "✕ Close",
    startPlan:       "Start My Plan →",
    iWasThere:       "I was there ✓",
    iWent:           "I went",
    messageSupport:  "Message support",
    findTreatment:   "Find Treatment",
    findMeeting:     "Find a meeting",
    signOut:         "Sign out",
    tryAgain:        "Try again",
    addNote:         "Add a note",
    viewAll:         "See all →",
  },

  // ── Section labels ─────────────────────────────────────────────────────────
  sections: {
    findHelp:         "Find help",
    yourWeek:         "Your week",
    keepMoving:       "Keep moving forward",
    rightNow:         "Right now",
    startHere:        "Start here",
    crisisSupport:    "Crisis support",
    alwaysFree:       "Always available — always free",
    suggestedForYou:  "Suggested for you",
    otherOptions:     "Other options",
    reachOutNow:      "Reach out now",
    anonymousSupport: "Anonymous support",
    findHelpNearYou:  "Find help near you",
    yourPlan:         "Your plan",
    recentActivity:   "Recent activity",
  },

  // ── Crisis language ────────────────────────────────────────────────────────
  crisis: {
    notAlone:     "You are not alone right now.",
    reachingOut:  "Reaching out is the right move.",
    safetyFirst:  "Your safety matters most.",
    ifDanger:     "If you are in immediate danger, call 911 now.",
    thingsHard:   "It sounds like things are hard right now.",
    rightPlace:   "You're in the right place.",
    call988:      "988 — Crisis Line",
    call988_sub:  "Free, confidential, 24/7",
    text741:      "Text HOME to 741741",
    text741_sub:  "Crisis Text Line — anonymous",
    samhsa:       "SAMHSA Helpline",
    samhsa_sub:   "1-800-662-4357 — treatment referrals",
    call211:      "Call 211",
    call211_sub:  "Local shelter, food & social services",
  },

  // ── Empty states ───────────────────────────────────────────────────────────
  empty: {
    noMessages:  { title: "No messages yet.",                  sub: "Your messages with your counselor and support team will show up here." },
    noResults:   { title: "Nothing matched that search.",      sub: "Try a wider radius or clear a filter to see more places." },
    noMeetings:  { title: "No meetings found with those filters.", sub: "Try changing the day or meeting type." },
    noPlan:      { title: "No plan yet.",                      sub: "Tap below to set up your goals and next steps." },
    noPosts:     { title: "Nothing here yet.",                 sub: "Be the first to post." },
  },

  // ── Loading / status ───────────────────────────────────────────────────────
  status: {
    loading:      "Finding places near you…",
    saving:       "Saving…",
    sending:      "Sending…",
    loading_generic: "Loading…",
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    generic:  "Something went wrong. Try again.",
    noLoad:   "We couldn't load that. Try pulling down to refresh.",
  },

  // ── Reminders ──────────────────────────────────────────────────────────────
  reminders: {
    checkIn:        "Haven't checked in yet — it takes 30 seconds.",
    tryMeeting:     "A meeting might help today.",
    connectSomeone: "Consider reaching out to someone today.",
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: "Unbound is a support tool, not a medical provider. In an emergency, call 911 or 988.",
};