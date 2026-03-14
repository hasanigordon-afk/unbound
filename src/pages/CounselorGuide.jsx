import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, Clock, Users, User, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  emerald: "#10B981",
  indigo:  "#5B6EF5",
  slate:   "rgba(255,255,255,0.60)",
  muted:   "rgba(255,255,255,0.30)",
};

const LESSONS = [
  {
    id: 1,
    title: "Introducing Unbound to Your Patients",
    emoji: "🌟",
    time: "10–15 min",
    mode: "Group or Individual",
    color: C.teal,
    objective: "Help patients understand what Unbound is and why it exists — without pressure.",
    whyItMatters: "Most patients leave treatment without a single digital support tool set up. By the time they want to use one, the window of motivation has often passed. Introducing the app while they're still in a structured environment significantly increases post-discharge engagement.",
    setup: [
      "Have patients open the app on their phones",
      "Show them the home screen — walk through what they see",
      "Explain: 'This is not treatment software. This is your personal aftercare tool.'",
      "Emphasize: the decision to use it is always theirs",
    ],
    groupPrompts: [
      "What would it feel like to have a support system that travels with you?",
      "If you had a bad day after discharge, what would you need access to?",
      "What did you wish you had the last time things got hard?",
    ],
    oneOnOnePrompts: [
      "What's your biggest fear about leaving here without a plan?",
      "Is there anything you wish you had access to when you're struggling at 2am?",
      "Let's look at the app together — what section would you use first?",
    ],
    counselorScript: "\"This app was built for people exactly like you — people who have been through treatment and want support after they leave. It's not a monitoring tool. No one is watching. It's yours. The check-ins, the resources, the community — all of it is optional and private.\"",
  },
  {
    id: 2,
    title: "Guided Profile Completion as a Group Activity",
    emoji: "✍️",
    time: "30–45 min",
    mode: "Group Session",
    color: C.gold,
    objective: "Guide patients through completing their identity profile as a reflective group exercise.",
    whyItMatters: "Identity confusion is one of the most underaddressed aspects of recovery. Patients often define themselves entirely by their addiction or incarceration. This activity helps them reconnect with who they were before — and who they want to become.",
    setup: [
      "Have each patient open their profile in the app",
      "Tell them: 'This is not about your struggles. It is about who you are.'",
      "Walk through each section one at a time",
      "Give 3–5 minutes per section for reflection and writing",
      "Invite (but never force) sharing with the group",
    ],
    groupPrompts: [
      "What do you want people to know about you that has nothing to do with addiction?",
      "What city, neighborhood, or place helped shape who you are?",
      "What places in your life bring you comfort and peace?",
      "What did you love doing before life got hard?",
      "What memory still makes you smile when you think about it?",
    ],
    oneOnOnePrompts: [
      "When you imagine your life going well — what does that actually look like day to day?",
      "Who were you before addiction became the loudest part of your story?",
      "What's one thing you want to get back in your life that you've been missing?",
    ],
    counselorScript: "\"I want you to fill this out as if you're introducing yourself to someone who doesn't know your struggles at all. Just you — who you are, where you come from, what you love. This is a reminder that you're a whole person with a whole history, not just a diagnosis.\"",
  },
  {
    id: 3,
    title: "The Daily Check-In: Building a New Habit",
    emoji: "📅",
    time: "15–20 min",
    mode: "Group or Individual",
    color: C.emerald,
    objective: "Demonstrate the daily check-in and help patients understand why consistent self-monitoring matters.",
    whyItMatters: "The daily check-in is the single most important habit in the app. Research consistently shows that daily self-monitoring of mood, cravings, and social contact significantly reduces relapse risk. Building this habit while in treatment makes it 3x more likely to continue after discharge.",
    setup: [
      "Walk patients through a mock check-in together",
      "Discuss what each question is measuring (mood, cravings, meetings, sponsor contact)",
      "Explain that check-in data is private — not shared with the facility",
      "Show them the streak counter and explain how it works",
    ],
    groupPrompts: [
      "What's one thing you check on your phone every day already?",
      "How might knowing your mood trends help you recognize a bad week earlier?",
      "What would it mean to have a 30-day streak when you leave here?",
    ],
    oneOnOnePrompts: [
      "When do you think would be the best time of day for your check-in?",
      "What would you do if you noticed your mood dropping for three days in a row?",
      "How does knowing someone is paying attention — even an app — change things for you?",
    ],
    counselorScript: "\"The check-in takes less than two minutes. It's not a test. There are no wrong answers. But over time, it creates a picture of your recovery — your mood trends, how often you're going to meetings, whether you're staying connected. That picture can save your life.\"",
  },
  {
    id: 4,
    title: "Resources & Practical Life Help",
    emoji: "🧭",
    time: "15–20 min",
    mode: "Group or Individual",
    color: C.indigo,
    objective: "Show patients how to use the app to find housing, employment, and benefit resources.",
    whyItMatters: "Practical barriers — housing, jobs, benefits — are among the top causes of relapse after discharge. Showing patients how to navigate these resources before they're in crisis increases utilization and reduces helplessness.",
    setup: [
      "Open the 'Find Help Now' section with patients",
      "Walk through housing, employment, and benefits categories",
      "Show how to search by location",
      "Demonstrate the 'Save Resource' feature",
    ],
    groupPrompts: [
      "What's the first practical challenge you expect to face when you leave here?",
      "Has anyone had trouble finding housing or work after a previous discharge? What would have helped?",
      "What resources did you wish you knew about before?",
    ],
    oneOnOnePrompts: [
      "Where are you planning to stay when you leave?",
      "What's the most important practical thing to figure out in the first 30 days?",
      "Let's look at what's available in your area together.",
    ],
    counselorScript: "\"This section is basically a guide to everything you might need in the real world — housing, jobs, food, legal help, benefits. We're going to look at it now so that when you leave here, you already know where to look. You don't have to figure this out alone.\"",
  },
  {
    id: 5,
    title: "Community & Connection: You're Not Alone",
    emoji: "🫂",
    time: "10–15 min",
    mode: "Group",
    color: "#A78BFA",
    objective: "Introduce the community section and help patients feel less isolated in their recovery.",
    whyItMatters: "Isolation is one of the most powerful triggers for relapse. Feeling connected to others who are on the same path — even anonymously — builds resilience and reduces shame.",
    setup: [
      "Open the Voices of Recovery section together",
      "Read a few posts out loud as a group (anonymous)",
      "Discuss how it feels to see others sharing honestly",
      "Encourage patients to post something — a milestone, a question, or encouragement",
    ],
    groupPrompts: [
      "What would it mean to you to know someone was cheering for you after you leave here?",
      "What's one thing you'd say to someone in recovery who was having a hard day?",
      "What's something you've learned in treatment that you wish someone had told you sooner?",
    ],
    oneOnOnePrompts: [
      "Do you have people in your life who understand what you've been through?",
      "Would it help to know there are others who feel exactly the way you do?",
      "What would you want to share with someone who just entered treatment?",
    ],
    counselorScript: "\"This community section is a place where real people share real moments from their recovery — wins, struggles, questions, encouragement. Everyone can post anonymously. It's not social media for validation. It's a space to be honest and to be reminded that you're not alone in this.\"",
  },
  {
    id: 6,
    title: "The Last Week — Discharge App Onboarding Checklist",
    emoji: "🏁",
    time: "45–60 min total (spread over final week)",
    mode: "Individual + Group",
    color: C.emerald,
    objective: "Ensure every patient leaves with the app set up, their profile complete, and their plan in place.",
    whyItMatters: "The transition from treatment to real life is the most vulnerable window. A patient who leaves with the app already set up, already feeling personal about it, and already knowing how to use it is dramatically more likely to use it when they need it most.",
    setup: [
      "Day 1 of last week: Introduce the app and guided profile setup (Lesson 1 + 2)",
      "Day 2: Walk through daily check-in habit (Lesson 3)",
      "Day 3: Explore resources together based on each patient's discharge plan (Lesson 4)",
      "Day 4: Community session and group post (Lesson 5)",
      "Day 5 (discharge day): Review profile completion, confirm app is installed and set up",
    ],
    groupPrompts: [
      "What's one thing you want to have figured out before you leave here?",
      "What support system are you leaving with?",
      "If things get hard in the first 30 days, what's your plan?",
    ],
    oneOnOnePrompts: [
      "Show me your app — let's make sure everything looks good before you go.",
      "You've done a lot of work here. What do you want to remember about this week when things get hard?",
      "Is there anything you still want to add to your profile before you leave?",
    ],
    counselorScript: "\"You've worked hard to get here. Now we want to make sure you leave with more than just a discharge summary. You're leaving with a tool that knows who you are, what you need, and where to find help. It's not a replacement for your support system — it's an addition to it.\"",
  },
];

function LessonCard({ lesson }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
      borderRadius:20, overflow:"hidden", marginBottom:14 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", padding:"18px 20px", background:"none", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
        <div style={{ width:46, height:46, borderRadius:14, flexShrink:0,
          background:`rgba(${lesson.color==="#3ECFBF"?"62,207,191":lesson.color==="#C9A96E"?"201,169,110":lesson.color==="#10B981"?"16,185,129":lesson.color==="#5B6EF5"?"91,110,245":"167,139,250"},0.12)`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          {lesson.emoji}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom:4 }}>{lesson.title}</p>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
              <Clock style={{ width:11, height:11 }}/>{lesson.time}
            </span>
            <span style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
              <Users style={{ width:11, height:11 }}/>{lesson.mode}
            </span>
          </div>
        </div>
        {open ? <ChevronUp style={{ width:18, height:18, color:C.muted, flexShrink:0 }}/> :
                <ChevronDown style={{ width:18, height:18, color:C.muted, flexShrink:0 }}/>}
      </button>

      {open && (
        <div style={{ padding:"0 20px 22px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <Section title="🎯 Objective">{lesson.objective}</Section>
          <Section title="🧠 Why This Matters Clinically">{lesson.whyItMatters}</Section>

          <Section title="⚙️ How to Run This Session">
            {lesson.setup.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`rgba(62,207,191,0.12)`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                  <span style={{ fontSize:11, fontWeight:900, color:C.teal }}>{i+1}</span>
                </div>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.6 }}>{s}</p>
              </div>
            ))}
          </Section>

          <Section title="👥 Group Discussion Prompts">
            {lesson.groupPrompts.map((p,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:i<lesson.groupPrompts.length-1?10:0 }}>
                <span style={{ color:C.gold, fontWeight:900, flexShrink:0 }}>•</span>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.6, fontStyle:"italic" }}>"{p}"</p>
              </div>
            ))}
          </Section>

          <Section title="🪑 One-on-One Prompts">
            {lesson.oneOnOnePrompts.map((p,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:i<lesson.oneOnOnePrompts.length-1?10:0 }}>
                <span style={{ color:"#A78BFA", fontWeight:900, flexShrink:0 }}>•</span>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.6, fontStyle:"italic" }}>"{p}"</p>
              </div>
            ))}
          </Section>

          <div style={{ background:"rgba(201,169,110,0.07)", border:"1px solid rgba(201,169,110,0.2)",
            borderRadius:14, padding:"14px 16px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.gold, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>💬 Counselor Script</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", lineHeight:1.65, fontStyle:"italic" }}>
              {lesson.counselorScript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop:18 }}>
      <p style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>{title}</p>
      {typeof children === "string"
        ? <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{children}</p>
        : children}
    </div>
  );
}

const CHECKLIST = [
  "Patient has downloaded and opened the app",
  "Profile completion > 60%",
  "About Me section filled out",
  "At least one hobby or interest added",
  "Goals & Motivation section completed",
  "Daily check-in demonstrated",
  "Resources section explored (housing, jobs, or benefits)",
  "Community section introduced",
  "Patient knows how to access support through the app",
  "Patient leaves feeling the app is personal to them",
];

export default function CounselorGuide() {
  const [checks, setChecks] = useState({});
  const [tab, setTab] = useState("lessons");

  const toggle = (i) => setChecks(c => ({ ...c, [i]: !c[i] }));
  const checked = Object.values(checks).filter(Boolean).length;

  return (
    <div style={{ background:`linear-gradient(170deg,#070D1C 0%,#0B1424 60%,#080E1C 100%)`, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* Header */}
        <div style={{ position:"relative", overflow:"hidden", borderRadius:"0 0 28px 28px",
          background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)",
          padding:"64px 24px 32px", margin:"0 -16px 24px" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <Link to={createPageUrl("Profile")} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
              <ArrowLeft style={{ width:16, height:16, color:C.teal }}/><span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>Back</span>
            </Link>
            <p style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>For Counselors & Facilitators</p>
            <h1 style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1.2, marginBottom:10 }}>
              Aftercare App Teaching Guide
            </h1>
            <p style={{ fontSize:14, color:C.slate, lineHeight:1.6 }}>
              A structured guide for introducing Unbound to patients during treatment — especially in the final week before discharge.
            </p>
          </div>
        </div>

        {/* Purpose banner */}
        <div style={{ background:"rgba(62,207,191,0.07)", border:"1px solid rgba(62,207,191,0.2)",
          borderRadius:20, padding:"18px 20px", marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:800, color:C.teal, marginBottom:8 }}>Why Use This Guide?</p>
          <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>
            Patients who are introduced to a digital aftercare tool <strong style={{color:"#fff"}}>while still in treatment</strong> are significantly more likely to use it after discharge.
            This guide gives you structured lessons, discussion prompts, and scripts to make that introduction meaningful — not just a sign-up form.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"4px", marginBottom:20 }}>
          {[
            { id:"lessons", label:"Lesson Plans" },
            { id:"checklist", label:"Discharge Checklist" },
            { id:"framing", label:"How to Frame It" },
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer",
              background: tab===t.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab===t.id ? "#fff" : C.muted, fontWeight:700, fontSize:12,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── LESSONS TAB ─────────────────────────────────────── */}
        {tab === "lessons" && (
          <div>
            <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
              Six structured lessons designed for group sessions, individual meetings, or self-paced completion. Click any lesson to expand the full guide.
            </p>
            {LESSONS.map(lesson => <LessonCard key={lesson.id} lesson={lesson}/>)}
          </div>
        )}

        {/* ── CHECKLIST TAB ───────────────────────────────────── */}
        {tab === "checklist" && (
          <div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
              borderRadius:20, padding:"20px 18px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>Discharge Readiness Checklist</p>
                <span style={{ fontSize:20, fontWeight:900, color:C.teal }}>{checked}/{CHECKLIST.length}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:6, overflow:"hidden", marginBottom:18 }}>
                <div style={{ height:"100%", borderRadius:6, width:`${(checked/CHECKLIST.length)*100}%`,
                  background:`linear-gradient(90deg,${C.teal},#2CB8AE)`, transition:"width 0.4s ease" }}/>
              </div>
              {CHECKLIST.map((item, i) => (
                <button key={i} onClick={()=>toggle(i)}
                  style={{ width:"100%", background:"none", border:"none", padding:"10px 0", cursor:"pointer",
                    display:"flex", alignItems:"flex-start", gap:12, borderBottom: i<CHECKLIST.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    textAlign:"left" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
                    background: checks[i] ? `rgba(16,185,129,0.15)` : "rgba(255,255,255,0.06)",
                    border:`1.5px solid ${checks[i] ? C.emerald : "rgba(255,255,255,0.15)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {checks[i] && <CheckCircle2 style={{ width:13, height:13, color:C.emerald }}/>}
                  </div>
                  <p style={{ fontSize:14, color: checks[i] ? C.emerald : C.slate, lineHeight:1.5,
                    textDecoration: checks[i] ? "line-through" : "none" }}>
                    {item}
                  </p>
                </button>
              ))}
            </div>
            {checked === CHECKLIST.length && (
              <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
                borderRadius:16, padding:"16px 18px", textAlign:"center" }}>
                <p style={{ fontSize:16, fontWeight:800, color:C.emerald }}>🎉 Patient is discharge-ready!</p>
                <p style={{ fontSize:13, color:C.slate, marginTop:6 }}>They're leaving with a real aftercare tool already introduced.</p>
              </div>
            )}
          </div>
        )}

        {/* ── FRAMING TAB ─────────────────────────────────────── */}
        {tab === "framing" && (
          <div>
            {[
              {
                title: "How to Position the App",
                color: C.teal,
                items: [
                  "\"This is a tool you can choose to keep using. It's yours — not the facility's.\"",
                  "\"No one monitors you through this app. Your check-ins are private.\"",
                  "\"Think of it as a support system that travels with you.\"",
                  "\"This isn't about surveillance — it's about giving you something real to lean on.\"",
                ],
              },
              {
                title: "What to Avoid Saying",
                color: "#EF4444",
                items: [
                  "Don't say it will notify the facility if they relapse — it doesn't",
                  "Don't frame it as required or mandatory",
                  "Don't focus on monitoring or compliance language",
                  "Don't rush through it — let it feel personal",
                ],
              },
              {
                title: "What Patients Need to Hear",
                color: C.gold,
                items: [
                  "\"You are more than your addiction.\"",
                  "\"Your identity, your goals, and your roots all matter.\"",
                  "\"This app remembers who you are — not just what you're recovering from.\"",
                  "\"You leave here with a tool that already knows your name and your story.\"",
                ],
              },
              {
                title: "When to Introduce the App",
                color: C.emerald,
                items: [
                  "Ideal: The final week of treatment",
                  "Also good: 2–3 weeks before discharge during group",
                  "One-on-one: Any time during the final phase",
                  "Goal: Patient leaves with profile at least 60% complete",
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
                borderRadius:18, padding:"18px 18px", marginBottom:14 }}>
                <p style={{ fontSize:14, fontWeight:800, color:section.color, marginBottom:14 }}>{section.title}</p>
                {section.items.map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:i<section.items.length-1?10:0 }}>
                    <span style={{ color:section.color, fontWeight:900, flexShrink:0, marginTop:2 }}>•</span>
                    <p style={{ fontSize:14, color:C.slate, lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}